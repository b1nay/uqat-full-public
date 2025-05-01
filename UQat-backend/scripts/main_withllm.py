import os
import pandas as pd
import numpy as np
from pathlib import Path
from sentence_transformers import SentenceTransformer
import torch
import re
from typing import List, Dict, Tuple
from tqdm import tqdm
import pickle
from sklearn.metrics.pairwise import cosine_similarity
from transformers import AutoModelForCausalLM, AutoTokenizer
import warnings
warnings.filterwarnings('ignore')

# Paths
POLICY_DIR = Path("../datasets/policies/txt")
QUESTIONNAIRE_PATH = Path("../datasets/just_questionnaires/Questionaires - Questionnaire 1.csv")
KB_PATH = Path("../datasets/QandApair.csv")
OUTPUT_DIR = Path("../datasets/output")
MODEL_DIR = Path("../models")

# Create directories if they don't exist
OUTPUT_DIR.mkdir(exist_ok=True, parents=True)
MODEL_DIR.mkdir(exist_ok=True, parents=True)

# Paths for saved models and data
EMBEDDINGS_PATH = MODEL_DIR / "embeddings.pkl"
CHUNKS_PATH = MODEL_DIR / "chunks.pkl"
CHUNK_SOURCES_PATH = MODEL_DIR / "chunk_sources.pkl"
LLM_MODEL_NAME = "TinyLlama/TinyLlama-1.1B-Chat-v1.0"  # Small enough for MacBook
LLM_MODEL_PATH = MODEL_DIR / "llm_model"
LLM_TOKENIZER_PATH = MODEL_DIR / "llm_tokenizer"

# Global model instances
model = None
llm_model = None
llm_tokenizer = None

def get_embedding_model():
   """Load or initialize the embedding model"""
   global model
   if model is None:
       print("Loading embedding model...")
       model = SentenceTransformer('all-MiniLM-L6-v2')
   return model

def get_llm():
   """Load or download LLM model and tokenizer"""
   global llm_model, llm_tokenizer
   
   if llm_model is None or llm_tokenizer is None:
       print("Loading LLM model and tokenizer...")
       
       # Check if model is already downloaded
       if LLM_MODEL_PATH.exists() and LLM_TOKENIZER_PATH.exists():
           try:
               llm_tokenizer = AutoTokenizer.from_pretrained(str(LLM_TOKENIZER_PATH))
               llm_model = AutoModelForCausalLM.from_pretrained(
                   str(LLM_MODEL_PATH),
                   torch_dtype=torch.float16,
                   low_cpu_mem_usage=True
               )
               print("Loaded LLM from local storage")
           except Exception as e:
               print(f"Error loading local model: {e}. Downloading from HuggingFace...")
               llm_tokenizer = AutoTokenizer.from_pretrained(LLM_MODEL_NAME)
               llm_model = AutoModelForCausalLM.from_pretrained(
                   LLM_MODEL_NAME,
                   torch_dtype=torch.float16,
                   low_cpu_mem_usage=True
               )
               
               # Save for future use
               llm_tokenizer.save_pretrained(str(LLM_TOKENIZER_PATH))
               llm_model.save_pretrained(str(LLM_MODEL_PATH))
       else:
           llm_tokenizer = AutoTokenizer.from_pretrained(LLM_MODEL_NAME)
           llm_model = AutoModelForCausalLM.from_pretrained(
               LLM_MODEL_NAME,
               torch_dtype=torch.float16,
               low_cpu_mem_usage=True
           )
           
           # Save for future use
           LLM_MODEL_PATH.mkdir(exist_ok=True, parents=True)
           LLM_TOKENIZER_PATH.mkdir(exist_ok=True, parents=True)
           llm_tokenizer.save_pretrained(str(LLM_TOKENIZER_PATH))
           llm_model.save_pretrained(str(LLM_MODEL_PATH))
   
   return llm_model, llm_tokenizer

def generate_llm_response(question, context, max_length=512):
   """Generate a response using the LLM based on question and context"""
   model, tokenizer = get_llm()
   
   # Create prompt
   prompt = f"""You are a security compliance assistant. Answer the following question based on the provided context.
   
Context:
{context}

Question: {question}

Answer:"""
   
   # Generate response
   inputs = tokenizer(prompt, return_tensors="pt")
   
   with torch.no_grad():
       outputs = model.generate(
           **inputs,
           max_new_tokens=max_length,
           temperature=0.7,
           top_p=0.9,
           do_sample=True
       )
   
   response = tokenizer.decode(outputs[0], skip_special_tokens=True)
   
   # Extract just the answer part
   if "Answer:" in response:
       response = response.split("Answer:")[1].strip()
   
   return response

