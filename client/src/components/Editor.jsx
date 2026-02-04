import React, { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import { 
  Bold, Italic, List, ListOrdered, Undo, Redo, 
  AlignLeft, AlignCenter, AlignRight, Save, Type 
} from 'lucide-react';
import { createDocument, updateDocument, getDocument } from '../services/api';
import './Editor.css';

function Editor({ document: initialDocument, template, onSave }) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [status, setStatus] = useState('draft');
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [documentId, setDocumentId] = useState(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Start typing your document here...'
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph']
      }),
      TextStyle,
      Color
    ],
    content: template ? template.structure : { type: 'doc', content: [{ type: 'paragraph' }] },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none'
      }
    }
  });

  useEffect(() => {
    if (initialDocument) {
      loadDocument(initialDocument.id);
    } else if (template) {
      setTitle(`New ${template.name}`);
      editor?.commands.setContent(template.structure);
    }
  }, [initialDocument, template]);

  const loadDocument = async (id) => {
    try {
      const doc = await getDocument(id);
      setDocumentId(doc.id);
      setTitle(doc.title);
      setAuthor(doc.author);
      setStatus(doc.status);
      editor?.commands.setContent(doc.content);
    } catch (error) {
      console.error('Error loading document:', error);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      alert('Please enter a document title');
      return;
    }

    setSaving(true);
    setSaveMessage('');

    try {
      const content = editor.getJSON();
      const data = {
        title,
        content,
        templateId: template?.id || null,
        author: author || 'Unknown',
        status
      };

      if (documentId) {
        await updateDocument(documentId, data);
        setSaveMessage('✅ Document updated successfully!');
      } else {
        const result = await createDocument(data);
        setDocumentId(result.id);
        setSaveMessage('✅ Document created successfully!');
      }

      setTimeout(() => setSaveMessage(''), 3000);
      onSave && onSave();
    } catch (error) {
      console.error('Error saving document:', error);
      setSaveMessage('❌ Failed to save document');
    } finally {
      setSaving(false);
    }
  };

  if (!editor) {
    return <div className="editor-loading">Loading editor...</div>;
  }

  return (
    <div className="editor-container">
      <div className="editor-header">
        <div className="editor-title-section">
          <input
            type="text"
            placeholder="Document Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="title-input"
          />
          <div className="editor-meta-inputs">
            <input
              type="text"
              placeholder="Author Name"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="author-input"
            />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="status-select"
            >
              <option value="draft">Draft</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="btn btn-success"
        >
          <Save size={18} />
          {saving ? 'Saving...' : 'Save Document'}
        </button>
      </div>

      {saveMessage && (
        <div className={`save-message ${saveMessage.includes('✅') ? 'success' : 'error'}`}>
          {saveMessage}
        </div>
      )}

      {template && (
        <div className="template-info">
          📄 Using Template: <strong>{template.name}</strong>
          {template.locked_sections.length > 0 && (
            <span className="locked-info">
              🔒 {template.locked_sections.length} locked sections
            </span>
          )}
        </div>
      )}

      <div className="editor-toolbar">
        <div className="toolbar-group">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={editor.isActive('bold') ? 'is-active' : ''}
            title="Bold"
          >
            <Bold size={18} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={editor.isActive('italic') ? 'is-active' : ''}
            title="Italic"
          >
            <Italic size={18} />
          </button>
        </div>

        <div className="toolbar-group">
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}
            title="Heading 1"
          >
            H1
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}
            title="Heading 2"
          >
            H2
          </button>
          <button
            onClick={() => editor.chain().focus().setParagraph().run()}
            className={editor.isActive('paragraph') ? 'is-active' : ''}
            title="Paragraph"
          >
            <Type size={18} />
          </button>
        </div>

        <div className="toolbar-group">
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={editor.isActive('bulletList') ? 'is-active' : ''}
            title="Bullet List"
          >
            <List size={18} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={editor.isActive('orderedList') ? 'is-active' : ''}
            title="Numbered List"
          >
            <ListOrdered size={18} />
          </button>
        </div>

        <div className="toolbar-group">
          <button
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={editor.isActive({ textAlign: 'left' }) ? 'is-active' : ''}
            title="Align Left"
          >
            <AlignLeft size={18} />
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={editor.isActive({ textAlign: 'center' }) ? 'is-active' : ''}
            title="Align Center"
          >
            <AlignCenter size={18} />
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={editor.isActive({ textAlign: 'right' }) ? 'is-active' : ''}
            title="Align Right"
          >
            <AlignRight size={18} />
          </button>
        </div>

        <div className="toolbar-group">
          <button
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Undo"
          >
            <Undo size={18} />
          </button>
          <button
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Redo"
          >
            <Redo size={18} />
          </button>
        </div>
      </div>

      <div className="editor-content-wrapper">
        <EditorContent editor={editor} />
      </div>

      <div className="editor-footer">
        <span className="word-count">
          {editor.storage.characterCount?.characters() || 0} characters
        </span>
        <span className="version-info">
          {documentId ? `Document ID: ${documentId.slice(0, 8)}...` : 'New Document'}
        </span>
      </div>
    </div>
  );
}

export default Editor;
