# Vultr VPS-এ LLM ও RAG ব্যাকএন্ড সেটআপ গাইড

এই গাইডটি অনুসরণ করে আপনি Vultr VPS-এ আপনার নিজস্ব ওপেন-সোর্স LLM (**Qwen 2.5 7B** বা **Llama 3.1 8B**) এবং **Qdrant ভেক্টর ডাটাবেজ** সেটআপ করে আমাদের ফ্রন্টএন্ডের সাথে যুক্ত করতে পারবেন।

---

## ১. Vultr ইনস্ট্যান্স নির্বাচন (Hardware Recommendations)

Vultr-এ ইনস্ট্যান্স খোলার সময় নিচের যেকোনো একটি বেছে নিন:

| অপশন | ইনস্ট্যান্স টাইপ | স্পেসিফিকেশন | খরচ ও পারফরম্যান্স |
|---|---|---|---|
| **অপশন ক: GPU (সেরা স্পিড)** | **Cloud GPU** | 1x NVIDIA A16 (16GB VRAM) বা A40 | দ্রুত রেসপন্স (৩৫+ টোকেন/সেকেন্ড)। বাজেট থাকলে এটি সেরা। |
| **অপশন খ: CPU (বাজেট ফ্রেন্ডলি)** | **Cloud Compute (Optimized)** | General Purpose: 4-8 vCPU, 16GB–32GB RAM | মাঝারি রেসপন্স (৮-১৫ টোকেন/সেকেন্ড)। খরচ কম। |

* **Operating System**: **Ubuntu 24.04 LTS** বা **Ubuntu 22.04 LTS x64**।

---

## ২. প্রাথমিক সার্ভার প্রস্তুতি

আপনার টার্মিনাল বা SSH দিয়ে সার্ভারে প্রবেশ করুন:
```bash
ssh root@<YOUR_VULTR_IP>
```

সিস্টেম আপডেট এবং প্রয়োজনীয় টুলস ইনস্টল করুন:
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git ufw python3-pip python3-venv
```

---

## ৩. Ollama দিয়ে ১ মিনিটে LLM হোস্ট করা

সবচেয়ে সহজ, স্থিতিশীল এবং ওপেনএআই-কম্প্যাটিবল API পাওয়ার জন্য **Ollama** সেরা।

### ক. Ollama ইনস্টল করুন:
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

### খ. বাহির থেকে API অ্যাক্সেস করার জন্য Ollama কনফিগার করুন:
ডিফল্টভাবে Ollama শুধু `localhost`-এ চলে। পাবলিকলি বা ব্যাকএন্ড থেকে পাওয়ার জন্য:
```bash
sudo systemctl edit ollama.service
```
ফাইলটি ওপেন হলে নিচের লাইন দুটি যোগ করে সেভ করুন (`Ctrl+O`, `Enter`, `Ctrl+X`):
```ini
[Service]
Environment="OLLAMA_HOST=0.0.0.0:11434"
Environment="OLLAMA_ORIGINS=*"
```

সার্ভিস রিস্টার্ট দিন:
```bash
sudo systemctl daemon-reload
sudo systemctl restart ollama
```

### গ. মডেল ডাউনলোড ও টেস্ট করুন:
Arena Web Security-এর জন্য **Qwen 2.5 7B** (বাংলা ও ইংরেজি উভয় ভাষায় সেরা):
```bash
ollama run qwen2.5:7b
```
*(টেস্ট শেষে বের হতে `/bye` লিখুন)*।

---

## ৪. Qdrant ভেক্টর ডাটাবেজ সেটআপ (Docker দিয়ে)

ডকুমেন্টস ও সিলেবাস ভেক্টরাইজ করে রাখার জন্য Qdrant সবচেয়ে হালকা ও দ্রুত।

### ক. Docker ইনস্টল করুন:
```bash
curl -fsSL https://get.docker.com | sh
```

### খ. Qdrant কন্টেইনার চালু করুন:
```bash
docker run -d --name qdrant \
  -p 6333:6333 \
  -v /root/qdrant_storage:/qdrant/storage:z \
  --restart always \
  qdrant/qdrant:latest
```

ভেরিফাই করতে ব্রাউজারে বা কার্ল দিয়ে দেখুন:
```bash
curl http://localhost:6333/dashboard
```

---

## ৫. FastAPI ব্যাকএন্ড সেটআপ (রাউটার ও ফলব্যাক)

আমাদের ফ্রন্টএন্ডের জন্য [BACKEND_CONTRACT.md](BACKEND_CONTRACT.md) ফাইল অনুযায়ী একটি পাইথন ডিরেক্টরি তৈরি করুন:

```bash
mkdir -p /root/arena_backend
cd /root/arena_backend
python3 -m venv venv
source venv/bin/activate
pip install fastapi uvicorn pydantic qdrant-client sentence-transformers openai python-multipart
```

`main.py` তৈরি করুন:
```bash
nano main.py
```
*(এই ফাইলে আপনার অন্য মডেলের বানানো রাউটার কোড বা [BACKEND_CONTRACT.md](BACKEND_CONTRACT.md)-এর টেমপ্লেটটি পেস্ট করুন)*।

ব্যাকএন্ড ব্যাকগ্রাউন্ডে চালু রাখতে:
```bash
nohup uvicorn main:app --host 0.0.0.0 --port 8000 > backend.log 2>&1 &
```

---

## ৬. Vultr ফায়ারওয়াল পোর্ট ওপেন করা

পোর্টের অ্যাক্সেস নিশ্চিত করুন:
```bash
sudo ufw allow 22/tcp     # SSH
sudo ufw allow 8000/tcp   # FastAPI Backend
sudo ufw allow 11434/tcp  # Ollama (if connecting directly)
sudo ufw allow 6333/tcp   # Qdrant Dashboard
sudo ufw enable
```

---

## ৭. ফ্রন্টএন্ডের সাথে লাইভ সংযোগ

১. ব্রাউজারে আমাদের ফ্রন্টএন্ড ওপেন করুন (`http://localhost:5173/`)।
২. উপরের ডানপাশের **Parameters / Settings** আইকনে ক্লিক করুন।
৩. **Mock Mode** আনচেক (বন্ধ) করুন।
৪. **VPS API URL**-এ আপনার ভল্টার আইপি বসিয়ে দিন:
   ```text
   http://<YOUR_VULTR_IP>:8000
   ```
৫. **Save Parameters** বাটনে ক্লিক করুন।

এখন স্টুডেন্টদের যেকোনো প্রশ্ন সরাসরি আপনার Vultr VPS-এর মডেল ও ভেক্টর ডাটাবেজ থেকে রিয়েল-টাইম স্ট্রিমিং হয়ে উত্তর দেবে!
