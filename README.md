# 🛡️ Kinetic Armor: AI-Powered Asset Protection System

<div align="center">

[![Python 3.10+](https://img.shields.io/badge/Python-3.10%2B-blue?logo=python)](https://www.python.org/)
[![React 19+](https://img.shields.io/badge/React-19%2B-61DAFB?logo=react)](https://react.dev/)
[![Flask 3+](https://img.shields.io/badge/Flask-3%2B-000000?logo=flask)](https://flask.palletsprojects.com/)
[![Gemini AI](https://img.shields.io/badge/Google%20Gemini-Enabled-4285F4?logo=google-gemini)](https://ai.google.dev/)
[![ImageHash](https://img.shields.io/badge/pHash-Fingerprinting-orange)](https://github.com/JohannesBuchner/imagehash)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

**An autonomous security suite combining Perceptual Hashing (pHash) and Google Gemini AI for real-time asset fingerprinting, theft detection, and automated legal enforcement.**

[Live Demo](https://kinetic-armor.up.railway.app) • [GitHub Issues](https://github.com/yourusername/Kinetic-Armor/issues) • [Releases](https://github.com/yourusername/Kinetic-Armor/releases)

![Kinetic Armor Demo](./kinetic_armor_demo.webp)

</div>

---

## 📚 Table of Contents

- [Overview](#-overview)
- [System Architecture](#-system-architecture)
- [Key AI Capabilities](#-key-ai-capabilities)
- [Quick Start](#-quick-start)
- [Usage Guide](#-usage-guide)
- [Project Structure](#-project-structure)
- [Data Dictionary](#-data-dictionary)
- [MLOps & Monitoring](#-mlops--monitoring)
- [License & Support](#-license--support)

---

## 🎯 Overview

Digital intellectual property theft is rampant, and traditional watermarking is no longer sufficient in the age of generative AI. **Kinetic Armor** introduces a **Perceptual Security Architecture** that protects visual assets by generating a unique digital fingerprint (pHash). 

Unlike cryptographic hashes, perceptual hashes survive modifications like resizing, color shifts, and minor editing. When unauthorized use is detected by our scanning engine, the system utilizes **Google Gemini AI** to analyze the context and generate automated, legally-compliant enforcement actions.

---

## 🏗️ System Architecture

```text
┌────────────────────────────────────────────────────────────────────────┐
│ 1. ASSET REGISTRATION & FINGERPRINTING                                 │
│ Generates Perceptual Hash (pHash) • Secure Metadata Storage            │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
┌──────────────────────────────────▼─────────────────────────────────────┐
│ 2. AUTONOMOUS SCANNING ENGINE (MOCK CRAWLER)                           │
│ Simulates cross-platform detection • Hamming Distance Comparison        │
│ Detects matches even with modifications (resize, crop, color)          │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
┌──────────────────────────────────▼─────────────────────────────────────┐
│ 3. GOOGLE GEMINI AI ENFORCEMENT ENGINE                                 │
│ ├── Context Analysis: Evaluates source URL and usage severity          │
│ └── Legal Automation: Generates customized DMCA/Takedown notices       │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
┌──────────────────────────────────▼─────────────────────────────────────┐
│ 4. COMMAND CENTER (DASHBOARD)                                          │
│ ├── Real-time Alerts: Instant notification of detected "Strikes"       │
│ └── Asset Management: CRUD operations for protected creative works      │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
            ┌──────────────────────┴──────────────────────┐
┌───────────▼───────────┐                     ┌───────────▼───────────┐
│ React Frontend        │                     │ Flask Backend         │
│ Kinetic Orange UI     │                     │ REST API + SQLite     │
│ (Vite Optimized)      │                     │ Perceptual Processing │
└───────────────────────┘                     └───────────────────────┘
```

---

## 🧠 Key AI Capabilities

### 1. Robust Perceptual Fingerprinting
The system uses `ImageHash` to generate a 64-bit fingerprint of every asset. This ensures that even if a thief resizes or slightly modifies an image, the **Hamming Distance** calculation will still flag the violation with high confidence.

### 2. Generative Legal Enforcement (Google Gemini)
When a strike is detected, **Gemini Pro** is invoked to:
- Summarize the nature of the violation.
- Draft a professional DMCA takedown notice.
- Provide recommendations on the next legal steps based on the detected context.

### 3. Automated Risk Scoring
The backend calculates a "Similarity Score" for found assets. If the score exceeds a configurable threshold, a **Strike** is automatically issued, categorization as "Critical", "Warning", or "Info".

---

## 📦 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- Google AI (Gemini) API Key

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/Kinetic-Armor.git
cd Kinetic-Armor

# 2. Setup Backend
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# 3. Setup Frontend
cd ..
npm install
```

---

## 💻 Usage Guide

### 1. Initialize the Environment
Create a `.env` file in the `backend/` directory:
```env
GEMINI_API_KEY=your_key_here
PORT=5000
```

### 2. Start the Backend Server
```bash
cd backend
python app.py
```

### 3. Launch the Dashboard
```bash
# In the root directory
npm run dev
```
Access the UI at: `http://localhost:5173`

### 4. Simulate a Strike (Demo Mode)
Run the mock crawler to find a "stolen" asset:
```bash
python scripts/mock_crawler.py
```

---

## 📁 Project Structure
```plaintext
Kinetic-Armor/
├── 🛡️ backend/               # Flask Application
│   ├── app.py                # Main API Entry Point
│   ├── models.py             # Database Schemas (Asset, Violation)
│   ├── services/             # Core Logic (AI, Fingerprinting)
│   └── uploads/              # Temporary storage for armoring
├── 📊 src/                   # React Frontend
│   ├── pages/                # Landing & Dashboard Views
│   ├── components/           # Modular UI Elements
│   └── api.js                # Centralized API Bridge
├── ⚙️ scripts/                # Utility scripts (Mock Crawler, etc.)
├── 📦 public/                 # Static assets & icons
└── 🧪 tests/                  # Backend test suite
```

---

## 📖 Data Dictionary
How to interpret the dashboard metrics:

| Metric | Description | Business Interpretation |
| :--- | :--- | :--- |
| **pHash** | Perceptual Hash String | The digital fingerprint of the asset. |
| **Hamming Dist** | Statistical Difference | Lower = Closer match (higher theft probability). |
| **Similarity** | Percentage Match | Calculated as (1 - distance/64) * 100. |
| **Strike** | Violation Event | An instance of detected unauthorized use. |
| **Gemini Draft** | AI Generated Notice | Professional legal correspondence ready to send. |

---

## 🛡️ MLOps & Monitoring

- **Railway Deployment:** Configured with `railway.toml` for automated CI/CD and service orchestration.
- **Dynamic API Pathing:** `src/api.js` automatically toggles between local dev and production endpoints.
- **Logging:** Centralized error logging for AI service availability and database integrity.

---

## 📄 License & Support

Distributed under the MIT License. See `LICENSE` for more information.

*   **Support:** Open a GitHub Issue for bugs or feature requests.
*   **Contact:** your-email@example.com

⭐ Star this repo if you find Kinetic Armor useful!

Made with ❤️ by **Anvay** (Google Solution Challenge 2026)