# Function to chunk text with overlap
def chunk_text(text: str, chunk_size: int = 512, overlap: int = 100) -> List[str]:
   """Split text into overlapping chunks."""
   sentences = re.split(r'(?<=[.!?])\s+', text)
   chunks = []
   
   current_chunk = []
   current_length = 0
   
   for sentence in sentences:
       # If adding this sentence would exceed chunk size and we have content
       if current_length + len(sentence) > chunk_size and current_chunk:
           # Save the current chunk
           chunk_text = " ".join(current_chunk)
           chunks.append(chunk_text)
           
           # Keep some sentences for overlap
           overlap_sentences = current_chunk[-3:] if len(current_chunk) > 3 else current_chunk
           current_chunk = overlap_sentences
           current_length = sum(len(s) for s in current_chunk)
       
       current_chunk.append(sentence)
       current_length += len(sentence)
   
   # Don't forget the last chunk
   if current_chunk:
       chunks.append(" ".join(current_chunk))
   
   return chunks

# Check if saved data exists
def check_saved_data():
   """Check if we have previously saved data"""
   return (EMBEDDINGS_PATH.exists() and 
           CHUNKS_PATH.exists() and 
           CHUNK_SOURCES_PATH.exists())

# Save data
def save_data(embeddings, all_chunks, chunk_sources):
   """Save embeddings, chunks, and sources to disk"""
   print("Saving data...")
   
   with open(EMBEDDINGS_PATH, 'wb') as f:
       pickle.dump(embeddings, f)
   
   with open(CHUNKS_PATH, 'wb') as f:
       pickle.dump(all_chunks, f)
       
   with open(CHUNK_SOURCES_PATH, 'wb') as f:
       pickle.dump(chunk_sources, f)
       
   print(f"Saved data to {MODEL_DIR}")

# Load data
def load_data():
   """Load embeddings, chunks, and sources from disk"""
   print("Loading saved data...")
   
   with open(EMBEDDINGS_PATH, 'rb') as f:
       embeddings = pickle.load(f)
       
   with open(CHUNKS_PATH, 'rb') as f:
       all_chunks = pickle.load(f)
       
   with open(CHUNK_SOURCES_PATH, 'rb') as f:
       chunk_sources = pickle.load(f)
       
   print(f"Loaded {len(all_chunks)} chunks from saved data")
   return embeddings, all_chunks, chunk_sources

# Process policy documents
def process_documents():
   """Process all policy documents and create searchable chunks."""
   # Check if we can load from saved data
   if check_saved_data():
       return load_data()
   
   print("No saved data found. Processing documents...")
   model = get_embedding_model()
   all_chunks = []
   chunk_sources = []
   
   # Process each text file
   for txt_file in tqdm(list(POLICY_DIR.glob("*.txt")), desc="Processing policy documents"):
       policy_name = txt_file.stem
       try:
           with open(txt_file, 'r', encoding='utf-8') as f:
               content = f.read()
               
           # Create chunks with overlap
           chunks = chunk_text(content)
           
           for i, chunk in enumerate(chunks):
               all_chunks.append(chunk)
               chunk_sources.append({
                   'source': policy_name,
                   'chunk_id': i,
                   'type': 'policy'
               })
       except Exception as e:
           print(f"Error processing {policy_name}: {e}")
   
   # Process knowledge base using the specific format
   try:
       kb_df = pd.read_csv(KB_PATH)
       for i, row in tqdm(kb_df.iterrows(), desc="Processing KB", total=len(kb_df)):
           # Handle potentially missing data
           question = row.get('question', '')
           answer = row.get('answer', '')
           
           # Skip empty entries
           if not question or pd.isna(question):
               continue
               
           # Format QA text
           qa_text = f"Q: {question}"
           if answer and not pd.isna(answer):
               qa_text += f" A: {answer}"
               
           all_chunks.append(qa_text)
           chunk_sources.append({
               'source': 'Knowledge Base',
               'chunk_id': i,
               'type': 'qa',
               'question': question,
               'answer': answer,
               'category': row.get('category', ''),
               'details': row.get('details', '') if not pd.isna(row.get('details', '')) else ''
           })
   except Exception as e:
       print(f"Error processing knowledge base: {e}")
   
   # Create embeddings
   print("Creating embeddings...")
   chunk_embeddings = model.encode(all_chunks, show_progress_bar=True)
   
   # Save data for future use
   save_data(chunk_embeddings, all_chunks, chunk_sources)
   
   return chunk_embeddings, all_chunks, chunk_sources

