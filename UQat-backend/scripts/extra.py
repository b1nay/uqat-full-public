# Standard Library
import os
import time
import logging
import traceback
import warnings
import re
import io
import pickle
from pathlib import Path
from datetime import datetime, timedelta
from typing import List, Dict, Tuple, Optional

# Third-Party Libraries
import numpy as np
import pandas as pd
import torch
from tqdm import tqdm
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from transformers import AutoModelForCausalLM, AutoTokenizer

from fastapi import (
    FastAPI, HTTPException, File, UploadFile, Form,
    Depends, status, Query
)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from pydantic import BaseModel
import uvicorn

# Local Modules
from database import SessionLocal, engine, Base
from models import User, Chat
from schemas import UserCreate, UserLogin, Token, UserOut, Message, ChatHistory
from auth_utils import hash_password, verify_password
from auth_token import create_access_token, get_current_user, ACCESS_TOKEN_EXPIRE_MINUTES

# import os
# import time
# import pandas as pd
# import numpy as np
# from pathlib import Path
# from sentence_transformers import SentenceTransformer
# import torch
# import re
# from typing import List, Dict, Tuple, Optional
# from tqdm import tqdm
# import pickle
# from sklearn.metrics.pairwise import cosine_similarity
# from transformers import AutoModelForCausalLM, AutoTokenizer
# import warnings
# from fastapi import FastAPI, HTTPException, File, UploadFile, Form
# from fastapi.middleware.cors import CORSMiddleware
# import logging
# import traceback

# from fastapi.responses import FileResponse
# from pydantic import BaseModel
# import uvicorn
# import io
# from models import User, Chat
# from schemas import UserCreate, UserLogin, Token, UserOut, Message, ChatHistory

# ###IMPORTS START HERE FOR AUTH###



# from fastapi import FastAPI, HTTPException, File, UploadFile, Form, Depends, status, Query
# from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
# from fastapi.middleware.cors import CORSMiddleware
# from sqlalchemy.orm import Session
# from datetime import timedelta
# import os
# import time
# import pandas as pd
# import numpy as np
# from pathlib import Path
# from typing import List, Dict, Tuple, Optional
# import logging
# import traceback
# from fastapi import FastAPI, Depends, HTTPException

# from database import SessionLocal, engine
# from models import Base, User

# from datetime import datetime

# from sqlalchemy.exc import SQLAlchemyError


# ###IMPORTS END HERE FOR AUTH####



# # Import your authentication modules
# from database import SessionLocal, engine, Base
# from models import User
# from auth_utils import hash_password, verify_password
# from auth_token import create_access_token, get_current_user, ACCESS_TOKEN_EXPIRE_MINUTES
# from schemas import UserCreate, UserLogin, UserOut, Token

# Create all tables
Base.metadata.create_all(bind=engine)

##AUTH IMPORT ENDING

####

warnings.filterwarnings('ignore')

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="Security Compliance Assistant API",
    description="API for answering security compliance questions",
    version="1.0.0"
)

# Add CORS middleware with more explicit configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Explicitly allow your Next.js frontend
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],  # Explicitly list allowed methods
    allow_headers=["*"],
    max_age=86400,  # Cache preflight requests for 24 hours
)



# ## startttttt
# Base.metadata.create_all(bind=engine)
# # Dependency
# def get_db():
#     db = SessionLocal()
#     try:
#         yield db
#     finally:
#         db.close()

# class UserCreate(BaseModel):
#     username: str
#     email: str
#     password: str

# class UserLogin(BaseModel):
#     username: str
#     password: str

# @app.post("/signup")
# def signup(user: UserCreate, db: Session = Depends(get_db)):
#     if db.query(User).filter(User.username == user.username).first():
#         raise HTTPException(status_code=400, detail="Username already registered")
#     hashed_pw = hash_password(user.password)
#     db_user = User(username=user.username, email=user.email, hashed_password=hashed_pw)
#     db.add(db_user)
#     db.commit()
#     db.refresh(db_user)
#     return {"message": "User created successfully"}
# @app.post("/login")
# def signin(user: UserLogin, db: Session = Depends(get_db)):
#     db_user = db.query(User).filter(User.username == user.username).first()
#     if not db_user or not verify_password(user.password, db_user.hashed_password):
#         raise HTTPException(status_code=400, detail="Invalid credentials")
#     token = create_access_token(data={"sub": user.username})
#     return {"access_token": token, "token_type": "bearer", "username": db_user.username}

