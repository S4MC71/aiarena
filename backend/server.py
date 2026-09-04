"""
Arena Web Security FastAPI RAG Backend
Connects Qdrant Vector Store + Local LLM (Ollama / vLLM)
Streams clean, organized responses back to the React Frontend.
"""

import os
import json
import asyncio
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
from qdrant_client import QdrantClient
from openai import AsyncOpenAI

# 1. Config
QDRANT_URL = os.getenv("QDRANT_URL", "http://localhost:6333")
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434/v1")
COLLECTION_NAME = "arena_knowledge_base"
DEFAULT_MODEL = os.getenv("DEFAULT_MODEL", "qwen2.5:14b")

app = FastAPI(title="Arena Web Security RAG Engine")

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Clients
print("[*] Initializing Embedding Model...")
embedder = SentenceTransformer("BAAI/bge-m3")

print(f"[*] Initializing Qdrant Client ({QDRANT_URL})...")
try:
    qdrant = QdrantClient(url=QDRANT_URL)
except:
    qdrant = QdrantClient(path="./qdrant_local_data")

print(f"[*] Initializing LLM Client ({OLLAMA_BASE_URL})...")
llm = AsyncOpenAI(base_url=OLLAMA_BASE_URL, api_key="ollama")

class ChatRequest(BaseModel):
    query: str
    session_id: str
    model: str = DEFAULT_MODEL
    top_k: int = 4
    similarity_threshold: float = 0.60
    system_prompt: str = ""
    temperature: float = 0.2

@app.post("/api/chat")
async def chat_endpoint(req: ChatRequest):
    """
    RAG Query & Decision Pipeline:
    1. Embed query -> Search Qdrant
    2. If similarity >= threshold: Augment prompt with course data
    3. If similarity < threshold: Use general cybersecurity fallback
    4. VPS LLM formats and organizes the clean response.
    """
    # 1. Embed query
    query_vector = embedder.encode(req.query).tolist()

    # 2. Search Vector DB
    try:
        search_results = qdrant.search(
            collection_name=COLLECTION_NAME,
            query_vector=query_vector,
            limit=req.top_k
        )
    except Exception as e:
        print(f"[!] Qdrant search error: {e}")
        search_results = []

    top_score = search_results[0].score if search_results else 0.0
    print(f"[*] Query: '{req.query}' | Top Score: {top_score:.3f} | Threshold: {req.similarity_threshold}")

    # 3. Decision Logic (Found in Data vs Fallback)
    if top_score >= req.similarity_threshold:
        # DATA FOUND IN ARENA KNOWLEDGE BASE
        context_text = "\n\n".join([
            f"--- Document: {hit.payload['doc_name']} ---\n{hit.payload['text']}"
            for hit in search_results
        ])
        
        system_instruction = (
            "You are the official Arena Web Security AI mentor for students. "
            "The following official course context was retrieved:\n\n"
            f"{context_text}\n\n"
            "Instructions:\n"
            "- Answer the student's question accurately using this context.\n"
            "- Organize the response neatly with clear headings, bullet points, or code snippets.\n"
            "- Write in a friendly, professional tone matching the student's language (Bengali or English).\n"
            "- DO NOT output raw chunk citations like [1] or [2] or bracket tags. Output pure, clean, polished text."
        )
    else:
        # DATA NOT FOUND IN COURSE REPO -> GENERAL CYBERSECURITY FALLBACK
        system_instruction = (
            "You are the official Arena Web Security AI mentor for students. "
            "This question is not covered in our official internal course documents or FAQ.\n"
            "Instructions:\n"
            "- Answer the student's question using your broad cybersecurity and ethical hacking knowledge.\n"
            "- If the question is about specific course operations (e.g. fees, batch changes), advise the student to contact the Arena support desk.\n"
            "- Organize the response clearly and concisely with clean formatting."
        )

    # 4. Stream response from VPS LLM
    async def response_stream():
        try:
            stream = await llm.chat.completions.create(
                model=req.model.lower().replace(" ", ""),
                messages=[
                    {"role": "system", "content": system_instruction},
                    {"role": "user", "content": req.query}
                ],
                temperature=req.temperature,
                stream=True
            )

            async for chunk in stream:
                token = chunk.choices[0].delta.content or ""
                if token:
                    yield f"data: {json.dumps({'token': token})}\n\n"

            yield "data: [DONE]\n\n"

        except Exception as err:
            yield f"data: {json.dumps({'token': f'\\n[LLM Error: {str(err)}]' })}\n\n"
            yield "data: [DONE]\n\n"

    return StreamingResponse(response_stream(), media_type="text/event-stream")

@app.get("/api/documents")
async def get_documents():
    """Returns list of indexed files"""
    try:
        count = qdrant.count(collection_name=COLLECTION_NAME).count
    except:
        count = 0
# 5. Serve Built Frontend (Single Port 8000 Deployment)
dist_dir = os.path.join(os.path.dirname(__file__), "..", "dist")
if os.path.exists(dist_dir):
    from fastapi.staticfiles import StaticFiles
    app.mount("/", StaticFiles(directory=dist_dir, html=True), name="static")
    print(f"[*] Serving Frontend from: {dist_dir}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)
