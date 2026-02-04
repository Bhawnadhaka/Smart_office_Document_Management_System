import express from 'express';
import cors from 'cors';
import expressWs from 'express-ws';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDatabase } from './database/init.js';
import documentRoutes from './routes/documents.js';
import templateRoutes from './routes/templates.js';
import voiceRoutes from './routes/voice.js';
import { setupWebSocket } from './websocket/handler.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const { app: wsApp } = expressWs(app);

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize Database
initDatabase();

// Routes
app.use('/api/documents', documentRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/voice', voiceRoutes);

// WebSocket Setup
setupWebSocket(app);

// Serve static files from React app in production
if (process.env.NODE_ENV === 'production') {
  const clientBuildPath = path.join(__dirname, '../client/dist');
  app.use(express.static(clientBuildPath));
  
  // Serve index.html for all non-API routes
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}

// Health Check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'online',
    timestamp: new Date().toISOString(),
    engines: {
      document: 'active',
      storage: 'active',
      template: 'active',
      voice: 'active'
    }
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║         🏢 SMART OFFICE SYSTEM - OFFLINE OS MODE         ║
╚═══════════════════════════════════════════════════════════╝

📡 Server Status: ONLINE
🌐 Port: ${PORT}
🔗 API Base: http://localhost:${PORT}
📝 Document Engine: ✅ Active
💾 Storage Engine: ✅ Active
📄 Template Engine: ✅ Active
🎤 Voice Engine: ✅ Active (GROK AI)

🚀 Ready to accept connections...
  `);
});

export default app;
