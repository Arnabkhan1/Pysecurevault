import os
import io
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from .. import database, models, auth, core_crypto

router = APIRouter(
    prefix="/files",
    tags=["Files"]
)

# Storage location
UPLOAD_DIR = "encrypted_storage"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...), 
    current_user: models.User = Depends(auth.get_current_user), 
    db: Session = Depends(database.get_db)
):
    # 1. Read file content
    file_content = await file.read()
    
    # 2. Generate a fresh AES key (32 bytes)
    file_key = os.urandom(32) 
    
    # 3. Encrypt the content
    encrypted_content = core_crypto.encrypt_file(file_content, file_key)
    
    # 4. Save to Disk (Safe filename)
    safe_storage_name = f"{current_user.username}_{os.urandom(8).hex()}.enc"
    storage_path = os.path.join(UPLOAD_DIR, safe_storage_name)
    
    with open(storage_path, "wb") as f:
        f.write(encrypted_content)
    
    # 5. Save Metadata & Key to DB
    new_file = models.FileRecord(
        filename=safe_storage_name,
        original_filename=file.filename,
        file_path=storage_path,
        owner_id=current_user.id,
        encryption_key=file_key.hex() # Store key as Hex String
    )
    
    db.add(new_file)
    db.commit()
    db.refresh(new_file)
    
    return {"filename": file.filename, "status": "encrypted"}

@router.get("/list")
def list_files(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    # Return only files that belong to this user
    return db.query(models.FileRecord).filter(models.FileRecord.owner_id == current_user.id).all()

@router.get("/download/{file_id}")
def download_file(
    file_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    # 1. Find the file in DB
    file_record = db.query(models.FileRecord).filter(models.FileRecord.id == file_id).first()
    
    # 2. Check if file exists and belongs to user
    if not file_record:
        raise HTTPException(status_code=404, detail="File not found")
    if file_record.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this file")
        
    # 3. Read the ENCRYPTED file from disk
    if not os.path.exists(file_record.file_path):
        raise HTTPException(status_code=404, detail="Physical file missing on server")
        
    with open(file_record.file_path, "rb") as f:
        encrypted_data = f.read()
        
    # 4. Decrypt the data
    try:
        # Convert hex key back to bytes
        key = bytes.fromhex(file_record.encryption_key)
        decrypted_data = core_crypto.decrypt_file(encrypted_data, key)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Decryption failed")
    
    # 5. Stream the DECRYPTED data back to user
    # We use io.BytesIO to turn the bytes into a file-like object
    return StreamingResponse(
        io.BytesIO(decrypted_data), 
        media_type="application/octet-stream",
        headers={"Content-Disposition": f"attachment; filename={file_record.original_filename}"}
    )

    # ... Ager code ...

# Delete File Endpoint
@router.delete("/delete/{file_id}")
def delete_file(
    file_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    # 1. File ta Database e khujo
    file_record = db.query(models.FileRecord).filter(models.FileRecord.id == file_id).first()

    if not file_record:
        raise HTTPException(status_code=404, detail="File not found")

    # 2. Security Check: Onno karor file delete kora jabe na
    if file_record.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this file")

    # 3. Hard Drive/Folder theke file ta delete koro
    if os.path.exists(file_record.file_path):
        os.remove(file_record.file_path)

    # 4. Database theke record delete koro
    db.delete(file_record)
    db.commit()

    return {"message": "File deleted successfully"}