# Function to get top results for a query using cosine similarity
def get_top_results(query: str, embeddings, all_chunks: List[str], chunk_sources: List[Dict], top_k: int = 5) -> List[Dict]:
   """Retrieve top matching chunks for a query using cosine similarity."""
   model = get_embedding_model()
   query_embedding = model.encode([query])
   
   # Calculate cosine similarity
   similarities = cosine_similarity(query_embedding, embeddings)[0]
   
   # Get top k indices
   top_indices = np.argsort(-similarities)[:top_k]
   
   results = []
   for idx in top_indices:
       if idx < len(all_chunks):  # Safety check
           source_info = chunk_sources[idx].copy()
           chunk_text = all_chunks[idx]
           
           # Similarity score as confidence
           confidence = float(similarities[idx])
           
           results.append({
               'chunk': chunk_text,
               'confidence': round(confidence, 2),
               'source_info': source_info
           })
   
   return results

# Process questionnaire
def process_questionnaire(questionnaire_path: Path, embeddings, all_chunks: List[str], chunk_sources: List[Dict], max_questions=None, use_llm=True):
   """Process a questionnaire and generate answers with confidence scores."""
   try:
       # Check if output already exists for this questionnaire
       output_filename = f"filled_{questionnaire_path.stem}.csv"
       if max_questions:
           output_filename = f"filled_{questionnaire_path.stem}_top{max_questions}.csv"
       if use_llm:
           output_filename = f"llm_{output_filename}"
           
       output_path = OUTPUT_DIR / output_filename
       
       if output_path.exists():
           print(f"Output file {output_filename} already exists. Skipping processing.")
           return pd.read_csv(output_path)
       
       # Load questionnaire
       if questionnaire_path.suffix == '.csv':
           questionnaire = pd.read_csv(questionnaire_path)
       elif questionnaire_path.suffix in ['.xlsx', '.xls']:
           questionnaire = pd.read_excel(questionnaire_path)
       else:
           raise ValueError(f"Unsupported file format: {questionnaire_path.suffix}")
       
       # Identify question column
       question_col = None
       possible_cols = ['Questions', 'Question', 'questions', 'question']
       for col in possible_cols:
           if col in questionnaire.columns:
               question_col = col
               break
       
       if not question_col:
           raise ValueError(f"Could not find question column in {questionnaire_path.name}")
       
       # Limit number of questions if specified
       if max_questions and max_questions > 0:
           questionnaire = questionnaire.head(max_questions)
           print(f"Processing only the first {max_questions} questions")
       
       # Create results dataframe
       results = []
       
       # Process each question
       for i, row in tqdm(questionnaire.iterrows(), desc=f"Processing {questionnaire_path.name}", total=len(questionnaire)):
           question = row[question_col]
           if pd.isna(question) or not question:
               continue  # Skip empty questions
               
           # Get top results
           top_results = get_top_results(question, embeddings, all_chunks, chunk_sources, top_k=3)
           
           if not top_results:
               results.append({
                   'Question': question,
                   'Answer': 'No relevant information found',
                   'Confidence': 0.0,
                   'Source': 'N/A',
                   'Justification': 'No relevant information found in the knowledge base',
                   'Top_Chunk': '',
                   'Response_LLM': 'No context available for LLM response' if use_llm else ''
               })
               continue
           
           top_result = top_results[0]  # Best match
           
           # Format answer differently based on source type
           source_info = top_result['source_info']
           source_type = source_info.get('type', 'unknown')
           
           if source_type == 'qa':
               # If it's from KB, use the answer directly
               answer = str(source_info.get('answer', 'No answer available'))
               source = f"Knowledge Base: {source_info.get('category', 'General')}"
               
               # Handle details safely
               details = source_info.get('details', '')
               if details and not pd.isna(details) and isinstance(details, str):
                   answer += f" Details: {details}"
           else:
               # If it's from policy document, use the chunk as context
               answer = top_result['chunk']
               source = f"Policy: {source_info.get('source', 'Unknown')}"
           
           # Generate justification
           justification = f"This answer is derived from {source} with a confidence of {top_result['confidence']:.2f}."
           if len(top_results) > 1:
               justification += f" Alternative sources include {top_results[1]['source_info'].get('source', 'Unknown')}."
           
           # Generate LLM response if requested
           llm_response = ""
           if use_llm:
               # Combine the top 2 chunks for better context
               context = top_result['chunk']
               if len(top_results) > 1:
                   context += "\n\n" + top_results[1]['chunk']
               
               llm_response = generate_llm_response(question, context)
           
           results.append({
               'Question': question,
               'Answer': answer,
               'Confidence': top_result['confidence'],
               'Source': source,
               'Justification': justification,
               'Top_Chunk': top_result['chunk'],
               'Response_LLM': llm_response if use_llm else ''
           })
       
       # Create DataFrame and save results
       results_df = pd.DataFrame(results)
       results_df.to_csv(output_path, index=False)
       print(f"Processed questionnaire saved to {output_path}")
       
       return results_df
       
   except Exception as e:
       print(f"Error processing questionnaire {questionnaire_path.name}: {str(e)}")
       import traceback
       traceback.print_exc()
       return None

