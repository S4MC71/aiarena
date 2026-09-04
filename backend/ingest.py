"""
Arena Web Security RAG Ingestion Pipeline
Supports:
  - python backend/ingest.py                 (Safely re-indexes current files in data/)
  - python backend/ingest.py --clear         (Wipes all data from Qdrant)
  - python backend/ingest.py --delete <file> (Deletes a specific document)
  - python backend/ingest.py --list          (Lists indexed documents)
"""

import os
import glob
import sys
import argparse
from sentence_transformers import SentenceTransformer
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct, Filter, FieldCondition, MatchValue

# 1. Config
QDRANT_URL = os.getenv("QDRANT_URL", "http://localhost:6333")
COLLECTION_NAME = "arena_knowledge_base"
EMBEDDING_MODEL_NAME = "BAAI/bge-m3"
DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")

print(f"[*] Connecting to Qdrant at: {QDRANT_URL}")
try:
    client = QdrantClient(url=QDRANT_URL)
    # Check connectivity
    client.get_collections()
except Exception as e:
    print(f"[!] Could not connect to Qdrant Docker ({e}). Falling back to local disk storage...")
    client = QdrantClient(path="./qdrant_local_data")

def get_embedder():
    print(f"[*] Loading Embedding Model: {EMBEDDING_MODEL_NAME}...")
    embedder = SentenceTransformer(EMBEDDING_MODEL_NAME)
    dim = embedder.get_embedding_dimension() if hasattr(embedder, "get_embedding_dimension") else embedder.get_sentence_embedding_dimension()
    return embedder, dim

def clear_collection(dim=1024):
    """Completely resets the collection in Qdrant"""
    print(f"[*] Resetting Qdrant collection: {COLLECTION_NAME}...")
    try:
        client.delete_collection(collection_name=COLLECTION_NAME)
    except Exception as e:
        pass
    client.create_collection(
        collection_name=COLLECTION_NAME,
        vectors_config=VectorParams(size=dim, distance=Distance.COSINE)
    )
    print(f"[✓] Collection '{COLLECTION_NAME}' is now fresh and empty.")

def delete_document(doc_name: str):
    """Deletes specific document vectors from Qdrant"""
    print(f"[*] Removing '{doc_name}' from Qdrant...")
    try:
        client.delete(
            collection_name=COLLECTION_NAME,
            points_selector=Filter(
                must=[
                    FieldCondition(
                        key="doc_name",
                        match=MatchValue(value=doc_name)
                    )
                ]
            )
        )
        # Also remove physical file if it exists in data/
        local_file = os.path.join(DATA_DIR, doc_name)
        if os.path.exists(local_file):
            os.remove(local_file)
            print(f"[*] Deleted local file: {local_file}")
        print(f"[✓] Successfully removed '{doc_name}' from knowledge base.")
    except Exception as err:
        print(f"[!] Error deleting document: {err}")

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
    embedder, embedding_dim = get_embedder()
    
    # Fresh start to eliminate stale deleted files
    clear_collection(embedding_dim)

    files = glob.glob(os.path.join(DATA_DIR, "*.*"))
    if not files:
        print(f"[!] No data files found in: {DATA_DIR}. Knowledge base is empty.")
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

    if points:
        print(f"[*] Storing {len(points)} vector points into Qdrant...")
        client.upsert(
            collection_name=COLLECTION_NAME,
            points=points
        )
        print(f"[✓] INGESTION COMPLETE! {len(points)} knowledge chunks are now live in Qdrant.")
    else:
        print("[!] No text extracted.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Arena RAG Ingest & Knowledge Base Manager")
    parser.add_argument("--clear", action="store_true", help="Wipe all vectors from Qdrant knowledge base")
    parser.add_argument("--delete", type=str, help="Delete a specific file name from knowledge base (e.g. syllabus.md)")
    
    args = parser.parse_args()

    if args.clear:
        clear_collection()
    elif args.delete:
        delete_document(args.delete)
    else:
        ingest_all()
