from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)  # Stores the bcrypt hash, not real password

    # Relationship: One User can have many Files
    # 'FileRecord' is the name of the class below
    # 'owner' is the attribute name in the FileRecord class
    files = relationship("FileRecord", back_populates="owner")

class FileRecord(Base):
    __tablename__ = "files"

    id = Column(Integer, primary_key=True, index=True)
    
    # The random safe name stored on the hard drive (e.g., "user_a1b2.enc")
    filename = Column(String)           
    
    # The real name the user sees (e.g., "secret_report.pdf")
    original_filename = Column(String)  
    
    # Full path to the file on the server
    file_path = Column(String)          
    
    # The unique AES key for this specific file (Hex encoded)
    # WARNING: In a real enterprise app, this column should also be encrypted!
    encryption_key = Column(String)     
    
    upload_date = Column(DateTime, default=datetime.utcnow)
    
    # Foreign Key: Who owns this file?
    owner_id = Column(Integer, ForeignKey("users.id"))
    
    # Relationship: Link back to the User
    owner = relationship("User", back_populates="files")