const express = require('express');
const app = express();
const http = require('http').createServer(app);
const path = require('path');
const io = require('socket.io')(http, {
    cors: {
        origin: '*',
        methods: ["GET", "POST"]
    }
});

// Serve static files
app.use(express.static(__dirname));

// Serve index.html for root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Store the current board state
let boardState = {
    lines: [],
    currentColor: '#000000'
};

io.on('connection', (socket) => {
    console.log('A user connected');

    // Send current board state to new clients
    socket.emit('board-state', boardState);

    // Handle drawing events
    socket.on('draw-line', (line) => {
        console.log('Line received:', line);  // Debug log
        boardState.lines.push(line);
        // Broadcast to all clients including sender
        io.emit('draw-line', line);
    });

    // Handle clear board events
    socket.on('clear-board', () => {
        boardState.lines = [];
        io.emit('clear-board');
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

const PORT = 3000;
http.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});