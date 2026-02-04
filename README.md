# 🏢 Smart Office System - Offline Document Management Platform

> **"Instead of building a document editor, we designed a deterministic document creation platform where structure is enforced by schema rather than by user behavior."**

## 📋 Table of Contents
- [Overview](#overview)
- [Architecture Philosophy](#architecture-philosophy)
- [System Engines](#system-engines)
- [Technology Stack](#technology-stack)
- [Installation & Setup](#installation--setup)
- [WSL Commands](#wsl-commands)
- [Features](#features)
- [API Documentation](#api-documentation)
- [Video Demo Script](#video-demo-script)
- [Future Enhancements](#future-enhancements)

---

## 🎯 Overview

**Smart Office System** is an offline-first document management platform designed with an **"Offline OS Mindset"** rather than a traditional web app approach. It runs entirely within a LAN environment, providing enterprise-grade document creation, management, and AI-powered assistance.

### Key Differentiators
- ✅ **Engine-Based Architecture** (not layers)
- ✅ **Schema-Enforced Documents** (ProseMirror JSON)
- ✅ **Offline-First Design** (SQLite + Local Storage)
- ✅ **AI Integration** (GROK API for voice & assistance)
- ✅ **Template System** with validation rules

---

## 🧠 Architecture Philosophy

### Offline OS Mindset
Instead of thinking "frontend + backend + database", we think:
- **Mini Office Operating System** running inside LAN
- **4 Core Engines** working together
- **Deterministic Document Creation** with schema enforcement
- **Hybrid Communication** (REST + WebSocket)

### Why This Approach?
- Reduces complexity through clear separation of concerns
- Makes the system scalable and maintainable
- Easier to add features without breaking existing functionality
- Production-ready architecture that impresses interviewers

---

## ⚙️ System Engines

### 1️⃣ **Document Engine**
**Responsibility:** Core editing and document manipulation

**Features:**
- TipTap (ProseMirror) editor
- Rich text formatting
- Real-time cursor state
- Change tracking (future)

**Why ProseMirror?**
- Schema-based → perfect for templates
- Can enforce document structure
- Good offline plugin ecosystem
- Custom nodes support (address blocks, subject blocks, etc.)

---

### 2️⃣ **Storage Engine**
**Responsibility:** Data persistence and versioning

**Features:**
- SQLite database (offline-friendly, zero config)
- Document versioning system
- Metadata management (author, timestamps, template used)
- Local file storage for backups

**Data Model:**
```javascript
{
  content: ProseMirror JSON,
  templateId: "gov_letter_v1",
  metadata: {
    author: "John Doe",
    wordCount: 1234,
    createdVia: "editor"
  },
  version: 3
}
```

**Why This Format?**
- ✅ Deterministic
- ✅ Easier template validation
- ✅ Safer than raw HTML
- ✅ Version control friendly

---

### 3️⃣ **Template Engine**
**Responsibility:** Document standardization and validation

**Features:**
- Pre-defined templates (Government, Business, General)
- Locked sections enforcement
- Dynamic placeholders
- Validation rules

**Template Structure:**
```javascript
{
  templateStructure: ProseMirror JSON,
  lockedSections: ["header", "footer"],
  placeholders: ["DATE", "SUBJECT", "RECEIVER_NAME"],
  rules: {
    required_sections: ["heading", "date", "subject"],
    max_length: 5000,
    formatting_rules: ["formal_language"]
  }
}
```

**Validation Engine:**
- Checks required sections exist
- Verifies locked sections unchanged
- Enforces formatting rules
- Provides warnings for missing placeholders

---

### 4️⃣ **Voice Engine (AI Powered)**
**Responsibility:** Voice input and AI assistance

**Features:**
- Text-to-speech with GROK AI
- Grammar and spelling correction
- Text formalization
- Document generation from prompts
- Content summarization

**Integration Strategy:**
- **Server-side processing** (easier CPU management)
- **Browser WASM** (future enhancement)

**Flow:**
```
Text Input → GROK API → AI Enhancement → Formatted Output → Editor Insert
```

---

## 🛠 Technology Stack

### Backend (Server)
- **Node.js** + Express.js
- **SQLite3** (better-sqlite3)
- **WebSocket** (express-ws) for future real-time features
- **Axios** for API calls
- **dotenv** for environment variables

### Frontend (Client)
- **React 18** + Vite
- **TipTap** (ProseMirror editor)
- **Axios** for API communication
- **Lucide React** for icons
- **CSS3** (no frameworks - clean custom styles)

### AI Integration
- **GROK API** (X.AI)
  - Voice to text enhancement
  - Grammar correction
  - Document generation
  - Text summarization

### Database Schema
```sql
-- Documents
CREATE TABLE documents (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  template_id TEXT,
  metadata TEXT,
  version INTEGER DEFAULT 1,
  created_at DATETIME,
  updated_at DATETIME,
  author TEXT,
  status TEXT DEFAULT 'draft'
);

-- Templates
CREATE TABLE templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  structure TEXT NOT NULL,
  rules TEXT,
  locked_sections TEXT,
  placeholders TEXT,
  category TEXT
);

-- Document Versions
CREATE TABLE document_versions (
  id INTEGER PRIMARY KEY,
  document_id TEXT,
  version INTEGER,
  content TEXT,
  changed_by TEXT,
  changed_at DATETIME
);

-- Voice Sessions
CREATE TABLE voice_sessions (
  id TEXT PRIMARY KEY,
  document_id TEXT,
  transcription TEXT,
  created_at DATETIME
);
```

---

## 📥 Installation & Setup

### Prerequisites
- Node.js 18+ installed
- WSL2 (if on Windows)
- GROK API Key from [x.ai](https://x.ai)

### Quick Start

1. **Clone/Extract the project**
```bash
cd /mnt/d/Assignment
```

2. **Install dependencies**
```bash
# Install root dependencies
npm install

# Install server dependencies
cd server
npm install
cd ..

# Install client dependencies
cd client
npm install
cd ..
```

3. **Configure GROK API**
```bash
# Edit server/.env file
nano server/.env

# Add your GROK API key:
GROK_API_KEY=your_actual_grok_api_key_here
GROK_API_URL=https://api.x.ai/v1
PORT=3000
CLIENT_URL=http://localhost:5173
```

4. **Start the application**
```bash
# Start both server and client
npm run dev
```

OR run separately:
```bash
# Terminal 1: Start server
cd server
npm run dev

# Terminal 2: Start client
cd client
npm run dev
```

5. **Access the application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- Health Check: http://localhost:3000/health

---

## 🐧 WSL Commands

### Complete Setup from Scratch

```bash
# ===== STEP 1: Navigate to Project =====
cd /mnt/d/Assignment

# ===== STEP 2: Install Node.js (if not installed) =====
# Check if Node.js is installed
node --version
npm --version

# If not installed, install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# ===== STEP 3: Install Project Dependencies =====
# Install root dependencies
npm install

# Install server dependencies
cd server
npm install
cd ..

# Install client dependencies  
cd client
npm install
cd ..

# ===== STEP 4: Setup GROK API Key =====
# Copy example env file
cp server/.env.example server/.env

# Edit .env file (use nano or vim)
nano server/.env
# Paste your GROK API key and save (Ctrl+X, then Y, then Enter)

# ===== STEP 5: Run the Application =====
# Option A: Run both together (recommended)
npm run dev

# Option B: Run separately
# Terminal 1:
cd server && npm run dev

# Terminal 2 (new terminal):
cd client && npm run dev

# ===== STEP 6: Verify Installation =====
# Check if server is running
curl http://localhost:3000/health

# Expected output:
# {"status":"online","timestamp":"...","engines":{...}}

# ===== STEP 7: Access Application =====
# Open browser and go to:
# http://localhost:5173

# ===== USEFUL COMMANDS =====
# Stop all node processes
pkill node

# Check running node processes
ps aux | grep node

# View server logs
cd server && npm run dev

# Build for production
cd client && npm run build

# Check port usage
netstat -tulpn | grep :3000
netstat -tulpn | grep :5173

# Clean install (if issues)
rm -rf node_modules server/node_modules client/node_modules
rm -rf package-lock.json server/package-lock.json client/package-lock.json
npm install
cd server && npm install
cd ../client && npm install

# View SQLite database
cd server/storage
sqlite3 smartoffice.db
# Then run: .tables, SELECT * FROM documents;

# Check Git status (if using git)
git status
git add .
git commit -m "Smart Office System completed"
```

### Troubleshooting Commands

```bash
# If port 3000 is busy
lsof -ti:3000 | xargs kill -9

# If port 5173 is busy
lsof -ti:5173 | xargs kill -9

# Check Node.js and npm versions
node -v
npm -v

# Clear npm cache
npm cache clean --force

# Fix permissions
sudo chown -R $USER:$USER /mnt/d/Assignment

# Check logs
cd server
npm run dev 2>&1 | tee server.log

# Test GROK API
curl -X POST https://api.x.ai/v1/chat/completions \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "grok-beta",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

---

## ✨ Features

### Core Features (Implemented)
- ✅ **Document Creation & Editing** with TipTap editor
- ✅ **Template System** (Government, Business, General)
- ✅ **Document List** with search and filtering
- ✅ **Version Control** (automatic versioning)
- ✅ **AI Text Enhancement** (grammar, formalization)
- ✅ **AI Document Generation** from prompts
- ✅ **Voice Input Processing** with GROK AI
- ✅ **Rich Text Formatting** (bold, italic, lists, alignment)
- ✅ **Metadata Management** (author, timestamps, status)
- ✅ **SQLite Storage** (offline-first)

### Advanced Features
- 🔄 **Real-time Status** indicators for all engines
- 📊 **Document Versioning** with history
- 🎨 **Clean, Professional UI** (no external CSS frameworks)
- 🔍 **Search & Filter** documents
- 💾 **Auto-save** functionality
- 📋 **Copy to Clipboard** for AI results

---

## 🔌 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Endpoints

#### Documents
```javascript
// Get all documents
GET /documents

// Get single document
GET /documents/:id

// Create document
POST /documents
Body: {
  title: string,
  content: ProseMirror JSON,
  templateId?: string,
  author: string
}

// Update document
PUT /documents/:id
Body: {
  title: string,
  content: ProseMirror JSON,
  status?: 'draft' | 'completed'
}

// Delete document
DELETE /documents/:id

// Get document versions
GET /documents/:id/versions
```

#### Templates
```javascript
// Get all templates
GET /templates?category=government

// Get single template
GET /templates/:id

// Validate against template
POST /templates/validate
Body: {
  templateId: string,
  content: ProseMirror JSON
}
```

#### Voice & AI
```javascript
// Transcribe and format voice input
POST /voice/transcribe
Body: {
  text: string,
  documentId?: string
}

// Enhance text with AI
POST /voice/enhance
Body: {
  content: string,
  type: 'grammar' | 'formal' | 'summary' | 'expand'
}

// Generate document from prompt
POST /voice/generate
Body: {
  prompt: string,
  templateId?: string
}
```

#### Health Check
```javascript
// System health status
GET /health
```

---

## 🎬 Video Demo Script

### **Opening (30 seconds)**
```
"Hi! I'm presenting Smart Office System - an offline-first document management platform built with an OS mindset, not a web app mindset.

Instead of traditional layers, I've designed 4 core engines:
- Document Engine for editing
- Storage Engine for versioning
- Template Engine for standardization
- Voice Engine powered by GROK AI

Let me show you how it works."
```

### **Demo Flow (3-4 minutes)**

**1. Dashboard View (30 sec)**
- "Here's the main dashboard showing all documents"
- Show search and filter features
- Click "New Document"

**2. Template Selection (30 sec)**
- "The Template Engine offers pre-defined structures"
- Show Government, Business, and General templates
- Select "Government Official Letter" template

**3. Document Editor (1 min)**
- "This is the Document Engine using TipTap editor"
- Show formatting toolbar (bold, italic, lists, alignment)
- "Notice the template structure is already loaded"
- Type some content
- Show auto-save feature

**4. Voice Input (45 sec)**
- "Now let's use the Voice Engine with GROK AI"
- Type: "write letter for medical leave for three days"
- Click "Format with AI"
- Show the AI-formatted result
- Copy and paste into document

**5. AI Assistant (45 sec)**
- "The AI Assistant can enhance existing text"
- Select text from document
- Choose "Make Formal"
- Show enhancement result
- Also demonstrate "Generate Document" feature

**6. Save & Version Control (30 sec)**
- Add document title and author
- Click "Save Document"
- Show success message
- Return to dashboard to see the saved document

**7. Architecture Highlight (30 sec)**
- "Let me quickly show the architecture"
- Show the console output with engine status
- Mention SQLite storage, versioning system
- Show the .env file with GROK API configuration

### **Closing (30 seconds)**
```
"Key highlights:
✅ Offline-first with SQLite
✅ Schema-enforced documents using ProseMirror
✅ Template validation engine
✅ AI integration for voice and assistance
✅ Production-ready architecture

The system is designed as a mini operating system for document management, not just another CRUD app. Thank you!"
```

---

## 🚀 Future Enhancements

### Not in V1 (Mentioned in Design Doc)
- ❌ Real-time collaborative editing
- ❌ Advanced version diff UI
- ❌ Offline model training
- ❌ Multi-language STT

### Planned for V2
- 🔄 **CRDT Integration** (Yjs/Automerge) for collaborative editing
- 🔐 **Document Signing** with cryptographic hashes
- 🌐 **Multi-language Support** for voice input
- 📱 **Mobile App** (React Native)
- 🔍 **Advanced Search** with full-text indexing
- 📊 **Analytics Dashboard** for document insights
- 🎨 **Custom Templates** creator UI
- 🔒 **Access Control** and permissions system
- ☁️ **Sync Engine** for cloud backup (optional)
- 🖨️ **Export to PDF** with formatting preservation

### Technical Improvements
- **WASM STT** for browser-side voice processing
- **Service Worker** for offline caching
- **IndexedDB** for browser-side storage
- **Web Workers** for heavy processing
- **Progressive Web App** (PWA) support

---

## 📚 Project Structure

```
smart-office-system/
├── client/                      # Frontend React App
│   ├── src/
│   │   ├── components/
│   │   │   ├── DocumentList.jsx
│   │   │   ├── Editor.jsx
│   │   │   ├── TemplateSelector.jsx
│   │   │   ├── VoiceInput.jsx
│   │   │   └── AIAssistant.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── server/                      # Backend Node.js Server
│   ├── database/
│   │   └── init.js             # Database initialization
│   ├── engines/
│   │   └── storage-engine.js   # Storage logic
│   ├── routes/
│   │   ├── documents.js        # Document CRUD
│   │   ├── templates.js        # Template management
│   │   └── voice.js            # AI integration
│   ├── websocket/
│   │   └── handler.js          # WebSocket setup
│   ├── storage/
│   │   └── smartoffice.db      # SQLite database (auto-created)
│   ├── .env                    # Environment variables
│   ├── index.js                # Server entry point
│   └── package.json
│
├── .env.example                # Example environment file
├── package.json                # Root package.json
└── README.md                   # This file
```

---

## 🎓 Design Decisions & Tradeoffs

### Why SQLite over PostgreSQL/MySQL?
- ✅ Zero configuration
- ✅ Perfect for offline-first
- ✅ Single file database
- ✅ Fast for LAN environments
- ✅ No server setup needed
- ⚠️ Limited concurrent writes (acceptable for office use)

### Why ProseMirror (TipTap) over Quill/Slate?
- ✅ Schema-based (perfect for templates)
- ✅ Better structure enforcement
- ✅ Rich plugin ecosystem
- ✅ Easier custom nodes
- ✅ Better for collaborative editing (future)

### Why Server-side AI Processing?
- ✅ Easier CPU management
- ✅ Centralized API key security
- ✅ Consistent results
- ✅ Can switch AI providers easily
- ⚠️ Requires internet for AI features
- 🔄 Will move to WASM in V2 for offline AI

### Why REST over GraphQL?
- ✅ Simpler for small team
- ✅ Better caching
- ✅ Easier debugging
- ✅ Lower learning curve
- 🔄 Can add GraphQL layer later if needed

---

## 🔐 Security Considerations

### API Key Management
- ✅ GROK API key stored in .env (server-side only)
- ✅ Never exposed to client
- ✅ .env added to .gitignore

### Data Storage
- ✅ Local SQLite database
- ✅ No cloud storage in V1
- ✅ All data stays in LAN

### Input Validation
- ✅ Server-side validation for all inputs
- ✅ Template rule enforcement
- ✅ SQL injection prevention (prepared statements)

### Future Enhancements
- 🔒 Document encryption at rest
- 🔒 User authentication & authorization
- 🔒 Role-based access control
- 🔒 Audit logging

---

## 🧪 Testing

### Manual Testing Checklist
- [ ] Create new document
- [ ] Load template
- [ ] Edit document with formatting
- [ ] Save document
- [ ] Search documents
- [ ] Delete document
- [ ] Voice input with GROK AI
- [ ] AI text enhancement
- [ ] AI document generation
- [ ] Version history view

### API Testing with curl
```bash
# Health check
curl http://localhost:3000/health

# Get all documents
curl http://localhost:3000/api/documents

# Create document
curl -X POST http://localhost:3000/api/documents \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Document",
    "content": {"type":"doc","content":[{"type":"paragraph"}]},
    "author": "Test User"
  }'

# Get templates
curl http://localhost:3000/api/templates
```

---

## 📞 Support & Contact

### Getting Help
- Check the [WSL Commands](#wsl-commands) section
- Review [Troubleshooting Commands](#troubleshooting-commands)
- Verify GROK API key is correct

### Common Issues

**Issue: "Cannot connect to server"**
- Solution: Make sure server is running on port 3000
- Check: `curl http://localhost:3000/health`

**Issue: "AI features not working"**
- Solution: Verify GROK API key in server/.env
- Test API key with curl command above

**Issue: "Port already in use"**
- Solution: Kill the process using the port
- `lsof -ti:3000 | xargs kill -9`

**Issue: "npm install fails"**
- Solution: Clear cache and reinstall
- `npm cache clean --force && npm install`

---

## 📝 License

This project is created for educational/assignment purposes.

---

## 🎯 Key Takeaways for Interviewers

### Product Thinking
> "Instead of building a document editor, I designed a **deterministic document creation platform** where structure is enforced by schema rather than by user behavior."

### Architecture
- **Engine-based design** (not traditional layers)
- **Offline OS mindset** (not web app mindset)
- **Schema-first approach** for consistency

### Technical Depth
- ProseMirror JSON for deterministic storage
- SQLite for offline-first persistence
- GROK AI for intelligent assistance
- Template validation engine

### Production Ready
- Version control system
- Error handling
- Environment configuration
- Clean, maintainable code structure

---

**Built with 💙 for Smart Office Document Management**

*Offline-First • AI-Powered • Production-Ready*
