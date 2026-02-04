import React, { useState } from 'react';
import { FileText, Calendar, User, Trash2 } from 'lucide-react';
import { deleteDocument } from '../services/api';
import './DocumentList.css';

function DocumentList({ documents, onOpenDocument, onRefresh }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || doc.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        await deleteDocument(id);
        onRefresh();
      } catch (error) {
        alert('Failed to delete document');
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="document-list">
      <div className="list-header">
        <h2>📚 My Documents</h2>
        <div className="list-filters">
          <input
            type="text"
            placeholder="🔍 Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {filteredDocuments.length === 0 ? (
        <div className="empty-state">
          <FileText size={64} />
          <h3>No documents found</h3>
          <p>Create your first document to get started</p>
        </div>
      ) : (
        <div className="documents-grid">
          {filteredDocuments.map(doc => (
            <div key={doc.id} className="document-card">
              <div className="card-header">
                <FileText size={24} />
                <span className={`status-badge status-${doc.status}`}>
                  {doc.status}
                </span>
              </div>
              
              <h3 className="card-title" onClick={() => onOpenDocument(doc)}>
                {doc.title}
              </h3>
              
              <div className="card-meta">
                <div className="meta-item">
                  <User size={14} />
                  <span>{doc.author}</span>
                </div>
                <div className="meta-item">
                  <Calendar size={14} />
                  <span>{formatDate(doc.updated_at)}</span>
                </div>
              </div>
              
              {doc.template_id && (
                <div className="card-template">
                  📄 Template: {doc.template_id}
                </div>
              )}
              
              <div className="card-version">
                Version {doc.version}
              </div>
              
              <div className="card-actions">
                <button
                  onClick={() => onOpenDocument(doc)}
                  className="btn-open"
                >
                  Open
                </button>
                <button
                  onClick={() => handleDelete(doc.id, doc.title)}
                  className="btn-delete"
                  title="Delete document"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default DocumentList;
