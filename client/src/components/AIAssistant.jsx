import React, { useState } from 'react';
import { Sparkles, Wand2, FileText, Zap } from 'lucide-react';
import { enhanceText, generateDocument } from '../services/api';
import './AIAssistant.css';

function AIAssistant() {
  const [mode, setMode] = useState('enhance'); // 'enhance' or 'generate'
  const [inputText, setInputText] = useState('');
  const [enhanceType, setEnhanceType] = useState('grammar');
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);

  const handleEnhance = async () => {
    if (!inputText.trim()) {
      alert('Please enter some text to enhance');
      return;
    }

    setProcessing(true);
    setResult(null);
    
    try {
      const response = await enhanceText(inputText, enhanceType);
      setResult(response);
      
      // Copy to clipboard
      navigator.clipboard.writeText(response.enhanced);
      alert('✅ Enhanced text copied to clipboard!');
    } catch (error) {
      console.error('Enhancement error:', error);
      alert('Failed to enhance text. Check your GROK API key.');
    } finally {
      setProcessing(false);
    }
  };

  const handleGenerate = async () => {
    if (!inputText.trim()) {
      alert('Please enter a prompt');
      return;
    }

    setProcessing(true);
    setResult(null);
    
    try {
      const response = await generateDocument(inputText);
      setResult({ enhanced: response.content });
      
      // Copy to clipboard
      navigator.clipboard.writeText(response.content);
      alert('✅ Generated document copied to clipboard!');
    } catch (error) {
      console.error('Generation error:', error);
      alert('Failed to generate document. Check your GROK API key.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="ai-assistant-container">
      <div className="ai-header">
        <h3>✨ AI Assistant</h3>
        <span className="ai-badge">Groq AI</span>
      </div>

      <div className="ai-content">
        <div className="mode-selector">
          <button
            onClick={() => setMode('enhance')}
            className={`mode-btn ${mode === 'enhance' ? 'active' : ''}`}
          >
            <Wand2 size={16} />
            Enhance Text
          </button>
          <button
            onClick={() => setMode('generate')}
            className={`mode-btn ${mode === 'generate' ? 'active' : ''}`}
          >
            <Sparkles size={16} />
            Generate
          </button>
        </div>

        {mode === 'enhance' ? (
          <div className="enhance-mode">
            <select
              value={enhanceType}
              onChange={(e) => setEnhanceType(e.target.value)}
              className="enhance-type-select"
            >
              <option value="grammar">Fix Grammar</option>
              <option value="formal">Make Formal</option>
              <option value="summary">Summarize</option>
              <option value="expand">Expand Text</option>
            </select>

            <textarea
              placeholder="Paste text here to enhance..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="ai-textarea"
              rows="5"
            />

            <button
              onClick={handleEnhance}
              disabled={processing || !inputText.trim()}
              className="btn-ai-action"
            >
              <Wand2 size={18} />
              {processing ? 'Enhancing...' : 'Enhance Text'}
            </button>
          </div>
        ) : (
          <div className="generate-mode">
            <textarea
              placeholder="Describe what document you want to generate...

Examples:
• Write a letter requesting leave for 3 days
• Create a meeting agenda for quarterly review
• Draft a thank you letter to stakeholders"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="ai-textarea"
              rows="6"
            />

            <button
              onClick={handleGenerate}
              disabled={processing || !inputText.trim()}
              className="btn-ai-action"
            >
              <Sparkles size={18} />
              {processing ? 'Generating...' : 'Generate Document'}
            </button>
          </div>
        )}

        {result && (
          <div className="ai-result">
            <div className="result-header">
              <Zap size={16} />
              <span>AI Result</span>
            </div>
            <div className="result-content">
              {result.enhanced}
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(result.enhanced);
                alert('Copied to clipboard!');
              }}
              className="btn-copy-result"
            >
              📋 Copy to Clipboard
            </button>
          </div>
        )}
      </div>

      <div className="ai-footer">
        <div className="ai-tips">
          <p className="tip-title">💡 AI Features:</p>
          <ul className="tip-list">
            <li>Fix grammar & spelling</li>
            <li>Make text professional</li>
            <li>Generate full documents</li>
            <li>Summarize content</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default AIAssistant;
