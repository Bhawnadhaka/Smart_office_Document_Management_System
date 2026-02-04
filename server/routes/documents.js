import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../database/init.js';
import { validateDocument, createVersion } from '../engines/storage-engine.js';

const router = express.Router();

// Get all documents
router.get('/', (req, res) => {
  try {
    const documents = db.prepare(`
      SELECT id, title, template_id, author, status, created_at, updated_at, version
      FROM documents
      ORDER BY updated_at DESC
    `).all();
    
    res.json({ success: true, data: documents });
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get single document
router.get('/:id', (req, res) => {
  try {
    const document = db.prepare(`
      SELECT * FROM documents WHERE id = ?
    `).get(req.params.id);
    
    if (!document) {
      return res.status(404).json({ success: false, error: 'Document not found' });
    }
    
    // Parse JSON fields
    document.content = JSON.parse(document.content);
    document.metadata = document.metadata ? JSON.parse(document.metadata) : {};
    
    res.json({ success: true, data: document });
  } catch (error) {
    console.error('Error fetching document:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create new document
router.post('/', (req, res) => {
  try {
    const { title, content, templateId, author } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ success: false, error: 'Title and content are required' });
    }
    
    // Validate document structure if template is used
    if (templateId) {
      const template = db.prepare('SELECT * FROM templates WHERE id = ?').get(templateId);
      if (template) {
        const validation = validateDocument(content, JSON.parse(template.rules));
        if (!validation.valid) {
          return res.status(400).json({ success: false, error: 'Document validation failed', details: validation.errors });
        }
      }
    }
    
    const id = uuidv4();
    const metadata = {
      templateUsed: templateId || null,
      createdVia: 'editor',
      wordCount: JSON.stringify(content).length
    };
    
    db.prepare(`
      INSERT INTO documents (id, title, content, template_id, metadata, author, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      title,
      JSON.stringify(content),
      templateId || null,
      JSON.stringify(metadata),
      author || 'Unknown',
      'draft'
    );
    
    // Create initial version
    createVersion(id, 1, content, author || 'Unknown');
    
    res.status(201).json({ 
      success: true, 
      data: { 
        id, 
        title, 
        message: 'Document created successfully' 
      } 
    });
  } catch (error) {
    console.error('Error creating document:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update document
router.put('/:id', (req, res) => {
  try {
    const { title, content, status } = req.body;
    const { id } = req.params;
    
    // Get current document
    const currentDoc = db.prepare('SELECT * FROM documents WHERE id = ?').get(id);
    if (!currentDoc) {
      return res.status(404).json({ success: false, error: 'Document not found' });
    }
    
    // Validate if template is used
    if (currentDoc.template_id) {
      const template = db.prepare('SELECT * FROM templates WHERE id = ?').get(currentDoc.template_id);
      if (template) {
        const validation = validateDocument(content, JSON.parse(template.rules));
        if (!validation.valid) {
          return res.status(400).json({ success: false, error: 'Document validation failed', details: validation.errors });
        }
      }
    }
    
    const newVersion = currentDoc.version + 1;
    const metadata = JSON.parse(currentDoc.metadata || '{}');
    metadata.wordCount = JSON.stringify(content).length;
    metadata.lastModified = new Date().toISOString();
    
    db.prepare(`
      UPDATE documents 
      SET title = ?, content = ?, metadata = ?, version = ?, status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      title || currentDoc.title,
      JSON.stringify(content),
      JSON.stringify(metadata),
      newVersion,
      status || currentDoc.status,
      id
    );
    
    // Create version snapshot
    createVersion(id, newVersion, content, req.body.author || 'Unknown');
    
    res.json({ 
      success: true, 
      data: { 
        id, 
        version: newVersion,
        message: 'Document updated successfully' 
      } 
    });
  } catch (error) {
    console.error('Error updating document:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete document
router.delete('/:id', (req, res) => {
  try {
    const result = db.prepare('DELETE FROM documents WHERE id = ?').run(req.params.id);
    
    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: 'Document not found' });
    }
    
    // Also delete versions
    db.prepare('DELETE FROM document_versions WHERE document_id = ?').run(req.params.id);
    
    res.json({ success: true, message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get document versions
router.get('/:id/versions', (req, res) => {
  try {
    const versions = db.prepare(`
      SELECT id, version, changed_by, changed_at
      FROM document_versions
      WHERE document_id = ?
      ORDER BY version DESC
    `).all(req.params.id);
    
    res.json({ success: true, data: versions });
  } catch (error) {
    console.error('Error fetching versions:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
