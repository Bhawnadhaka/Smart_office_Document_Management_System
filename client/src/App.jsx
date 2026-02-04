import React, { useState, useEffect } from 'react';
import DocumentList from './components/DocumentList';
import Editor from './components/Editor';
import TemplateSelector from './components/TemplateSelector';
import VoiceInput from './components/VoiceInput';
import AIAssistant from './components/AIAssistant';
import { getDocuments, getTemplates } from './services/api';
import './App.css';

function App() {
  const [documents, setDocuments] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [currentDocument, setCurrentDocument] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list'); // 'list' or 'editor'

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [docsData, templatesData] = await Promise.all([
        getDocuments(),
        getTemplates()
      ]);
      setDocuments(docsData);
      setTemplates(templatesData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewDocument = () => {
    setCurrentDocument(null);
    setSelectedTemplate(null);
    setShowTemplates(true);
    setView('editor');
  };

  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template);
    setShowTemplates(false);
  };

  const handleOpenDocument = (doc) => {
    setCurrentDocument(doc);
    setView('editor');
  };

  const handleBackToList = () => {
    setView('list');
    setCurrentDocument(null);
    setSelectedTemplate(null);
    loadInitialData(); // Refresh document list
  };

  const handleDocumentSaved = () => {
    loadInitialData();
  };

  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner"></div>
        <p>Loading Smart Office System...</p>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>🏢 Smart Office System</h1>
          <p className="header-subtitle">Offline Document Management Platform</p>
        </div>
        <div className="header-actions">
          {view === 'editor' && (
            <button onClick={handleBackToList} className="btn btn-secondary">
              ← Back to Documents
            </button>
          )}
          {view === 'list' && (
            <button onClick={handleNewDocument} className="btn btn-primary">
              + New Document
            </button>
          )}
        </div>
      </header>

      <main className="app-main">
        {view === 'list' ? (
          <div className="list-view">
            <DocumentList 
              documents={documents}
              onOpenDocument={handleOpenDocument}
              onRefresh={loadInitialData}
            />
          </div>
        ) : (
          <div className="editor-view">
            {showTemplates ? (
              <TemplateSelector
                templates={templates}
                onSelectTemplate={handleSelectTemplate}
                onSkip={() => setShowTemplates(false)}
              />
            ) : (
              <>
                <Editor
                  document={currentDocument}
                  template={selectedTemplate}
                  onSave={handleDocumentSaved}
                />
                <div className="editor-sidebar">
                  <VoiceInput />
                  <AIAssistant />
                </div>
              </>
            )}
          </div>
        )}
      </main>

      <footer className="app-footer">
        <div className="footer-engines">
          <span className="engine-status">📝 Document Engine: Active</span>
          <span className="engine-status">💾 Storage Engine: Active</span>
          <span className="engine-status">📄 Template Engine: Active</span>
          <span className="engine-status">🎤 Voice Engine: Active</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
