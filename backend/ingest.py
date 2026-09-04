"""
Arena Web Security RAG Ingestion Pipeline
Run this script whenever you have new course files or FAQs to index:
    python ingest.py
"""

import os
import glob
from sentence_transformers import SentenceTransformer
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct

# 1. Config
QDRANT_URL = os.getenv("QDRANT_URL", "http://localhost:6333")
COLLECTION_NAME = "arena_knowledge_base"
EMBEDDING_MODEL_NAME = "BAAI/bge-m3"  # High quality multilingual model (or all-MiniLM-L6-v2)
DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")

print(f"[*] Loading Embedding Model: {EMBEDDING_MODEL_NAME}...")
embedder = SentenceTransformer(EMBEDDING_MODEL_NAME)
embedding_dim = embedder.get_sentence_embedding_dimension()

# 2. Connect to Qdrant
print(f"[*] Connecting to Qdrant at: {QDRANT_URL}")
try:
    client = QdrantClient(url=QDRANT_URL)
    # Check or create collection
    collections = client.get_collections().collections
    exists = any(c.name == COLLECTION_NAME for c in collections)
    if not exists:
        print(f"[*] Creating Qdrant collection: {COLLECTION_NAME} (dim={embedding_dim})")
        client.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=VectorParams(size=embedding_dim, distance=Distance.COSINE)
        )
except Exception as e:
    print(f"[!] Could not connect to Qdrant Docker ({e}). Falling back to local disk storage...")
    client = QdrantClient(path="./qdrant_local_data")
    try:
        client.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=VectorParams(size=embedding_dim, distance=Distance.COSINE)
        )
    except:
        pass

def chunk_text(text: str, chunk_size: int = 500, overlap: int = 60) -> list[str]:
    """Splits document text into overlapping chunks"""
    words = text.split()
    chunks = []
    i = 0
    while i < len(words):
        chunk = " ".join(words[i:i + chunk_size])
        chunks.append(chunk)
        i += chunk_size - overlap
    return chunks

def ingest_all():
    files = glob.glob(os.path.join(DATA_DIR, "*.*"))
    if not files:
        print(f"[!] No data files found in: {DATA_DIR}")
        return

    print(f"[*] Found {len(files)} files to index into Qdrant...")
    points = []
    point_id = 1

    for file_path in files:
        file_name = os.path.basename(file_path)
        print(f" -> Processing: {file_name}")
        
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()
        except Exception as err:
            print(f"    [!] Error reading {file_name}: {err}")
            continue

        chunks = chunk_text(content)
        print(f"    Generated {len(chunks)} chunks.")

        for chunk_idx, chunk in enumerate(chunks):
            # Generate embedding vector
            vector = embedder.encode(chunk).tolist()
            
            payload = {
                "doc_name": file_name,
                "chunk_id": chunk_idx + 1,
                "text": chunk
            }
            
            points.append(PointStruct(
                id=point_id,
                vector=vector,
                payload=payload
            ))
            point_id += 1

    # Upsert to Qdrant
    print(f"[*] Storing {len(points)} vector points into Qdrant...")
    client.upsert(
        collection_name=COLLECTION_NAME,
        points=points
    )
    print(f"[✓] INGESTION COMPLETE! {len(points)} knowledge chunks are now live in Qdrant.")

if __name__ == "__main__":
    ingest_all()
