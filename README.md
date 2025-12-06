# 🔐 VaultX - Secure Cloud Storage

A professional End-to-End Encrypted File Storage system built with **FastAPI (Python)** and **React.js**. It ensures privacy by encrypting files using **AES-256** before they are stored on the server.

![Dashboard Preview](https://via.placeholder.com/800x400?text=Upload+Your+Screenshot+Here)

## 🚀 Key Features

- **🔐 End-to-End Encryption:** Files are encrypted using AES-256 (GCM Mode).
- **📂 Drag & Drop Upload:** Modern, intuitive UI for file uploading.
- **📄 File Type Preview:** Auto-detects PDF, Images, and Documents.
- **⚡ Fast & Secure:** Built with FastAPI (High Performance) and SQLite.
- **🕵️ Privacy First:** Server admins cannot read your files.
- **🛡️ Auto-Logout:** Session expires automatically after 15 mins of inactivity.

## 🛠️ Tech Stack

- **Frontend:** React (Vite), Glassmorphism UI, React Dropzone.
- **Backend:** Python, FastAPI, SQLAlchemy, Cryptography module.
- **Database:** SQLite (Managed Relational DB).
- **Security:** JWT Authentication, Bcrypt Password Hashing, AES-256.

## 📦 Installation & Run

### 1. Backend Setup
```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate  |  Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload