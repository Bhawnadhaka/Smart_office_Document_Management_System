import express from 'express';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import db from '../database/init.js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

const GROK_API_KEY = process.env.GROK_API_KEY;
const GROK_API_URL = process.env.GROK_API_URL || 'https://api.x.ai/v1';

// Voice to Text using GROK API
router.post('/transcribe', async (req, res) => {
  try {
    const { text, documentId } = req.body;
    
    if (!text) {
      return res.status(400).json({ success: false, error: 'Text input is required' });
    }
    
    // Use Groq API for enhancement and formatting
    const response = await axios.post(
      `${GROK_API_URL}/chat/completions`,
      {
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: 'You are a professional document assistant. Format the given text properly for a formal document. Fix grammar, punctuation, and improve clarity while maintaining the original meaning. Return only the formatted text without any explanations.'
          },
          {
            role: 'user',
            content: text
          }
        ],
        temperature: 0.3
      },
      {
        headers: {
          'Authorization': `Bearer ${GROK_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    const formattedText = response.data.choices[0].message.content;
    
    // Save voice session
    const sessionId = uuidv4();
    db.prepare(`
      INSERT INTO voice_sessions (id, document_id, transcription, language)
      VALUES (?, ?, ?, ?)
    `).run(sessionId, documentId || null, text, 'en');
    
    res.json({ 
      success: true, 
      data: { 
        original: text,
        formatted: formattedText,
        sessionId 
      } 
    });
  } catch (error) {
    console.error('Error in voice transcription:', error.response?.data || error.message);
    res.status(500).json({ 
      success: false, 
      error: 'Voice processing failed',
      details: error.response?.data?.error?.message || error.message
    });
  }
});

// AI Document Enhancement
router.post('/enhance', async (req, res) => {
  try {
    const { content, type } = req.body;
    
    if (!content) {
      return res.status(400).json({ success: false, error: 'Content is required' });
    }
    
    const prompts = {
      'grammar': 'Fix grammar and spelling errors in the following text. Return only the corrected text:',
      'formal': 'Make the following text more formal and professional. Return only the enhanced text:',
      'summary': 'Create a brief summary of the following text. Return only the summary:',
      'expand': 'Expand and elaborate on the following text with more details. Return only the expanded text:'
    };
    
    const prompt = prompts[type] || prompts['grammar'];
    
    const response = await axios.post(
      `${GROK_API_URL}/chat/completions`,
      {
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: 'You are a professional document editor. Provide concise, accurate responses.'
          },
          {
            role: 'user',
            content: `${prompt}\n\n${content}`
          }
        ],
        temperature: 0.3
      },
      {
        headers: {
          'Authorization': `Bearer ${GROK_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    const enhancedText = response.data.choices[0].message.content;
    
    res.json({ 
      success: true, 
      data: { 
        original: content,
        enhanced: enhancedText 
      } 
    });
  } catch (error) {
    console.error('Error enhancing document:', error.response?.data || error.message);
    res.status(500).json({ 
      success: false, 
      error: 'Enhancement failed',
      details: error.response?.data?.error?.message || error.message
    });
  }
});

// AI Document Generation
router.post('/generate', async (req, res) => {
  try {
    const { prompt, templateId } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ success: false, error: 'Prompt is required' });
    }
    
    let systemPrompt = 'You are a professional document writer. Generate well-structured, formal documents.';
    
    if (templateId) {
      const template = db.prepare('SELECT * FROM templates WHERE id = ?').get(templateId);
      if (template) {
        systemPrompt += ` Follow this structure: ${template.description}`;
      }
    }
    
    const response = await axios.post(
      `${GROK_API_URL}/chat/completions`,
      {
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${GROK_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    const generatedText = response.data.choices[0].message.content;
    
    res.json({ 
      success: true, 
      data: { 
        content: generatedText 
      } 
    });
  } catch (error) {
    console.error('Error generating document:', error.response?.data || error.message);
    res.status(500).json({ 
      success: false, 
      error: 'Generation failed',
      details: error.response?.data?.error?.message || error.message
    });
  }
});

export default router;
