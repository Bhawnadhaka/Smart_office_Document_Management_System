import express from 'express';
import db from '../database/init.js';

const router = express.Router();

// Get all templates
router.get('/', (req, res) => {
  try {
    const { category } = req.query;
    
    let query = 'SELECT * FROM templates WHERE is_active = 1';
    const params = [];
    
    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }
    
    query += ' ORDER BY name';
    
    const templates = db.prepare(query).all(...params);
    
    // Parse JSON fields
    const parsedTemplates = templates.map(t => ({
      ...t,
      structure: JSON.parse(t.structure),
      rules: JSON.parse(t.rules),
      locked_sections: JSON.parse(t.locked_sections),
      placeholders: JSON.parse(t.placeholders)
    }));
    
    res.json({ success: true, data: parsedTemplates });
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get single template
router.get('/:id', (req, res) => {
  try {
    const template = db.prepare('SELECT * FROM templates WHERE id = ?').get(req.params.id);
    
    if (!template) {
      return res.status(404).json({ success: false, error: 'Template not found' });
    }
    
    // Parse JSON fields
    template.structure = JSON.parse(template.structure);
    template.rules = JSON.parse(template.rules);
    template.locked_sections = JSON.parse(template.locked_sections);
    template.placeholders = JSON.parse(template.placeholders);
    
    res.json({ success: true, data: template });
  } catch (error) {
    console.error('Error fetching template:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Validate document against template
router.post('/validate', (req, res) => {
  try {
    const { templateId, content } = req.body;
    
    if (!templateId || !content) {
      return res.status(400).json({ success: false, error: 'Template ID and content are required' });
    }
    
    const template = db.prepare('SELECT * FROM templates WHERE id = ?').get(templateId);
    
    if (!template) {
      return res.status(404).json({ success: false, error: 'Template not found' });
    }
    
    const rules = JSON.parse(template.rules);
    const validation = validateTemplateCompliance(content, rules);
    
    res.json({ success: true, data: validation });
  } catch (error) {
    console.error('Error validating template:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Template validation logic
function validateTemplateCompliance(content, rules) {
  const errors = [];
  const warnings = [];
  
  // Check max length
  if (rules.max_length) {
    const contentLength = JSON.stringify(content).length;
    if (contentLength > rules.max_length) {
      errors.push(`Content exceeds maximum length of ${rules.max_length} characters`);
    }
  }
  
  // Check required sections
  if (rules.required_sections && Array.isArray(rules.required_sections)) {
    // This is a simplified check - in production, you'd do deeper ProseMirror structure validation
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
}

export default router;
