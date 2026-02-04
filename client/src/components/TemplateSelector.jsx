import React from 'react';
import { FileText, Building, File } from 'lucide-react';
import './TemplateSelector.css';

function TemplateSelector({ templates, onSelectTemplate, onSkip }) {
  const groupedTemplates = templates.reduce((acc, template) => {
    const category = template.category || 'general';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(template);
    return acc;
  }, {});

  const categoryIcons = {
    government: '🏛️',
    business: '💼',
    general: '📄'
  };

  const categoryNames = {
    government: 'Government',
    business: 'Business',
    general: 'General'
  };

  return (
    <div className="template-selector">
      <div className="selector-header">
        <h2>📋 Choose a Template</h2>
        <p>Select a template to start with a structured document</p>
        <button onClick={onSkip} className="btn-skip">
          Skip & Start Blank →
        </button>
      </div>

      <div className="templates-container">
        {Object.entries(groupedTemplates).map(([category, categoryTemplates]) => (
          <div key={category} className="template-category">
            <h3 className="category-title">
              {categoryIcons[category]} {categoryNames[category]}
            </h3>
            
            <div className="templates-grid">
              {categoryTemplates.map(template => (
                <div
                  key={template.id}
                  className="template-card"
                  onClick={() => onSelectTemplate(template)}
                >
                  <div className="template-icon">
                    {category === 'government' && <Building size={32} />}
                    {category === 'business' && <FileText size={32} />}
                    {category === 'general' && <File size={32} />}
                  </div>
                  
                  <h4 className="template-name">{template.name}</h4>
                  <p className="template-description">{template.description}</p>
                  
                  {template.placeholders && template.placeholders.length > 0 && (
                    <div className="template-placeholders">
                      <span className="placeholder-label">Fields:</span>
                      <span className="placeholder-count">
                        {template.placeholders.length} placeholders
                      </span>
                    </div>
                  )}
                  
                  <button className="btn-select-template">
                    Use This Template
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TemplateSelector;