## enddddd


###### STARTTTTTT #####

# Database dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Authentication endpoints
@app.post("/api/signup", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def signup(user: UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""
    # Check if user already exists
    db_user = db.query(User).filter(User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    # Check if email already exists
    db_email = db.query(User).filter(User.email == user.email).first()
    if db_email:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Hash the password
    hashed_pw = hash_password(user.password)
    
    # Create new user
    db_user = User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_pw
    )
    
    # Add to database
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user

@app.post("/api/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Login and get access token"""
    # Find user by username
    user = db.query(User).filter(User.username == form_data.username).first()
    
    # Check if user exists and password is correct
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, 
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer", "username": user.username}



# @app.post("/api/save_chat")
# async def save_chat(user_id: int, messages: list[Message], db: Session = Depends(SessionLocal)):

# @app.post("/api/save_chat")
# async def save_chat(user_id: int, chat_history: ChatHistory,   db: Session = Depends(SessionLocal),  local_kw: str = Query(..., description="A required query parameter")):
#      # Query parameter for local_kw
#     try:
#         # Prepare the chat data to be stored as JSON
#         chat_data = [message.dict() for message in chat_history.messages, ]
        
#         # Check if the user already has a chat entry
#         existing_chat = db.query(Chat).filter(Chat.user_id == user_id).first()
        
#         if existing_chat:
#             # Update the existing chat entry
#             existing_chat.title = chat_history.title
#             existing_chat.chat_data = chat_data
#             db.commit()
#             return {"message": "Chat updated successfully!"}
#         else:
#             # Create a new chat entry
#             new_chat = Chat(user_id=user_id, title=chat_history.title, chat_data=chat_data)
#             db.add(new_chat)
#             db.commit()
#             return {"message": "Chat saved successfully!"}
        
#     except SQLAlchemyError as e:
#         db.rollback()
#         raise HTTPException(status_code=500, detail=f"Failed to save chat: {str(e)}")

# @app.post("/api/save_chat")
# async def save_chat(
#     user_id: int, 
#     chat_history: ChatHistory,  
#     db: Session = Depends(get_db),  # Corrected to use the `get_db` dependency
#     local_kw: str = Query(..., description="A required query parameter")  # Query parameter for local_kw
# ):
#     try:
#         # Prepare the chat data to be stored as JSON
#         chat_data = [message.dict() for message in chat_history.messages]
        
#         # Check if the user already has a chat entry
#         existing_chat = db.query(Chat).filter(Chat.user_id == user_id).first()
        
#         if existing_chat:
#             # Update the existing chat entry
#             existing_chat.title = chat_history.title
#             existing_chat.chat_data = chat_data
#             db.commit()
#             return {"message": "Chat updated successfully!"}
#         else:
#             # Create a new chat entry
#             new_chat = Chat(user_id=user_id, title=chat_history.title, chat_data=chat_data)
#             db.add(new_chat)
#             db.commit()
#             return {"message": "Chat saved successfully!"}
        
#     except SQLAlchemyError as e:
#         db.rollback()
#         raise HTTPException(status_code=500, detail=f"Failed to save chat: {str(e)}")


@app.post("/api/save_chat")
async def save_chat(
    user_id: int,
    chat_history: ChatHistory,
    db: Session = Depends(get_db),  # Corrected to use the `get_db` dependency
    local_kw: str = Query(..., description="A required query parameter")  # Query parameter for local_kw
):
    try:
        # Prepare the chat data to be stored as JSON
        chat_data = [message.dict() for message in chat_history.messages]
        
        # Always create a new chat entry for each conversation
        new_chat = Chat(
            user_id=user_id, 
            title=chat_history.title, 
            chat_data=chat_data,
            # created_at=datetime.utcnow()  # Add timestamp for when the conversation was created
        )
        
        db.add(new_chat)
        db.commit()
        
        return {
            "message": "New conversation saved successfully!",
            "conversation_id": new_chat.id  # Return the ID of the newly created conversation
        }
        
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to save chat: {str(e)}")
@app.get("/chat-history/")
def get_chat_history(db: Session = Depends(get_db)):
    records = db.query(Chat).all()
    return [
        {
            "id": r.id,
            "user_id": r.user_id,
            "title": r.title,
            "chat_data": r.chat_data,
        }
        for r in records
    ]

#     try:
#         # Prepare the chat data to be stored as JSON
#         chat_data = [message.dict() for message in messages]
        
#         # Check if the user already has a chat entry
#         existing_chat = db.query(Chat).filter(Chat.user_id == user_id).first()
        
#         if existing_chat:
#             # Update the existing chat entry
#             existing_chat.chat_data = chat_data
#             db.commit()
#             return {"message": "Chat updated successfully!"}
#         else:
#             # Create a new chat entry
#             new_chat = Chat(user_id=user_id, chat_data=chat_data)
#             db.add(new_chat)
#             db.commit()
#             return {"message": "Chat saved successfully!"}
        
#     except SQLAlchemyError as e:
#         db.rollback()
#         raise HTTPException(status_code=500, detail=f"Failed to save chat: {str(e)}")

# @app.post("/chat/", response_model=ChatOut)
# def create_chat(chat: ChatBase, db: Session = Depends(get_db)):
#     db_user = db.query(User).filter(User.id == chat.user_id).first()
#     if not db_user:
#         raise HTTPException(status_code=404, detail="User not found")
    
#     new_chat = Chat(user_id=chat.user_id, message=chat.message)
#     db.add(new_chat)
#     db.commit()
#     db.refresh(new_chat)
    
#     return new_chat

# @app.get("/chats/{chat_id}", response_model=ChatOut)
# def get_chat(chat_id: int, db: Session = Depends(get_db)):
#     db_chat = db.query(Chat).filter(Chat.id == chat_id).first()
#     if not db_chat:
#         raise HTTPException(status_code=404, detail="Chat not found")
#     return db_chat

# @app.get("/chats/user/{user_id}", response_model=list[ChatOut])
# def get_chats_by_user(user_id: int, db: Session = Depends(get_db)):
#     db_chats = db.query(Chat).filter(Chat.user_id == user_id).all()
#     return db_chats



##SAVE CHAT

# Endpoint to save chat messages
# @app.post("/save-chat/", response_model=ChatOut)
# def save_chat(chat: ChatBase, db: Session = Depends(get_db)):
#     try:
#         # Check if the user exists
#         user = db.query(User).filter(User.id == chat.user_id).first()
#         if not user:
#             raise HTTPException(status_code=404, detail="User not found")

#         # Create a new chat message
#         new_chat = Chat(user_id=chat.user_id, message=chat.message)

#         # Add and commit to the database
#         db.add(new_chat)
#         db.commit()
#         db.refresh(new_chat)

#         return new_chat
#     except SQLAlchemyError as e:
#         db.rollback()
#         raise HTTPException(status_code=500, detail="Database error: " + str(e))


# @router.post("/save")
# def save_chat(chat: ChatSaveRequest, db: Session = Depends(get_db)):
#     # Optional: check if user exists
#     user = db.query(User).filter(User.id == chat.user_id).first()
#     if not user:
#         raise HTTPException(status_code=404, detail="User not found")

#     new_chat = Chat(
#         user_id=chat.user_id,
#         title=chat.title,
#         conversation=chat.conversation
#     )
#     db.add(new_chat)
#     db.commit()
#     db.refresh(new_chat)
#     return {"message": "Chat saved", "chat_id": new_chat.id}

# # Protected route example
# @app.get("/api/me", response_model=UserOut)
# async def read_users_me(current_user: User = Depends(get_current_user)):
#     """Get current user information"""
#     return current_user

# Add protection to your existing routes as needed
# # For example:
# @app.get("/api/sources", response_model=SourcesResponse)
# async def get_sources(current_user: User = Depends(get_current_user)):
#     """Get all available sources in the knowledge base (protected)"""
#     try:
#         sources = get_all_sources()
#         return {"sources": sources}
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Error retrieving sources: {str(e)}")

# The rest of your existing code continues...


##### ENDDDDD######

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

# Global data storage
embeddings = None
all_chunks = None
chunk_sources = None

# Pydantic models for request/response
class QuestionRequest(BaseModel):
    question: str
    use_llm: bool = True

class QuestionResponse(BaseModel):
    answer: str
    confidence: float
    source: str
    context: str
    llm_response: Optional[str] = None

class BatchQuestionsRequest(BaseModel):
    questions: List[str]
    use_llm: bool = True

class BatchQuestionsResponse(BaseModel):
    results: List[QuestionResponse]

class SourcesResponse(BaseModel):
    sources: List[str]

class FileUploadResponse(BaseModel):
    filename: str
    status: str
    message: str
    question_count: int

def get_embedding_model():
    """Load or initialize the embedding model"""
    start_time = time.time()
    global model
    if model is None:
        logger.info("TIMING: Loading embedding model...")
        model = SentenceTransformer('all-MiniLM-L6-v2')
        logger.info(f"TIMING: Embedding model loaded in {time.time() - start_time:.2f} seconds")
    else:
        logger.info("TIMING: Embedding model already loaded")
    return model

def get_llm():
    """Load or download LLM model and tokenizer"""
    start_time = time.time()
    global llm_model, llm_tokenizer
    
    if llm_model is None or llm_tokenizer is None:
        logger.info("TIMING: Loading LLM model and tokenizer...")
        
        # Check if model is already downloaded
        if LLM_MODEL_PATH.exists() and LLM_TOKENIZER_PATH.exists():
            try:
                tokenizer_start = time.time()
                llm_tokenizer = AutoTokenizer.from_pretrained(str(LLM_TOKENIZER_PATH))
                logger.info(f"TIMING: Tokenizer loaded in {time.time() - tokenizer_start:.2f} seconds")
                
                model_start = time.time()
                llm_model = AutoModelForCausalLM.from_pretrained(
                    str(LLM_MODEL_PATH),
                    torch_dtype=torch.float16,
                    low_cpu_mem_usage=True
                )
                logger.info(f"TIMING: Model loaded in {time.time() - model_start:.2f} seconds")
                logger.info("TIMING: Loaded LLM from local storage")
            except Exception as e:
                logger.error(f"TIMING: Error loading local model: {e}. Downloading from HuggingFace...")
                download_start = time.time()
                llm_tokenizer = AutoTokenizer.from_pretrained(LLM_MODEL_NAME)
                llm_model = AutoModelForCausalLM.from_pretrained(
                    LLM_MODEL_NAME,
                    torch_dtype=torch.float16,
                    low_cpu_mem_usage=True
                )
                logger.info(f"TIMING: Downloaded model in {time.time() - download_start:.2f} seconds")
                
                # Save for future use
                save_start = time.time()
                llm_tokenizer.save_pretrained(str(LLM_TOKENIZER_PATH))
                llm_model.save_pretrained(str(LLM_MODEL_PATH))
                logger.info(f"TIMING: Saved model in {time.time() - save_start:.2f} seconds")
        else:
            download_start = time.time()
            llm_tokenizer = AutoTokenizer.from_pretrained(LLM_MODEL_NAME)
            llm_model = AutoModelForCausalLM.from_pretrained(
                LLM_MODEL_NAME,
                torch_dtype=torch.float16,
                low_cpu_mem_usage=True
            )
            logger.info(f"TIMING: Downloaded model in {time.time() - download_start:.2f} seconds")
            
            # Save for future use
            save_start = time.time()
            LLM_MODEL_PATH.mkdir(exist_ok=True, parents=True)
            LLM_TOKENIZER_PATH.mkdir(exist_ok=True, parents=True)
            llm_tokenizer.save_pretrained(str(LLM_TOKENIZER_PATH))
            llm_model.save_pretrained(str(LLM_MODEL_PATH))
            logger.info(f"TIMING: Saved model in {time.time() - save_start:.2f} seconds")
    else:
        logger.info("TIMING: LLM model already loaded")
    
    logger.info(f"TIMING: Total LLM access time: {time.time() - start_time:.2f} seconds")
    return llm_model, llm_tokenizer

def generate_llm_response(question, context, max_length=512):
    """Generate a response using the LLM based on question and context"""
    llm_start = time.time()
    logger.info("TIMING: Starting LLM response generation...")
    
    # Get model and tokenizer
    model_start = time.time()
    model, tokenizer = get_llm()
    model_time = time.time() - model_start
    logger.info(f"TIMING: LLM model retrieval took {model_time:.2f} seconds")
    
    # Create prompt
    prompt = f"""You are a security compliance assistant. Answer the following question based on the provided context.
    
Context:
{context}

Question: {question}

Answer:"""
    
    # Generate response
    tokenize_start = time.time()
    logger.info("TIMING: Tokenizing input...")
    inputs = tokenizer(prompt, return_tensors="pt")
    tokenize_time = time.time() - tokenize_start
    logger.info(f"TIMING: Tokenization took {tokenize_time:.2f} seconds")
    
    inference_start = time.time()
    logger.info("TIMING: Running model inference...")
    with torch.no_grad():
        outputs = model.generate(
            **inputs,
            max_new_tokens=max_length,
            temperature=0.7,
            top_p=0.9,
            do_sample=True
        )
    inference_time = time.time() - inference_start
    logger.info(f"TIMING: Model inference took {inference_time:.2f} seconds")
    
    decode_start = time.time()
    logger.info("TIMING: Decoding output tokens...")
    response = tokenizer.decode(outputs[0], skip_special_tokens=True)
    decode_time = time.time() - decode_start
    logger.info(f"TIMING: Token decoding took {decode_time:.2f} seconds")
    
    # Extract just the answer part
    extract_start = time.time()
    if "Answer:" in response:
        response = response.split("Answer:")[1].strip()
    extract_time = time.time() - extract_start
    logger.info(f"TIMING: Answer extraction took {extract_time:.2f} seconds")
    
    total_llm_time = time.time() - llm_start
    logger.info(f"TIMING: Total LLM generation time: {total_llm_time:.2f} seconds")
    
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
    start_time = time.time()
    logger.info("TIMING: Starting to save data...")
    
    with open(EMBEDDINGS_PATH, 'wb') as f:
        pickle.dump(embeddings, f)
    
    with open(CHUNKS_PATH, 'wb') as f:
        pickle.dump(all_chunks, f)
        
    with open(CHUNK_SOURCES_PATH, 'wb') as f:
        pickle.dump(chunk_sources, f)
    
    logger.info(f"TIMING: Saved data to {MODEL_DIR} in {time.time() - start_time:.2f} seconds")

# Load data
def load_data():
    """Load embeddings, chunks, and sources from disk"""
    start_time = time.time()
    logger.info("TIMING: Starting to load saved data...")
    
    with open(EMBEDDINGS_PATH, 'rb') as f:
        embeddings = pickle.load(f)
        
    with open(CHUNKS_PATH, 'rb') as f:
        all_chunks = pickle.load(f)
        
    with open(CHUNK_SOURCES_PATH, 'rb') as f:
        chunk_sources = pickle.load(f)
    
    logger.info(f"TIMING: Loaded {len(all_chunks)} chunks from saved data in {time.time() - start_time:.2f} seconds")
    return embeddings, all_chunks, chunk_sources

# Process policy documents
def process_documents():
    """Process all policy documents and create searchable chunks."""
    start_time = time.time()
    logger.info("TIMING: Starting document processing...")
    
    # Check if we can load from saved data
    if check_saved_data():
        logger.info("TIMING: Found saved data, loading from disk...")
        result = load_data()
        logger.info(f"TIMING: Loaded data in {time.time() - start_time:.2f} seconds")
        return result
    
    logger.info("TIMING: No saved data found. Processing documents...")
    model = get_embedding_model()
    all_chunks = []
    chunk_sources = []
    
    # Process each text file
    file_start = time.time()
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
            logger.error(f"TIMING: Error processing {policy_name}: {e}")
    logger.info(f"TIMING: Processed policy files in {time.time() - file_start:.2f} seconds")
    
    # Process knowledge base using the specific format
    kb_start = time.time()
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
        logger.error(f"TIMING: Error processing knowledge base: {e}")
    logger.info(f"TIMING: Processed knowledge base in {time.time() - kb_start:.2f} seconds")
    
    # Create embeddings
    embed_start = time.time()
    logger.info("TIMING: Creating embeddings...")
    chunk_embeddings = model.encode(all_chunks, show_progress_bar=True)
    logger.info(f"TIMING: Created embeddings in {time.time() - embed_start:.2f} seconds")
    
    # Save data for future use
    save_data(chunk_embeddings, all_chunks, chunk_sources)
    
    total_time = time.time() - start_time
    logger.info(f"TIMING: Total document processing time: {total_time:.2f} seconds")
    
    return chunk_embeddings, all_chunks, chunk_sources

# Function to get top results for a query using cosine similarity
def get_top_results(query: str, embeddings, all_chunks: List[str], chunk_sources: List[Dict], top_k: int = 5) -> List[Dict]:
    """Retrieve top matching chunks for a query using cosine similarity."""
    search_start = time.time()
    logger.info(f"TIMING: Starting search for query: {query}")
    
    # Get embedding model
    model_start = time.time()
    model = get_embedding_model()
    model_time = time.time() - model_start
    logger.info(f"TIMING: Embedding model retrieval took {model_time:.2f} seconds")
    
    # Create query embedding
    embed_start = time.time()
    query_embedding = model.encode([query])
    embed_time = time.time() - embed_start
    logger.info(f"TIMING: Query embedding took {embed_time:.2f} seconds")
    
    # Calculate similarity
    sim_start = time.time()
    similarities = cosine_similarity(query_embedding, embeddings)[0]
    sim_time = time.time() - sim_start
    logger.info(f"TIMING: Similarity calculation took {sim_time:.2f} seconds")
    
    # Get top indices
    sort_start = time.time()
    top_indices = np.argsort(-similarities)[:top_k]
    sort_time = time.time() - sort_start
    logger.info(f"TIMING: Sorting similarities took {sort_time:.2f} seconds")
    
    # Create results
    results_start = time.time()
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
    results_time = time.time() - results_start
    logger.info(f"TIMING: Building results took {results_time:.2f} seconds")
    
    total_search_time = time.time() - search_start
    logger.info(f"TIMING: Total search took {total_search_time:.2f} seconds")
    
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
        
        return results_df, output_filename
        
    except Exception as e:
        print(f"Error processing questionnaire {questionnaire_path.name}: {str(e)}")
        import traceback
        traceback.print_exc()
        return None, None

# Function to process a single question (for API endpoint)
def process_single_question(question: str, embeddings, all_chunks: List[str], chunk_sources: List[Dict], use_llm=True):
    """Process a single question and return the answer (for API)"""
    total_start_time = time.time()
    logger.info(f"TIMING: Starting to process question: {question}")
    
    if not question:
        logger.info("TIMING: Empty question received")
        return {
            'answer': 'Please provide a question.',
            'confidence': 0.0,
            'source': 'N/A',
            'context': '',
            'llm_response': '' if use_llm else None
        }
    
    # Get top results
    embed_start_time = time.time()
    logger.info("TIMING: Starting embedding and similarity search...")
    top_results = get_top_results(question, embeddings, all_chunks, chunk_sources, top_k=3)
    embed_time = time.time() - embed_start_time
    logger.info(f"TIMING: Embedding and similarity search took {embed_time:.2f} seconds")
    
    if not top_results:
        logger.info("TIMING: No relevant results found")
        return {
            'answer': 'No relevant information found',
            'confidence': 0.0,
            'source': 'N/A',
            'context': '',
            'llm_response': 'No context available for LLM response' if use_llm else None
        }
    
    # Format answer
    format_start_time = time.time()
    logger.info("TIMING: Starting answer formatting...")
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
    
    format_time = time.time() - format_start_time
    logger.info(f"TIMING: Answer formatting took {format_time:.2f} seconds")
    
    # Generate LLM response if requested
    llm_response = None
    if use_llm:
        llm_start_time = time.time()
        logger.info("TIMING: Starting LLM response generation...")
        # Combine the top 2 chunks for better context
        context = top_result['chunk']
        if len(top_results) > 1:
            context += "\n\n" + top_results[1]['chunk']
        
        llm_response = generate_llm_response(question, context)
        llm_time = time.time() - llm_start_time
        logger.info(f"TIMING: LLM response generation took {llm_time:.2f} seconds")
    
    total_time = time.time() - total_start_time
    logger.info(f"TIMING: Total processing time: {total_time:.2f} seconds")
    
    return {
        'answer': answer,
        'confidence': top_result['confidence'],
        'source': source,
        'context': top_result['chunk'],
        'llm_response': llm_response
    }

# Process multiple questions for batch operations
def process_batch_questions(questions: List[str], use_llm=True):
    """Process a list of questions and generate answers with confidence scores."""
    global embeddings, all_chunks, chunk_sources
    
    results = []
    
    for question in questions:
        if not question:
            continue
            
        result = process_single_question(question, embeddings, all_chunks, chunk_sources, use_llm)
        
        results.append({
            'answer': result['answer'],
            'confidence': result['confidence'],
            'source': result['source'],
            'context': result['context'],
            'llm_response': result['llm_response'] if use_llm else None
        })
    
    return results

# Get all unique sources
def get_all_sources():
    """Get a list of all unique sources in the knowledge base"""
    global chunk_sources
    
    if not chunk_sources:
        return []
    
    sources = set()
    for source_info in chunk_sources:
        if source_info.get('type') == 'policy':
            sources.add(f"Policy: {source_info.get('source')}")
        elif source_info.get('type') == 'qa':
            category = source_info.get('category', 'General')
            sources.add(f"Knowledge Base: {category}")
    
    return sorted(list(sources))

# Initialize data at startup
@app.on_event("startup")
async def startup_event():
    startup_start = time.time()
    logger.info("TIMING: Starting API server initialization...")
    
    global embeddings, all_chunks, chunk_sources
    
    # Initialize embedding model
    embed_start = time.time()
    logger.info("TIMING: Initializing embedding model...")
    get_embedding_model()
    embed_time = time.time() - embed_start
    logger.info(f"TIMING: Embedding model initialized in {embed_time:.2f} seconds")
    
    # Process documents and create embeddings (or load from disk)
    docs_start = time.time()
    logger.info("TIMING: Processing documents...")
    embeddings, all_chunks, chunk_sources = process_documents()
    docs_time = time.time() - docs_start
    logger.info(f"TIMING: Document processing completed in {docs_time:.2f} seconds")
    logger.info(f"TIMING: API ready with {len(all_chunks)} chunks from policies and knowledge base")
    
    # Load the LLM (this will download it if not present)
    llm_start = time.time()
    logger.info("TIMING: Initializing LLM model...")
    get_llm()
    llm_time = time.time() - llm_start
    logger.info(f"TIMING: LLM initialized in {llm_time:.2f} seconds")
    
    total_startup_time = time.time() - startup_start
    logger.info(f"TIMING: Total startup time: {total_startup_time:.2f} seconds")

# API Routes
@app.get("/")
async def root():
    """Root endpoint with API info"""
    return {
        "app": "Security Compliance Assistant API",
        "version": "1.0.0",
        "endpoints": [
            "/api/ask",
            "/api/batch",
            "/api/sources",
            "/api/upload-questionnaire",
            "/api/download/{filename}",
            "/api/processed-files",
            "/api/health"
        ]
    }

# Update the ask_question endpoint with request timing
@app.post("/api/ask", response_model=QuestionResponse)
async def ask_question(request: QuestionRequest):
    """API endpoint to ask a single question"""
    request_start = time.time()
    try:
        logger.info(f"TIMING: API request received at {request_start}")
        logger.info(f"TIMING: Question: {request.question}")
        logger.info(f"TIMING: Using LLM: {request.use_llm}")
        
        global embeddings, all_chunks, chunk_sources
        
        # Process the question
        logger.info("TIMING: Starting question processing...")
        process_start = time.time()
        result = process_single_question(
            request.question, 
            embeddings, 
            all_chunks, 
            chunk_sources, 
            use_llm=request.use_llm
        )
        process_time = time.time() - process_start
        logger.info(f"TIMING: Question processing completed in {process_time:.2f} seconds")
        
        # Log the result before returning
        logger.info(f"TIMING: Found answer with confidence: {result['confidence']}")
        logger.info(f"TIMING: Source: {result['source']}")
        
        # Ensure all values are properly formatted
        if result['llm_response'] is None and request.use_llm:
            logger.warning("TIMING: LLM response is None but use_llm is True")
            result['llm_response'] = "No AI-generated response available."
        
        total_time = time.time() - request_start
        logger.info(f"TIMING: Total API request handling time: {total_time:.2f} seconds")
        
        return result
    except Exception as e:
        error_time = time.time() - request_start
        logger.error(f"TIMING: Error processing question in {error_time:.2f} seconds: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error processing question: {str(e)}")


@app.post("/api/batch", response_model=BatchQuestionsResponse)
async def batch_questions(request: BatchQuestionsRequest):
    """API endpoint to process multiple questions at once"""
    try:
        batch_start = time.time()
        logger.info("TIMING: Starting batch processing...")
        results = process_batch_questions(request.questions, use_llm=request.use_llm)
        batch_time = time.time() - batch_start
        logger.info(f"TIMING: Batch processing completed in {batch_time:.2f} seconds")
        return {"results": results}
    except Exception as e:
        logger.error(f"TIMING: Error processing batch: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing batch: {str(e)}")

@app.get("/api/sources", response_model=SourcesResponse)
async def get_sources():
    """Get all available sources in the knowledge base"""
    try:
        sources = get_all_sources()
        return {"sources": sources}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving sources: {str(e)}")

@app.post("/api/upload-questionnaire", response_model=FileUploadResponse)
async def upload_questionnaire(file: UploadFile = File(...), use_llm: bool = Form(True)):
    """Upload a questionnaire CSV file for batch processing"""
    try:
        upload_start = time.time()
        logger.info("TIMING: Starting questionnaire upload processing...")
        
        global embeddings, all_chunks, chunk_sources
        
        # Read the uploaded file
        contents = await file.read()
        buffer = io.BytesIO(contents)
        
        # Save the file temporarily
        temp_file_path = Path(f"/tmp/{file.filename}")
        with open(temp_file_path, "wb") as f:
            f.write(contents)
        
        # Process the questionnaire
        process_start = time.time()
        results_df, output_filename = process_questionnaire(
            temp_file_path, 
            embeddings, 
            all_chunks, 
            chunk_sources, 
            use_llm=use_llm
        )
        process_time = time.time() - process_start
        logger.info(f"TIMING: Questionnaire processing completed in {process_time:.2f} seconds")
        
        if results_df is None or output_filename is None:
            raise HTTPException(status_code=500, detail="Failed to process questionnaire")
        
        # Clean up temporary file
        if temp_file_path.exists():
            os.remove(temp_file_path)
        
        total_time = time.time() - upload_start
        logger.info(f"TIMING: Total questionnaire upload and processing time: {total_time:.2f} seconds")
            
        return {
            "filename": output_filename,
            "status": "success",
            "message": f"Processed {len(results_df)} questions",
            "question_count": len(results_df)
        }
        
    except Exception as e:
        logger.error(f"TIMING: Error processing file: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")

@app.get("/api/download/{filename}")
async def download_results(filename: str):
    """Download processed questionnaire results"""
    try:
        file_path = OUTPUT_DIR / filename
        
        if not file_path.exists():
            raise HTTPException(status_code=404, detail="File not found")
            
        return FileResponse(
            path=str(file_path), 
            filename=filename,
            media_type="text/csv"
        )
        
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Error downloading file: {str(e)}")

@app.get("/api/processed-files")
async def list_processed_files():
    """List all processed questionnaire files"""
    try:
        files = [f.name for f in OUTPUT_DIR.glob("*filled_*.csv")]
        return {"files": files}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving files: {str(e)}")

@app.get("/api/health")
async def health_check():
    """Simple health check endpoint"""
    health_start = time.time()
    logger.info("TIMING: Health check requested")
    
    result = {
        "status": "ok", 
        "chunks_loaded": len(all_chunks) if all_chunks else 0,
        "sources_count": len(get_all_sources())
    }
    
    health_time = time.time() - health_start
    logger.info(f"TIMING: Health check completed in {health_time:.2f} seconds")
    
    return result

# Run the app
if __name__ == "__main__":
    import uvicorn
    logger.info("TIMING: Starting uvicorn server...")
    uvicorn.run(
        "test:app", 
        host="0.0.0.0", 
        port=8000, 
        reload=True,
        log_level="info",
        timeout_keep_alive=12000,)  # Increase timeout for LLM processing