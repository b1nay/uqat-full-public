import os
from pathlib import Path
import pdfplumber
import time

# Set up directories
input_dir = Path("../datasets/policies/pdf")
output_dir = Path("../datasets/policies/txt")
output_dir.mkdir(parents=True, exist_ok=True)

# Process each PDF file with error handling and retries
for pdf_file in input_dir.glob("*.pdf"):
    output_file = output_dir / (pdf_file.stem + ".txt")
    
    # Skip if already processed
    if output_file.exists():
        print(f"Skipping already processed: {pdf_file.name}")
        continue
    
    max_retries = 3
    retries = 0
    
    while retries < max_retries:
        try:
            print(f"Processing: {pdf_file.name} (Attempt {retries + 1})")
            
            with pdfplumber.open(pdf_file) as pdf:
                text = ""
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
                    
                    # Extract tables if present
                    tables = page.extract_tables()
                    if tables:
                        text += "\n--- TABLES ---\n"
                        for table in tables:
                            for row in table:
                                # Filter out None values and join with tabs
                                row_text = "\t".join([str(cell) if cell is not None else "" for cell in row])
                                text += row_text + "\n"
                            text += "\n"
            
            # Write the extracted text to output file
            with open(output_file, "w", encoding="utf-8") as f:
                f.write(text)
            
            print(f"Successfully extracted text from: {pdf_file.name}")
            break  # Exit retry loop on success
            
        except Exception as e:
            retries += 1
            print(f"Error processing {pdf_file.name} (Attempt {retries}): {e}")
            if retries < max_retries:
                print(f"Retrying in 5 seconds...")
                time.sleep(5)  # Wait before retrying
            else:
                print(f"Failed to process {pdf_file.name} after {max_retries} attempts")