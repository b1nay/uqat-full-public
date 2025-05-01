
import os
import torch
import pandas as pd
import numpy as np
from pathlib import Path
from typing import List, Dict, Optional, Union
import logging
import argparse
import random
from tqdm import tqdm

# Hugging Face imports
from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    Trainer,
    TrainingArguments,
    set_seed,
    DataCollatorForLanguageModeling,
    TextDataset,
)
from datasets import Dataset, load_dataset
from peft import (
    get_peft_model,
    LoraConfig,
    TaskType,
    prepare_model_for_kbit_training,
    PeftModel,
)
import bitsandbytes as bnb

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(_name_)

def parse_arguments():
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(description="Fine-tune TinyLlama with PEFT/LoRA")
    
    # Model and data paths
    parser.add_argument("--model_name", type=str, default="TinyLlama/TinyLlama-1.1B-Chat-v1.0",
                      help="Base model to fine-tune")
    parser.add_argument("--policy_path", type=str, required=True,
                      help="Path to policy.txt file")
    parser.add_argument("--qna_path", type=str, required=True,
                      help="Path to QnA.csv file")
    parser.add_argument("--output_dir", type=str, default="./tinyllama-security-finetuned",
                      help="Directory to save the fine-tuned model")
    
    # Training parameters
    parser.add_argument("--seed", type=int, default=42, help="Random seed")
    parser.add_argument("--epochs", type=int, default=3, help="Number of training epochs")
    parser.add_argument("--batch_size", type=int, default=8, help="Training batch size")
    parser.add_argument("--learning_rate", type=float, default=3e-4, help="Learning rate")
    parser.add_argument("--max_seq_length", type=int, default=512,
                      help="Maximum sequence length for training")
    parser.add_argument("--gradient_accumulation_steps", type=int, default=2,
                      help="Number of gradient accumulation steps")
    
    # LoRA parameters
    parser.add_argument("--lora_r", type=int, default=16, 
                      help="LoRA attention dimension")
    parser.add_argument("--lora_alpha", type=int, default=32, 
                      help="LoRA alpha parameter")
    parser.add_argument("--lora_dropout", type=float, default=0.05, 
                      help="LoRA attention dropout")
    
    # Quantization
    parser.add_argument("--use_4bit", action="store_true", 
                      help="Use 4-bit quantization to reduce memory usage")
    
    # Evaluation parameters
    parser.add_argument("--eval_steps", type=int, default=200, 
                      help="Number of steps between evaluations")
    
    return parser.parse_args()

def read_policy_file(file_path: str) -> List[str]:
    """Read policy document and split into chunks."""
    with open(file_path, 'r', encoding='utf-8') as f:
        text = f.read()
    
    # Split into chunks of roughly equal size
    # This is a simple approach - more sophisticated chunking could be used
    paragraphs = text.split('\n\n')
    paragraphs = [p.strip() for p in paragraphs if p.strip()]
    
    return paragraphs

def read_qna_file(file_path: str) -> List[Dict[str, str]]:
    """Read QnA pairs from CSV file."""
    df = pd.read_csv(file_path)
    
    # Ensure required columns exist
    required_cols = ['question', 'answer']
    if not all(col in df.columns for col in required_cols):
        missing = [col for col in required_cols if col not in df.columns]
        raise ValueError(f"Missing required columns in QnA file: {missing}")
    
    # Extract QnA pairs
    qna_pairs = []
    for _, row in df.iterrows():
        question = row['question']
        answer = row['answer']
        if pd.notna(question) and pd.notna(answer):
            qna_pairs.append({
                'question': question.strip(),
                'answer': answer.strip()
            })
    
    return qna_pairs

def prepare_training_data(
    policy_chunks: List[str], 
    qna_pairs: List[Dict[str, str]],
    tokenizer,
    max_length: int = 512
) -> Dataset:
    """Prepare training data in a format suitable for the model."""
    # Format policy chunks
    policy_texts = []
    for chunk in policy_chunks:
        text = f"### Instruction: Explain the following security policy guideline.\n\n### Input: {chunk}\n\n### Response: {chunk}"
        policy_texts.append(text)
    
    # Format QnA pairs
    qna_texts = []
    for pair in qna_pairs:
        text = f"### Instruction: Answer the following security compliance question.\n\n### Input: {pair['question']}\n\n### Response: {pair['answer']}"
        qna_texts.append(text)
    
    # Combine and shuffle
    all_texts = policy_texts + qna_texts
    random.shuffle(all_texts)
    
    # Tokenize
    tokenized_data = []
    for text in all_texts:
        tokens = tokenizer(
            text,
            truncation=True,
            max_length=max_length,
            padding="max_length",
            return_tensors="pt"
        )
        tokenized_data.append({
            "input_ids": tokens["input_ids"][0],
            "attention_mask": tokens["attention_mask"][0],
            "labels": tokens["input_ids"][0].clone()  # For causal LM, labels = input_ids
        })
    
    # Create dataset
    dataset = Dataset.from_list(tokenized_data)
    return dataset

