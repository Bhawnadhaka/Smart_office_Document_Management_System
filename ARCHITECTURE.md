# 🏗️ System Architecture Document

## 📐 Architecture Overview

Smart Office System follows an **Engine-Based Architecture** inspired by operating systems rather than traditional web application layers.

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER (Browser)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Document    │  │   Template   │  │    Voice     │     │
│  │   Editor     │  │   Selector   │  │    Input     │     │
│  │  (TipTap)    │  │              │  │   (GROK)     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           React State Management                      │  │
│  │           API Service Layer (Axios)                   │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTP/REST
┌─────────────────────────────────────────────────────────────┐
│                    SERVER LAYER (Node.js)                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │               Express.js Router                       │  │
│  └──────────────────────────────────────────────────────┘  │
│                            ↓                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Document    │  │   Storage    │  │   Template   │     │
│  │   Engine     │  │   Engine     │  │   Engine     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                               │
│  ┌──────────────┐  ┌──────────────────────────────────┐    │
│  │    Voice     │  │      WebSocket Handler           │    │
│  │   Engine     │  │    (Future Collaboration)        │    │
│  │  (GROK API)  │  │                                  │    │
│  └──────────────┘  └──────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                   STORAGE LAYER (SQLite)                     │
│  ┌────────────┐  ┌────────────┐  ┌─────────────────────┐  │
│  │ Documents  │  │ Templates  │  │ Document Versions   │  │
│  └────────────┘  └────────────┘  └─────────────────────┘  │
│  ┌────────────┐                                             │
│  │   Voice    │                                             │
│  │  Sessions  │                                             │
│  └────────────┘                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 Engine Details

### 1. Document Engine

**Location:** Client-side + Server-side coordination

**Components:**
- TipTap Editor (ProseMirror)
- Rich text formatting toolbar
- Content state management
- Cursor position tracking

**Data Flow:**
```
User Input → TipTap → ProseMirror JSON → API → Storage Engine
```

**Key Features:**
- Schema-based document structure
- Undo/Redo stack
- Real-time content validation
- Formatting preservation

**Why ProseMirror?**
- Deterministic structure (JSON schema)
- Easy template enforcement
- Better for collaborative editing
- Custom node support

---

### 2. Storage Engine

**Location:** Server-side

**Components:**
- SQLite database manager
- Version control system
- Metadata handler
- File I/O operations

**Data Models:**

#### Document Model
```typescript
interface Document {
  id: string;              // UUID
  title: string;
  content: object;         // ProseMirror JSON
  template_id?: string;
  metadata: {
    author: string;
    wordCount: number;
    createdVia: string;
  };
  version: number;
  status: 'draft' | 'completed';
  created_at: DateTime;
  updated_at: DateTime;
}
```

#### Version Model
```typescript
interface DocumentVersion {
  id: number;
  document_id: string;
  version: number;
  content: object;
  changed_by: string;
  changed_at: DateTime;
}
```

**Versioning Strategy:**
- Automatic version creation on save
- Full content snapshot (no diffs in V1)
- Version history accessible
- Future: Implement diff-based versioning

---

### 3. Template Engine

**Location:** Server-side with client validation

**Components:**
- Template repository
- Validation rules processor
- Structure enforcer
- Placeholder manager

**Template Structure:**
```typescript
interface Template {
  id: string;
  name: string;
  description: string;
  structure: object;           // ProseMirror JSON
  rules: {
    required_sections: string[];
    max_length?: number;
    formatting_rules: string[];
  };
  locked_sections: string[];
  placeholders: string[];
  category: 'government' | 'business' | 'general';
}
```

**Validation Flow:**
```
Document Content → Template Rules → Validator → Pass/Fail + Errors/Warnings
```

**Built-in Templates:**
1. **Government Official Letter**
   - Strict format enforcement
   - Required sections: header, date, subject, signature
   - Formal language rules

2. **Business Memorandum**
   - TO/FROM/DATE/SUBJECT structure
   - Professional tone requirements

3. **Blank Document**
   - No restrictions
   - Free-form editing

---

### 4. Voice Engine (AI Powered)

**Location:** Server-side (GROK API integration)

**Components:**
- GROK API client
- Text processing pipeline
- Enhancement algorithms
- Session management

**Features:**

#### Voice Transcription
```
Audio/Text Input → GROK API → Enhanced Text → Format → Output
```

#### Text Enhancement Types:
1. **Grammar Correction**
   - Fix spelling errors
   - Correct punctuation
   - Improve sentence structure

