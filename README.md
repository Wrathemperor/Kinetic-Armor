# Kinetic Armor 🛡️

**Protecting Creative Integrity in the Age of Digital Theft.**

Kinetic Armor is a comprehensive asset protection platform designed to safeguard intellectual property (IP) for creators and businesses. By leveraging **Perceptual Hashing (pHash)** and **Google Gemini AI**, Kinetic Armor detects unauthorized use of visual assets and automates the enforcement process with context-aware precision.

---

## 🚀 The Problem
Digital assets—logos, designs, and artwork—are stolen and modified every second. Traditional watermarks are easily cropped or removed by AI tools. Creators lack an automated, "smart" way to track their assets across the web and take action without hiring expensive legal teams.

## ✨ The Solution
**Kinetic Armor** acts as a digital fingerprinting and enforcement agent:
1. **Secure Registration**: Creators "armor" their assets, generating a unique perceptual hash (fingerprint) that survives resizing, compression, and minor edits.
2. **Autonomous Scanning**: Simulates web-crawling to identify matching fingerprints in the wild.
3. **AI Enforcement (Powered by Google Gemini)**: When a violation is found, Gemini analyzes the context (source URL, usage type) and drafts a legally-sound, personalized DMCA takedown notice in seconds.

---

## 🛠️ Technology Stack
- **Frontend**: React.js, Vite, Tailwind CSS (Modern "Kinetic Orange" Obsidian aesthetic).
- **Backend**: Flask (Python), SQLAlchemy.
- **Database**: SQLite (Asset & Violation tracking).
- **AI Core**: **Google Generative AI (Gemini Pro)** for contextual analysis and legal drafting.
- **Fingerprinting**: `ImageHash` (Perceptual Hashing) for robust image recognition.

---

## 🌟 Google Cloud & AI Integration
Kinetic Armor is built for the **Google Solution Challenge**, utilizing:
- **Gemini Pro API**: The brain behind the "Strike Mechanism." It evaluates potential infringements and generates automated responses.
- **Cloud Deployment**: Architecture ready for Google Cloud Run / Railway.

---

## 📦 Installation & Setup

### Prerequisites
- Python 3.10+
- Node.js 18+
- Google AI (Gemini) API Key

### 1. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```
Create a `.env` file in the `backend/` directory:
```env
GEMINI_API_KEY=your_google_api_key_here
PORT=5000
```
Initialize the database (optional if assets.db exists):
```bash
python seed.py
```

### 2. Frontend Setup
```bash
npm install
```

### 3. Running the App
**Start Backend:**
```bash
cd backend
python app.py
```
**Start Frontend:**
```bash
npm run dev
```

---

## 📈 Future Roadmap
- [ ] **Blockchain Integration**: Minting "Armor Certificates" as on-chain proof of authorship.
- [ ] **Video Fingerprinting**: Extending protection to short-form video content.
- [ ] **Real-time Webhook Monitoring**: Integrating with social media APIs for instant alerts.

---

## 👥 The Team
- **Anvay** - Lead Developer & Architect

---

## 📄 License
Distributed under the MIT License. See `LICENSE` for more information.
