# 🛡️ UQat: Unified QnA Assistant

UQat (Unified QnA Assistant) is an intelligent platform built to streamline how InfoSec and compliance teams manage security questionnaires and on-demand queries. Backed by domain-specific fine-tuned AI and a centralized knowledge library, UQat provides both **chat-based** and **batch processing** interaction modes.

---

## 🔧 Tech Stack

### 🖥 Frontend
- **React**
- **Next.js**
- **Tailwind CSS**

### 🧠 Backend
- **Python**
- **FastAPI**
- **SQLAlchemy**
- **PyTorch**

### 🤖 AI Models
- **Embedding Model**: [`all-MiniLM-L6-v2`](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2)
- **Language Model**: [`TinyLlama-1.1B-Chat-v1.0`](https://huggingface.co/cerebras/TinyLlama-1.1B-Chat-v1.0)

---

## ✨ Features

- 🗣 **Chat Interface** – Natural conversation interface for querying domain-specific information.
- 🧾 **Batch Processing** – Upload and process multiple queries in bulk.
- 📊 **Visualization** – Display outputs and model insights interactively.
- 🔐 **Authentication** – Secure user access and session control.
- 🔎 **Semantic Search** – Use cosine similarity on embeddings for accurate retrieval.
- 🧠 **Fine-Tuned Models** – Specialized QnA generation for security and compliance use cases.
- 🧊 **Yeti TTS (Coming Soon)** – A human-like text-to-speech assistant powered by our Yeti mascot.

---

## 🧠 AI Model Workflow

### 🔍 Embedding Model
Using `SentenceTransformer (all-MiniLM-L6-v2)` to convert input text into vector representations for semantic similarity searching during the retrieval phase.

### 🧾 Language Model
Using `TinyLlama-1.1B-Chat-v1.0` to generate contextual, domain-aware answers during the response phase.

### 🛠 Fine-Tuning
Models have been fine-tuned on internal security QnA pairs and policy documents to ensure precision and contextuality in responses.

---

## 🚀 Getting Started

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/b1nay/uq-full-public
cd UQat
```

### 2️⃣ Set Up the Frontend

```bash
npm install  # Install required packages
npm run dev  # Start the development server
```

The frontend will now be accessible at `http://localhost:3000` (or whichever port is active).

### 3️⃣ Set Up the Backend

Open a new terminal window and run:

```bash
cd UQ-backend
# Start a virtual environment
python -m venv env
source env/bin/activate  # On Windows: env\Scripts\activate
pip install -r requirements.txt
```

### 4️⃣ Start Backend Server

```bash
cd scripts
python main.py
```

Once started, it will be available on the defined FastAPI port (default: `localhost:8000`).

---

## 🌐 Access the App

Visit `http://localhost:3000` (or your active port) in your browser to use the UQat interface.

---

## 🗺️ Roadmap

- ✅ Dual-mode (Chat + Batch)
- ✅ Fine-tuned model with QnA & policy docs
- ✅ Secure authentication
- 🛠 Yeti Text-to-Speech with emotional expression *(Coming Soon)*
- 📁 Upload knowledge base UI
- 🔍 Admin analytics dashboard

---

## 🤝 Contributing

We welcome contributions! Please fork the repo and create a PR. For major changes, please open an issue first to discuss what you’d like to change.

---

## 📄 License

[MIT License](LICENSE)

---

## 👤 Author

Built by
[@b1nay](https://github.com/b1nay)
[@rosotron](https://github.com/rosotron)
[@bvrvl](https://github.com/bvrvl)

