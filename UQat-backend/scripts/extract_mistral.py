import os
from pathlib import Path
import requests
import json
from dotenv import load_dotenv

# Load API key from .env.local file
env_path = Path("../.env.local")
load_dotenv(dotenv_path=env_path)

# Get the Mistral API key
mistral_api_key = os.getenv("mistral_api")

if not mistral_api_key:
    raise ValueError("Mistral API key not found in .env.local file")

# Set up directories
input_dir = Path("../datasets/policies/pdf")
output_dir = Path("../datasets/policies/txt")
output_dir.mkdir(parents=True, exist_ok=True)

# Mistral API endpoint for document processing
API_URL = "https://api.mistral.ai/v1/documents/ocr"
headers = {
    "Authorization": f"Bearer {mistral_api_key}",
    "Content-Type": "application/json"
}

# Process each PDF file
for pdf_file in input_dir.glob("*.pdf"):
    try:
        print(f"Processing: {pdf_file.name}")
        
        # Read the PDF file as binary data
        with open(pdf_file, "rb") as f:
            pdf_data = f.read()
        
        # Send request to Mistral API
        files = {
            "file": (pdf_file.name, pdf_data, "application/pdf")
        }
        
        response = requests.post(
            API_URL,
            headers={"Authorization": f"Bearer {mistral_api_key}"},
            files=files
        )
        
        if response.status_code == 200:
            result = response.json()
            text = result.get("text", "")
            
            # Handle structured data if available
            if "structured_content" in result:
                # Add structured content if available (tables, etc.)
                # This depends on what format Mistral returns
                pass
                
            # Write the extracted text to output file
            output_file = output_dir / (pdf_file.stem + ".txt")
            with open(output_file, "w", encoding="utf-8") as f:
                f.write(text)
            
            print(f"Successfully extracted text from: {pdf_file.name}")
        else:
            print(f"API error for {pdf_file.name}: {response.status_code} - {response.text}")
            
    except Exception as e:
        print(f"Failed to process {pdf_file.name}: {e}")