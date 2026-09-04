#!/bin/bash
set -e

echo "=================================================="
echo "  Arena Web Security - VPS Automated Setup"
echo "=================================================="

# 1. Update and install packages
echo "[*] 1/6 Updating packages and installing dependencies..."
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git ufw python3-pip python3-venv docker.io

# 2. Install and configure Ollama
echo "[*] 2/6 Installing Ollama..."
curl -fsSL https://ollama.com/install.sh | sh

# Configure Ollama environment
sudo mkdir -p /etc/systemd/system/ollama.service.d/
cat <<EOF | sudo tee /etc/systemd/system/ollama.service.d/override.conf
[Service]
Environment="OLLAMA_HOST=0.0.0.0:11434"
Environment="OLLAMA_ORIGINS=*"
EOF
sudo systemctl daemon-reload
sudo systemctl restart ollama

echo "[*] Pulling Qwen 2.5 14B model (approx ~9GB, downloading...)..."
ollama pull qwen2.5:14b

# 3. Start Qdrant Vector DB
echo "[*] 3/6 Starting Qdrant Vector Database via Docker..."
sudo systemctl enable docker
sudo systemctl start docker
docker stop qdrant 2>/dev/null || true
docker rm qdrant 2>/dev/null || true
docker run -d --name qdrant \
  -p 6333:6333 \
  -v /root/qdrant_storage:/qdrant/storage:z \
  --restart always \
  qdrant/qdrant:latest

# 4. Install Node.js and build Frontend
echo "[*] 4/6 Installing Node.js 20 & building React frontend..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
npm install
npm run build

# 5. Setup Python Virtual Environment & Ingest Data
echo "[*] 5/6 Setting up Python backend and ingesting course documents..."
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r backend/requirements.txt

echo "[*] Ingesting documents into Qdrant..."
python backend/ingest.py

# 6. Firewall & Background Service Setup
echo "[*] 6/6 Configuring firewall..."
sudo ufw allow 22/tcp
sudo ufw allow 8000/tcp
sudo ufw allow 6333/tcp
sudo ufw allow 11434/tcp
sudo ufw --force enable

# Kill any existing server on port 8000
pkill -f "uvicorn backend.server:app" 2>/dev/null || true

echo "=================================================="
echo "  Setup Complete! Starting Server..."
echo "=================================================="
nohup uvicorn backend.server:app --host 0.0.0.0 --port 8000 > backend.log 2>&1 &

echo "[✔] Arena Web Security AI Bot is running!"
echo "Open your browser and visit: http://<YOUR_VPS_IP>:8000"
echo "View server logs with: tail -f backend.log"
