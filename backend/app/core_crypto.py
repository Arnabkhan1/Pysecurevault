import os
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.backends import default_backend

# Configuration
SALT_SIZE = 16
NONCE_SIZE = 12
KEY_SIZE = 32  # 32 bytes = 256 bits (AES-256)
ITERATIONS = 100_000

def generate_key_from_password(password: str, salt: bytes = None) -> tuple[bytes, bytes]:
    """
    Derives a 256-bit key from a user password using PBKDF2.
    Returns (key, salt).
    """
    if not salt:
        salt = os.urandom(SALT_SIZE)
    
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=KEY_SIZE,
        salt=salt,
        iterations=ITERATIONS,
        backend=default_backend()
    )
    key = kdf.derive(password.encode())
    return key, salt

def encrypt_file(file_data: bytes, key: bytes) -> bytes:
    """
    Encrypts bytes using AES-GCM.
    Structure: [Nonce (12)] + [Ciphertext] + [Tag (16)]
    """
    nonce = os.urandom(NONCE_SIZE)
    cipher = Cipher(algorithms.AES(key), modes.GCM(nonce), backend=default_backend())
    encryptor = cipher.encryptor()
    
    ciphertext = encryptor.update(file_data) + encryptor.finalize()
    
    # We combine Nonce + Ciphertext + Tag so we can decrypt later
    return nonce + ciphertext + encryptor.tag

def decrypt_file(encrypted_data: bytes, key: bytes) -> bytes:
    """
    Decrypts bytes using AES-GCM.
    Extracts nonce and tag from the data.
    """
    nonce = encrypted_data[:NONCE_SIZE]
    tag = encrypted_data[-16:]
    ciphertext = encrypted_data[NONCE_SIZE:-16]
    
    cipher = Cipher(algorithms.AES(key), modes.GCM(nonce, tag), backend=default_backend())
    decryptor = cipher.decryptor()
    
    return decryptor.update(ciphertext) + decryptor.finalize()