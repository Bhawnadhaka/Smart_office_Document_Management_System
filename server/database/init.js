import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create storage directory
const storageDir = path.join(__dirname, '../storage');
if (!fs.existsSync(storageDir)) {
  fs.mkdirSync(storageDir, { recursive: true });
}

const dbPath = path.join(storageDir, 'smartoffice.db');
const db = new Database(dbPath);

export function initDatabase() {
  console.log('📦 Initializing Storage Engine...');
  
  // Enable WAL mode for better concurrency
  db.pragma('journal_mode = WAL');
  
  // Documents Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      template_id TEXT,
      metadata TEXT,
      version INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      author TEXT,
      status TEXT DEFAULT 'draft'
    )
  `);
  
  // Templates Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS templates (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      structure TEXT NOT NULL,
      rules TEXT,
      locked_sections TEXT,
      placeholders TEXT,
      category TEXT DEFAULT 'general',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      is_active INTEGER DEFAULT 1
    )
  `);
  
  // Document Versions Table (for future use)
  db.exec(`
    CREATE TABLE IF NOT EXISTS document_versions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      document_id TEXT NOT NULL,
      version INTEGER NOT NULL,
      content TEXT NOT NULL,
      changed_by TEXT,
      changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (document_id) REFERENCES documents(id)
    )
  `);
  
  // Voice Sessions Table (for tracking voice inputs)
  db.exec(`
    CREATE TABLE IF NOT EXISTS voice_sessions (
      id TEXT PRIMARY KEY,
      document_id TEXT,
      audio_duration INTEGER,
      transcription TEXT,
      language TEXT DEFAULT 'en',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (document_id) REFERENCES documents(id)
    )
  `);
  
  // Insert default templates
  insertDefaultTemplates();
  
  console.log('✅ Storage Engine initialized successfully');
  console.log(`📂 Database location: ${dbPath}`);
}

function insertDefaultTemplates() {
  const templates = [
    {
      id: 'gov_letter_v1',
      name: 'Government Official Letter',
      description: 'Standard government correspondence format',
      structure: JSON.stringify({
        type: 'doc',
        content: [
          { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Government of India' }] },
          { type: 'paragraph', attrs: { textAlign: 'center' }, content: [{ type: 'text', text: 'Ministry of [Department Name]' }] },
          { type: 'paragraph' },
          { type: 'paragraph', content: [{ type: 'text', text: 'Date: [DATE]' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'To,' }] },
          { type: 'paragraph', content: [{ type: 'text', text: '[Receiver Name]' }] },
          { type: 'paragraph', content: [{ type: 'text', text: '[Designation]' }] },
          { type: 'paragraph', content: [{ type: 'text', text: '[Address]' }] },
          { type: 'paragraph' },
          { type: 'paragraph', content: [{ type: 'text', text: 'Subject: [SUBJECT]' }] },
          { type: 'paragraph' },
          { type: 'paragraph', content: [{ type: 'text', text: 'Sir/Madam,' }] },
          { type: 'paragraph', content: [{ type: 'text', text: '[Your message content here]' }] },
          { type: 'paragraph' },
          { type: 'paragraph', content: [{ type: 'text', text: 'Yours sincerely,' }] },
          { type: 'paragraph', content: [{ type: 'text', text: '[Your Name]' }] },
          { type: 'paragraph', content: [{ type: 'text', text: '[Your Designation]' }] }
        ]
      }),
      rules: JSON.stringify({
        required_sections: ['heading', 'date', 'receiver', 'subject', 'content', 'signature'],
        max_length: 5000,
        formatting_rules: ['formal_language', 'proper_salutation']
      }),
      locked_sections: JSON.stringify(['header']),
      placeholders: JSON.stringify(['DATE', 'SUBJECT', 'Receiver Name', 'Designation', 'Address', 'Your Name', 'Your Designation']),
      category: 'government'
    },
    {
      id: 'business_memo_v1',
      name: 'Business Memorandum',
      description: 'Internal business communication',
      structure: JSON.stringify({
        type: 'doc',
        content: [
          { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'MEMORANDUM' }] },
          { type: 'paragraph' },
          { type: 'paragraph', content: [{ type: 'text', marks: [{ type: 'bold' }], text: 'TO: ' }, { type: 'text', text: '[Recipients]' }] },
          { type: 'paragraph', content: [{ type: 'text', marks: [{ type: 'bold' }], text: 'FROM: ' }, { type: 'text', text: '[Your Name]' }] },
          { type: 'paragraph', content: [{ type: 'text', marks: [{ type: 'bold' }], text: 'DATE: ' }, { type: 'text', text: '[DATE]' }] },
          { type: 'paragraph', content: [{ type: 'text', marks: [{ type: 'bold' }], text: 'SUBJECT: ' }, { type: 'text', text: '[SUBJECT]' }] },
          { type: 'paragraph' },
          { type: 'paragraph', content: [{ type: 'text', text: '[Memo content here]' }] }
        ]
      }),
      rules: JSON.stringify({
        required_sections: ['to', 'from', 'date', 'subject', 'content'],
        max_length: 3000
      }),
      locked_sections: JSON.stringify(['header']),
      placeholders: JSON.stringify(['Recipients', 'Your Name', 'DATE', 'SUBJECT']),
      category: 'business'
    },
    {
      id: 'blank_document_v1',
      name: 'Blank Document',
      description: 'Start with a clean slate',
      structure: JSON.stringify({
        type: 'doc',
        content: [
          { type: 'paragraph' }
        ]
      }),
      rules: JSON.stringify({}),
      locked_sections: JSON.stringify([]),
      placeholders: JSON.stringify([]),
      category: 'general'
    }
  ];
  
  const stmt = db.prepare(`
    INSERT OR IGNORE INTO templates (id, name, description, structure, rules, locked_sections, placeholders, category)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  templates.forEach(template => {
    stmt.run(
      template.id,
      template.name,
      template.description,
      template.structure,
      template.rules,
      template.locked_sections,
      template.placeholders,
      template.category
    );
  });
  
  console.log('📄 Default templates loaded');
}

export default db;
