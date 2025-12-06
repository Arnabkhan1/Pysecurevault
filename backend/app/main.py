from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine
from . import models
from .routers import auth, files

# 1. Database tables create kora (jodi na thake)
models.Base.metadata.create_all(bind=engine)

# 2. App Initialize kora (Sobar age eta lagbe)
app = FastAPI(title="Secure File Vault API")

# 3. CORS Middleware Setup (React er sathe connect korar jonno)
# Eta 'app' define korar POREI likhte hoy
origins = [
    "http://localhost:5173", # Vite Default Port
    "http://localhost:3000", # React Default Port
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], # Sob method allowed (GET, POST, etc.)
    allow_headers=["*"], # Sob headers allowed
)

# 4. Routers Include kora
app.include_router(auth.router)
app.include_router(files.router)

# 5. Root Endpoint (Health Check)
@app.get("/")
def read_root():
    return {"message": "Secure File Vault Backend is Running!"}