# Function to process a single question (for conversational mode)
def process_single_question(question: str, embeddings, all_chunks: List[str], chunk_sources: List[Dict], use_llm=True):
   """Process a single question and return the answer (for conversational mode)"""
   if not question:
       return {
           'answer': 'Please provide a question.',
           'confidence': 0.0,
           'source': 'N/A',
           'llm_response': '' if use_llm else None
       }
   
   # Get top results
   top_results = get_top_results(question, embeddings, all_chunks, chunk_sources, top_k=3)
   
   if not top_results:
       return {
           'answer': 'No relevant information found',
           'confidence': 0.0,
           'source': 'N/A',
           'llm_response': 'No context available for LLM response' if use_llm else None
       }
   
   top_result = top_results[0]  # Best match
   
   # Format answer differently based on source type
   source_info = top_result['source_info']
   source_type = source_info.get('type', 'unknown')
   
   if source_type == 'qa':
       # If it's from KB, use the answer directly
       answer = str(source_info.get('answer', 'No answer available'))
       source = f"Knowledge Base: {source_info.get('category', 'General')}"
       
       # Handle details safely
       details = source_info.get('details', '')
       if details and not pd.isna(details) and isinstance(details, str):
           answer += f" Details: {details}"
   else:
       # If it's from policy document, use the chunk as context
       answer = top_result['chunk']
       source = f"Policy: {source_info.get('source', 'Unknown')}"
   
   # Generate LLM response if requested
   llm_response = None
   if use_llm:
       # Combine the top 2 chunks for better context
       context = top_result['chunk']
       if len(top_results) > 1:
           context += "\n\n" + top_results[1]['chunk']
       
       llm_response = generate_llm_response(question, context)
   
   return {
       'answer': answer,
       'confidence': top_result['confidence'],
       'source': source,
       'context': top_result['chunk'],
       'llm_response': llm_response
   }

# Main function
def main():
   # Initialize the embedding model once at startup
   get_embedding_model()
   
   # Process documents and create embeddings (or load from disk)
   embeddings, all_chunks, chunk_sources = process_documents()
   print(f"Ready with {len(all_chunks)} chunks from policies and knowledge base")
   
   # Load the LLM (this will download it if not present)
   get_llm()
   
   # Process the questionnaire with a limit of 10 questions and LLM responses
   process_questionnaire(QUESTIONNAIRE_PATH, embeddings, all_chunks, chunk_sources, max_questions=10, use_llm=True)
   
   # Example of conversational mode usage
   print("\n--- Interactive Mode ---")
   print("Type a question (or 'exit' to quit)")
   
   while True:
       user_input = input("\nQuestion: ")
       if user_input.lower() in ['exit', 'quit', 'q']:
           break
           
       result = process_single_question(user_input, embeddings, all_chunks, chunk_sources, use_llm=True)
       print(f"\nAnswer from Knowledge Base: {result['answer']}")
       print(f"Confidence: {result['confidence']:.2f}")
       print(f"Source: {result['source']}")
       print(f"\nLLM Response: {result['llm_response']}")

if __name__ == "__main__":
   main()