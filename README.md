# 🛡️ Arena Web Security — AI Mentor & RAG Chatbot

An intelligent, full-stack RAG (Retrieval-Augmented Generation) AI Mentor built specifically for **Arena Web Security** students. It answers queries about course modules, lab VPN configurations, class schedules, and cybersecurity concepts with clean formatting and zero clutter.

Features an **Industrial Dark-Blue Neumorphism UI**, vector semantic search with **Qdrant**, multi-lingual & Banglish language understanding, and local LLM inference powered by **Ollama**.

---

## ⚡ 1-Command Instant VPS Deployment

To deploy this complete system (Frontend + Backend + Qdrant Vector DB + Ollama 7B LLM) on any fresh **Ubuntu 24.04 / 22.04 LTS VPS**, simply SSH into your server and run:

```bash
git clone https://github.com/S4MC71/aiarena.git && cd aiarena && bash setup_vps.sh
```

### What this script automates:
1. Installs all system dependencies, Docker, Node.js 20, and Python venv.
2. Installs **Ollama** and pulls `qwen2.5:7b` (fast 4-vCPU inference).
3. Launches **Qdrant Vector Database** container in Docker.
4. Compiles the React production bundle (`dist/`).
5. Ingests all course files from `data/` into Qdrant using the `bge-m3` embedding model.
6. Configures UFW firewall and launches the FastAPI server in the background on port `8000`.

Once complete, access your live bot at:
```text
http://<YOUR_VPS_IP>:8000
```

---

## 📂 Project Structure

```text
aiarena/
├── backend/
│   ├── server.py              # FastAPI server (RAG semantic router, SSE stream, static UI mount)
│   ├── ingest.py              # Ingestion pipeline (chunking, embedding, delete/clear options)
│   └── requirements.txt       # Python dependencies (fastapi, qdrant-client, openai, etc.)
├── data/                      # Course documents (Markdown/Text)
│   ├── syllabus.md            # 8 modules of Arena Web Security
│   ├── lab_vpn_guide.md       # OpenVPN config, 10.10.10.x subnet, reset rules
│   └── class_faq.md           # Schedule (Tue/Fri 9 PM), recordings, mentor hours
├── src/                       # React + TypeScript Frontend
│   ├── components/            # Sidebar, ChatNavbar, ChatInput, MessageItem, Modals
│   ├── services/              # API and Mock data handlers
│   └── index.css              # Industrial Neumorphic theme tokens and components
├── setup_vps.sh               # 1-Click automated deployment script
└── package.json               # Frontend dependencies & build scripts
```

---

## 🧠 Knowledge Base Management (RAG)

Whenever you want to add, update, or remove course information:

### 1. Adding New Documents:
Create or paste any `.txt` or `.md` file in the `data/` directory:
```bash
nano data/new_topic.txt
```
Then run the ingestion script:
```bash
source venv/bin/activate
python backend/ingest.py
```
*The running server automatically connects to Qdrant, so the very next question will immediately use the new document without needing a restart!*

### 2. Deleting a Specific Document:
```bash
python backend/ingest.py --delete class_faq.md
```

### 3. Wiping the Entire Knowledge Base:
```bash
python backend/ingest.py --clear
```

---

## 💰 Cloud Cost Saving Tip (Vultr Snapshots)

To avoid paying hourly charges when you are not actively using the VPS:
1. Go to your **Vultr Dashboard** -> **Snapshots** -> Click **Take Snapshot** (e.g., name it `arena-bot-backup`).
2. Once the snapshot is ready (takes ~3-5 min), **Destroy/Delete the VPS**. Hourly billing stops immediately!
3. When you need the chatbot again: Click **Deploy New Instance** -> Select **Snapshots** -> Choose `arena-bot-backup`.
4. Your server boots up in 60 seconds with Ollama, models, Qdrant, and the chatbot **already running**—no reinstallation needed!

---

## 🛠️ Server Management Cheat Sheet

* **Check server logs in real time:**
  ```bash
  tail -f backend.log
  ```
* **Verify server process status:**
  ```bash
  ps aux | grep uvicorn
  ```
* **Stop the server:**
  ```bash
  fuser -k 8000/tcp
  ```
* **Restart the server manually:**
  ```bash
  cd ~/aiarena
  source venv/bin/activate
  nohup uvicorn backend.server:app --host 0.0.0.0 --port 8000 > backend.log 2>&1 &
  ```

---

## 💻 Local Development

### Frontend:
```bash
npm install
npm run dev
```

### Backend:
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
pip install -r backend/requirements.txt
python backend/server.py
```