2. **Formalization**
   - Convert casual to formal tone
   - Professional language
   - Business-appropriate vocabulary

3. **Summarization**
   - Extract key points
   - Condensed version
   - Maintain core meaning

4. **Expansion**
   - Add details and context
   - Elaborate on points
   - Increase depth

#### Document Generation
```
User Prompt → GROK API → Generated Content → Template Application → Document
```

**API Integration:**
```javascript
POST https://api.x.ai/v1/chat/completions
Headers: {
  Authorization: Bearer GROK_API_KEY
}
Body: {
  model: "grok-beta",
  messages: [{role: "system", content: "..."}, {role: "user", content: "..."}],
  temperature: 0.3
}
```

---

## 🌐 Communication Strategy

### Hybrid Communication Model

| Use Case | Method | Why |
|----------|--------|-----|
| Save document | REST POST/PUT | Stateless, reliable |
| Load documents | REST GET | Cacheable |
| Search/Filter | REST GET | Query parameters |
| Live editing (future) | WebSocket | Real-time updates |
| Voice stream (future) | WebSocket | Continuous data |

### REST API Endpoints

**Documents:**
- `GET /api/documents` - List all
- `GET /api/documents/:id` - Get single
- `POST /api/documents` - Create
- `PUT /api/documents/:id` - Update
- `DELETE /api/documents/:id` - Delete
- `GET /api/documents/:id/versions` - Version history

**Templates:**
- `GET /api/templates` - List all
- `GET /api/templates/:id` - Get single
- `POST /api/templates/validate` - Validate content

**Voice/AI:**
- `POST /api/voice/transcribe` - Process voice input
- `POST /api/voice/enhance` - Enhance text
- `POST /api/voice/generate` - Generate document

**System:**
- `GET /health` - System status

### WebSocket (Future)
```javascript
ws://localhost:3000/ws

Message Types:
- ping/pong (keep-alive)
- document_update (collaborative editing)
- cursor_position (show other users)
```

---

## 💾 Data Storage Strategy

### Why SQLite?

**Advantages:**
- ✅ Zero configuration
- ✅ Single file database
- ✅ ACID compliant
- ✅ Fast for LAN use
- ✅ No network overhead
- ✅ Perfect for offline-first

**Limitations:**
- ⚠️ Limited concurrent writes
- ⚠️ Not ideal for web-scale
- ⚠️ Single file backup needed

**Suitable For:**
- Office environments (10-100 users)
- LAN-based systems
- Offline-first applications
- Prototype/MVP development

**Migration Path:**
- Start: SQLite
- Scale: PostgreSQL (if needed)
- Enterprise: Distributed DB (if needed)

### Document Storage Format

**Why ProseMirror JSON instead of HTML?**

❌ **HTML Approach:**
```html
<h1>Government of India</h1>
<p>Ministry of Finance</p>
<!-- Hard to validate structure -->
<!-- Security risks (XSS) -->
<!-- Difficult to enforce templates -->
```

✅ **ProseMirror JSON Approach:**
```json
{
  "type": "doc",
  "content": [
    {
      "type": "heading",
      "attrs": {"level": 1},
      "content": [{"type": "text", "text": "Government of India"}]
    },
    {
      "type": "paragraph",
      "content": [{"type": "text", "text": "Ministry of Finance"}]
    }
  ]
}
```

**Benefits:**
- ✅ Deterministic structure
- ✅ Easy validation
- ✅ Type-safe
- ✅ Version control friendly
- ✅ Template enforcement
- ✅ Safe from injection

---

## 🔄 Version Control System

### Versioning Strategy

**When Versions Are Created:**
1. Initial document creation (v1)
2. Every save operation (v2, v3, ...)
3. Manual version creation (future)

**What's Stored:**
- Full content snapshot
- Version number
- Changed by (author)
- Timestamp

**Version Table Schema:**
```sql
CREATE TABLE document_versions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  document_id TEXT NOT NULL,
  version INTEGER NOT NULL,
  content TEXT NOT NULL,
  changed_by TEXT,
  changed_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Future Enhancements:**
- Diff-based versioning (save space)
- Version comparison UI
- Restore previous version
- Branch versions (like Git)

---

## 🚀 Deployment Architecture

### Development Environment
```
Laptop/Desktop
  ├── WSL2 (Ubuntu)
  │   ├── Node.js Server (Port 3000)
  │   └── SQLite Database
  └── Browser
      └── React Client (Port 5173)
