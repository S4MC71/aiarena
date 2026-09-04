#!/bin/bash
set -e

# Always ensure we are in the project directory
cd "$(dirname "$0")"

echo "=================================================="
echo "  Arena Web Security - 1-Click Fast VPS Deploy"
echo "=================================================="

# 1. Update and install packages (non-interactive, no prompts)
echo "[*] 1/6 Installing system tools & Docker..."
export DEBIAN_FRONTEND=noninteractive
sudo apt-get update -y
sudo apt-get install -y curl git ufw python3-pip python3-venv docker.io psmisc

# 2. Install and configure Ollama
echo "[*] 2/6 Installing Ollama..."
if ! command -v ollama &> /dev/null; then
    curl -fsSL https://ollama.com/install.sh | sh
fi

sudo mkdir -p /etc/systemd/system/ollama.service.d/
cat <<EOF | sudo tee /etc/systemd/system/ollama.service.d/override.conf
[Service]
Environment="OLLAMA_HOST=0.0.0.0:11434"
Environment="OLLAMA_ORIGINS=*"
EOF
sudo systemctl daemon-reload
sudo systemctl restart ollama

echo "[*] Pulling Qwen 2.5 7B model (~4.4GB, fast download)..."
ollama pull qwen2.5:7b

# 3. Start Qdrant Vector DB
echo "[*] 3/6 Starting Qdrant Vector DB in Docker..."
sudo systemctl enable docker
sudo systemctl start docker
docker rm -f qdrant 2>/dev/null || true
docker run -d --name qdrant \
  -p 6333:6333 \
  -v /root/qdrant_storage:/qdrant/storage:z \
  --restart always \
  qdrant/qdrant:latest

# 4. Install Node.js 20 & build Frontend
echo "[*] 4/6 Installing Node.js & building React frontend..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi
npm install
npm run build

# 5. Setup Python Virtual Environment & Ingest Data
echo "[*] 5/6 Setting up Python environment & ingesting data..."
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r backend/requirements.txt

echo "[*] Ingesting course documents into Qdrant..."
python backend/ingest.py

# 6. Firewall & Background Service Setup
echo "[*] 6/6 Configuring firewall & launching server..."
sudo ufw allow 22/tcp
sudo ufw allow 8000/tcp
sudo ufw --force enable

fuser -k 8000/tcp 2>/dev/null || true
pkill -9 -f "uvicorn" 2>/dev/null || true

nohup $(pwd)/venv/bin/uvicorn backend.server:app --host 0.0.0.0 --port 8000 > backend.log 2>&1 &

echo "=================================================="
echo "  🎉 DEPLOYMENT COMPLETE! BOT IS LIVE!"
echo "=================================================="
echo "Visit in your browser: http://$(curl -s ifconfig.me):8000"
echo "View live logs: tail -f backend.log"
