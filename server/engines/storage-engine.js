import db from '../database/init.js';

// Storage Engine - Document Validation
export function validateDocument(content, rules) {
  const errors = [];
  const warnings = [];
  
  try {
    // Check if content is valid
    if (!content || typeof content !== 'object') {
      errors.push('Invalid document structure');
      return { valid: false, errors, warnings };
    }
    
    // Check max length if specified
    if (rules.max_length) {
      const contentLength = JSON.stringify(content).length;
      if (contentLength > rules.max_length) {
        errors.push(`Content exceeds maximum length of ${rules.max_length} characters`);
      }
    }
    
    // Check required sections
    if (rules.required_sections && Array.isArray(rules.required_sections)) {
      const contentStr = JSON.stringify(content).toLowerCase();
      rules.required_sections.forEach(section => {
        if (!contentStr.includes(section.toLowerCase())) {
          warnings.push(`Required section "${section}" may be missing`);
        }
      });
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  } catch (error) {
    errors.push('Validation error: ' + error.message);
    return { valid: false, errors, warnings };
  }
}

// Storage Engine - Create Version Snapshot
export function createVersion(documentId, version, content, changedBy) {
  try {
    db.prepare(`
      INSERT INTO document_versions (document_id, version, content, changed_by)
      VALUES (?, ?, ?, ?)
    `).run(
      documentId,
      version,
      JSON.stringify(content),
      changedBy
    );
    
    return { success: true };
  } catch (error) {
    console.error('Error creating version:', error);
    return { success: false, error: error.message };
  }
}

// Storage Engine - Get Document Metadata
export function getDocumentMetadata(documentId) {
  try {
    const doc = db.prepare(`
      SELECT id, title, template_id, author, status, version, created_at, updated_at, metadata
      FROM documents
      WHERE id = ?
    `).get(documentId);
    
    if (doc) {
      doc.metadata = JSON.parse(doc.metadata || '{}');
    }
    
    return doc;
  } catch (error) {
    console.error('Error fetching metadata:', error);
    return null;
  }
}

// Storage Engine - Search Documents
export function searchDocuments(query, filters = {}) {
  try {
    let sql = 'SELECT * FROM documents WHERE 1=1';
    const params = [];
    
    if (query) {
      sql += ' AND (title LIKE ? OR content LIKE ?)';
      params.push(`%${query}%`, `%${query}%`);
    }
    
    if (filters.author) {
      sql += ' AND author = ?';
      params.push(filters.author);
    }
    
    if (filters.status) {
      sql += ' AND status = ?';
      params.push(filters.status);
    }
    
    if (filters.templateId) {
      sql += ' AND template_id = ?';
      params.push(filters.templateId);
    }
    
    sql += ' ORDER BY updated_at DESC';
    
    if (filters.limit) {
      sql += ` LIMIT ${parseInt(filters.limit)}`;
    }
    
    const results = db.prepare(sql).all(...params);
    return results;
  } catch (error) {
    console.error('Error searching documents:', error);
    return [];
  }
}

export default {
  validateDocument,
  createVersion,
  getDocumentMetadata,
  searchDocuments
};