```

### Production LAN Environment (Future)
```
LAN Server
  ├── Node.js Server (Production Mode)
  ├── SQLite Database (with backups)
  └── Nginx (Reverse Proxy)
      ├── Static Files (React Build)
      └── API Proxy (→ Node.js)

Client Machines
  └── Browsers (Connected via LAN)
```

### Scaling Strategy

**Phase 1 (Current):**
- Single server
- SQLite database
- 10-50 concurrent users

**Phase 2 (Growth):**
- Load balancer
- Multiple server instances
- PostgreSQL migration
- Redis caching

**Phase 3 (Enterprise):**
- Microservices architecture
- Distributed database
- CDN for static files
- Kubernetes orchestration

---

## 🔐 Security Architecture

### Current Implementation (V1)

**API Key Security:**
- GROK API key in `.env` file (server-side only)
- Never exposed to client
- `.env` in `.gitignore`

**Input Validation:**
- Server-side validation for all inputs
- Template rule enforcement
- SQL injection prevention (prepared statements)

**Data Security:**
- Local storage only (no cloud)
- All data stays within LAN
- File system permissions

### Future Enhancements (V2)

**Authentication:**
- JWT-based auth
- User roles (admin, editor, viewer)
- Session management

**Authorization:**
- Role-based access control (RBAC)
- Document-level permissions
- Template access control

**Encryption:**
- Documents encrypted at rest
- TLS for API communication
- Encrypted database backups

**Audit Logging:**
- User action tracking
- Access logs
- Change history

---

## 🧪 Testing Strategy

### Manual Testing (Current)
- Feature testing checklist
- User flow validation
- API endpoint testing with curl

### Automated Testing (Future)

**Unit Tests:**
- Storage engine functions
- Template validation logic
- API route handlers

**Integration Tests:**
- Document CRUD operations
- Template application
- AI API integration

**E2E Tests:**
- User workflows
- Document creation flow
- Template selection flow

**Tools:**
- Jest (unit tests)
- Supertest (API tests)
- Playwright (E2E tests)

---

## 📊 Performance Considerations

### Current Optimizations

**Frontend:**
- Component lazy loading
- Debounced search
- Memoized renders

**Backend:**
- SQLite WAL mode (concurrent reads)
- Prepared statements
- Efficient queries

**Database:**
- Indexed columns (id, created_at, updated_at)
- Query optimization
- Connection pooling

### Future Optimizations

**Caching:**
- Redis for frequently accessed docs
- Browser caching for templates
- CDN for static assets

**Database:**
- Read replicas
- Query caching
- Partitioning

**CDN:**
- Static file delivery
- Image optimization
- Edge caching

---

## 🔮 Future Complexity Areas

### 1. Collaborative Editing
**Challenge:** Multiple users editing same document

**Solution (Future):**
- Implement CRDT (Conflict-free Replicated Data Types)
- Use Yjs or Automerge library
- Operational Transformation (OT) as alternative

### 2. AI Model Management
**Challenge:** Model size, CPU usage, offline support

**Solution (Future):**
- WASM-based STT for browser
- Model compression
- Distributed inference
- On-device AI (future)

### 3. Template Evolution
**Challenge:** Updating templates without breaking old documents

**Solution (Future):**
- Template version system
- Migration scripts
- Backward compatibility layer
- Schema validation versioning

### 4. Scalability
**Challenge:** Growing number of users and documents

**Solution (Future):**
- PostgreSQL migration
- Horizontal scaling
- Microservices architecture
- Caching layers

---

## 📈 Monitoring & Observability (Future)

### Metrics to Track
- Document creation rate
- AI API latency
- Database query performance
- User active sessions
- Error rates

### Logging
- Structured logging (JSON)
- Log aggregation (ELK stack)
- Error tracking (Sentry)

### Alerting
- System health checks
- Database backup status
- API rate limits
- Disk space monitoring

---

## 🎯 Architecture Principles

### 1. Offline-First
All core features work without internet, except AI features.

### 2. Schema-Driven
Documents follow strict schemas for consistency.

### 3. Engine-Based
Clear separation of concerns through engines.

### 4. Deterministic
Same input always produces same output.

### 5. Extensible
Easy to add new features without breaking existing ones.

### 6. Production-Ready
Built with scalability and maintainability in mind.

---

**This architecture is designed to be understandable, maintainable, and scalable.**