def prepare_model_for_training(args):
    """Prepare the model and tokenizer for fine-tuning."""
    # Load tokenizer
    tokenizer = AutoTokenizer.from_pretrained(args.model_name)
    tokenizer.pad_token = tokenizer.eos_token
    
    # Load model with quantization if specified
    if args.use_4bit:
        # 4-bit quantization for memory efficiency
        model = AutoModelForCausalLM.from_pretrained(
            args.model_name,
            load_in_4bit=True,
            torch_dtype=torch.bfloat16,
            device_map="auto",
            quantization_config=bnb.nn.modules.Params4bit(
                compute_dtype=torch.bfloat16,
                quant_type="nf4"
            )
        )
        model = prepare_model_for_kbit_training(model)
    else:
        # Regular loading
        model = AutoModelForCausalLM.from_pretrained(
            args.model_name,
            torch_dtype=torch.float16,
            device_map="auto"
        )
    
    # Configure LoRA
    peft_config = LoraConfig(
        task_type=TaskType.CAUSAL_LM,
        inference_mode=False,
        r=args.lora_r,
        lora_alpha=args.lora_alpha,
        lora_dropout=args.lora_dropout,
        target_modules=["q_proj", "k_proj", "v_proj", "o_proj"]
    )
    
    # Wrap model with LoRA
    model = get_peft_model(model, peft_config)
    model.print_trainable_parameters()
    
    return model, tokenizer

def create_trainer(
    model,
    tokenizer,
    train_dataset,
    eval_dataset,
    args
):
    """Create a Trainer for model fine-tuning."""
    training_args = TrainingArguments(
        output_dir=args.output_dir,
        num_train_epochs=args.epochs,
        per_device_train_batch_size=args.batch_size,
        gradient_accumulation_steps=args.gradient_accumulation_steps,
        per_device_eval_batch_size=args.batch_size,
        evaluation_strategy="steps",
        eval_steps=args.eval_steps,
        logging_dir=f"{args.output_dir}/logs",
        logging_steps=10,
        save_strategy="steps",
        save_steps=args.eval_steps,
        learning_rate=args.learning_rate,
        weight_decay=0.01,
        fp16=True,
        bf16=False,
        max_grad_norm=0.3,
        max_steps=-1,
        warmup_ratio=0.03,
        group_by_length=True,
        lr_scheduler_type="cosine",
        report_to="tensorboard",
        seed=args.seed
    )
    
    # Create data collator
    data_collator = DataCollatorForLanguageModeling(
        tokenizer=tokenizer,
        mlm=False  # causal language modeling
    )
    
    # Create trainer
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=train_dataset,
        eval_dataset=eval_dataset,
        data_collator=data_collator,
        tokenizer=tokenizer,
    )
    
    return trainer

def main():
    """Main function."""
    # Parse arguments
    args = parse_arguments()
    
    # Set random seed
    set_seed(args.seed)
    
    # Read data
    logger.info(f"Reading policy file from {args.policy_path}")
    policy_chunks = read_policy_file(args.policy_path)
    logger.info(f"Read {len(policy_chunks)} policy chunks")
    
    logger.info(f"Reading QnA file from {args.qna_path}")
    qna_pairs = read_qna_file(args.qna_path)
    logger.info(f"Read {len(qna_pairs)} QnA pairs")
    
    # Prepare model and tokenizer
    logger.info(f"Loading model {args.model_name}")
    model, tokenizer = prepare_model_for_training(args)
    
    # Prepare training data
    logger.info("Preparing training data")
    full_dataset = prepare_training_data(
        policy_chunks, qna_pairs, tokenizer, args.max_seq_length
    )
    
    # Split into train and eval
    split_dataset = full_dataset.train_test_split(test_size=0.1)
    train_dataset = split_dataset["train"]
    eval_dataset = split_dataset["test"]
    
    logger.info(f"Training on {len(train_dataset)} examples, evaluating on {len(eval_dataset)} examples")
    
    # Create trainer
    trainer = create_trainer(
        model, tokenizer, train_dataset, eval_dataset, args
    )
    
    # Train the model
    logger.info("Starting training")
    trainer.train()
    
    # Save the model
    logger.info(f"Saving model to {args.output_dir}")
    model.save_pretrained(args.output_dir)
    tokenizer.save_pretrained(args.output_dir)
    
    logger.info("Training complete!")

if _name_ == "_main_":
    main()
