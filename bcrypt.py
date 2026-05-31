import hashlib

print("[TradeDeck Local] Usando fallback de bcrypt en Python puro (SHA-256) para evitar dependencias de compilación.")

def gensalt(rounds=12, prefix=b"2b"):
    return b"$2b$12$dummybarsaltforeveryone"

def hashpw(password: bytes, salt: bytes) -> bytes:
    if isinstance(password, str):
        password = password.encode('utf-8')
    # Hashing SHA-256
    h = hashlib.sha256()
    h.update(password)
    h.update(salt)
    return f"$pbkdf2-sha256${h.hexdigest()}".encode('utf-8')

def checkpw(password: bytes, hashed_password: bytes) -> bool:
    if isinstance(password, str):
        password = password.encode('utf-8')
    if isinstance(hashed_password, str):
        hashed_password = hashed_password.encode('utf-8')
        
    if hashed_password.startswith(b"$pbkdf2-sha256$"):
        expected = hashpw(password, b"$2b$12$dummybarsaltforeveryone")
        return expected == hashed_password
    
    return False
