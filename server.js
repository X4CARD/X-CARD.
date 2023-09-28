const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const clients = {};

// WebSocket server
wss.on('connection', ws => {
    ws.on('message', message => {
        const data = JSON.parse(message);
        if (data.type === 'join') {
            clients[data.userName] = ws;
        } else if (data.type === 'offer' || data.type === 'answer' || data.type === 'ice-candidate') {
            // Handle offer, answer, or ICE candidate messages and forward them to the appropriate user
            if (clients[data.to]) {
                clients[data.to].send(JSON.stringify(data));
            }
        }
    });

    ws.on('close', () => {
        // Remove disconnected clients
        const userName = Object.keys(clients).find(key => clients[key] === ws);
        if (userName) {
            delete clients[userName];
        }
    });
});

// Serve static files
app.use(express.static('public'));

// Start the server
server.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
