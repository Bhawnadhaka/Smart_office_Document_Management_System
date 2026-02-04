import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Send } from 'lucide-react';
import { transcribeVoice } from '../services/api';
import './VoiceInput.css';

function VoiceInput() {
  const [isListening, setIsListening] = useState(false);
  const [voiceText, setVoiceText] = useState('');
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Check if browser supports Web Speech API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    // Initialize speech recognition
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        setVoiceText(prev => prev + finalTranscript);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        alert('❌ Microphone access denied. Please allow microphone permissions.');
      } else if (event.error === 'no-speech') {
        alert('⚠️ No speech detected. Please try again.');
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const handleStartListening = () => {
    if (!isSupported) {
      alert('❌ Voice input is not supported in your browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    setIsListening(true);
    setVoiceText('');
    setResult(null);
    
    try {
      recognitionRef.current?.start();
    } catch (error) {
      console.error('Error starting recognition:', error);
    }
  };

  const handleStopListening = () => {
    setIsListening(false);
    recognitionRef.current?.stop();
  };

  const handleProcess = async () => {
    if (!voiceText.trim()) {
      alert('Please enter some text first');
      return;
    }

    setProcessing(true);
    try {
      const response = await transcribeVoice(voiceText);
      setResult(response);
      
      // Copy formatted text to clipboard
      navigator.clipboard.writeText(response.formatted);
      alert('✅ Formatted text copied to clipboard! You can paste it in the editor.');
    } catch (error) {
      console.error('Voice processing error:', error);
      alert('Failed to process voice input. Check your GROK API key.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="voice-input-container">
      <div className="voice-header">
        <h3>🎤 Voice Input Engine</h3>
        <span className="ai-badge">Powered by Groq AI</span>
      </div>

      <div className="voice-content">
        <div className="voice-controls">
          {!isListening ? (
            <button
              onClick={handleStartListening}
              className="btn-voice btn-start"
            >
              <Mic size={20} />
              Start Voice Input
            </button>
          ) : (
            <button
              onClick={handleStopListening}
              className="btn-voice btn-stop"
            >
              <MicOff size={20} />
              Stop Listening
            </button>
          )}
        </div>

        {isListening && (
          <div className="listening-indicator">
            <div className="pulse"></div>
            <span>🎙️ Listening... Speak now!</span>
          </div>
        )}

        {!isSupported && (
          <div className="warning-message">
            ⚠️ Voice input not supported. Please use Chrome, Edge, or Safari browser, or type manually below.
          </div>
        )}

        <textarea
          placeholder="Type or speak your text here. The AI will format it professionally for your document."
          value={voiceText}
          onChange={(e) => setVoiceText(e.target.value)}
          className="voice-textarea"
          rows="6"
        />

        <button
          onClick={handleProcess}
          disabled={processing || !voiceText.trim()}
          className="btn-process"
        >
          <Send size={18} />
          {processing ? 'Processing...' : 'Format with AI'}
        </button>

        {result && (
          <div className="voice-result">
            <div className="result-section">
              <label>📝 Original Text:</label>
              <div className="result-text original">{result.original}</div>
            </div>
            
            <div className="result-section">
              <label>✨ AI Formatted:</label>
              <div className="result-text formatted">{result.formatted}</div>
            </div>
            
            <div className="result-actions">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(result.formatted);
                  alert('Copied to clipboard!');
                }}
                className="btn-copy"
              >
                📋 Copy Formatted Text
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="voice-footer">
        <p className="voice-note">
          💡 Tip: The AI will fix grammar, improve clarity, and format your text for professional documents.
        </p>
      </div>
    </div>
  );
}

export default VoiceInput;
