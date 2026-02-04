// WebSocket Handler for Real-time Features (Future Use)
const connections = new Map();

export function setupWebSocket(app) {
  app.ws('/ws', (ws, req) => {
    const clientId = Date.now().toString();
    connections.set(clientId, ws);
    
    console.log(`🔌 Client connected: ${clientId}`);
    
    ws.on('message', (msg) => {
      try {
        const data = JSON.parse(msg);
        
        // Handle different message types
        switch (data.type) {
          case 'ping':
            ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
            break;
            
          case 'document_update':
            // Broadcast to other clients (future collaborative editing)
            broadcastToOthers(clientId, data);
            break;
            
          default:
            console.log('Unknown message type:', data.type);
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });
    
    ws.on('close', () => {
      connections.delete(clientId);
      console.log(`🔌 Client disconnected: ${clientId}`);
    });
    
    // Send welcome message
    ws.send(JSON.stringify({ 
      type: 'connected', 
      clientId,
      message: 'Connected to Smart Office System' 
    }));
  });
}

function broadcastToOthers(senderId, data) {
  connections.forEach((ws, clientId) => {
    if (clientId !== senderId && ws.readyState === 1) {
      ws.send(JSON.stringify(data));
    }
  });
}

export default { setupWebSocket };
