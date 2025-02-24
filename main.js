// Create socket connection directly without importing
const socket = io();

// Get DOM elements
const canvas = document.getElementById('whiteboard');
const ctx = canvas.getContext('2d');
const colorPicker = document.getElementById('colorPicker');
const clearButton = document.getElementById('clearBoard');
const brushSize = document.getElementById('brushSize');
const brushSizeValue = document.getElementById('brushSizeValue');

// Drawing state
let isDrawing = false;
let lastX = 0;
let lastY = 0;

// Drawing function
function drawLine(line) {
    console.log('Drawing line:', line);  // Debug log
    ctx.beginPath();
    ctx.moveTo(line.startX, line.startY);
    ctx.lineTo(line.endX, line.endY);
    ctx.strokeStyle = line.color;
    ctx.lineWidth = line.width;
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.closePath();
}

// Event Listeners
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);

function startDrawing(e) {
    isDrawing = true;
    [lastX, lastY] = [e.offsetX, e.offsetY];
    console.log('Started drawing at:', lastX, lastY);  // Debug log
}

function draw(e) {
    if (!isDrawing) return;

    const line = {
        startX: lastX,
        startY: lastY,
        endX: e.offsetX,
        endY: e.offsetY,
        color: colorPicker.value,
        width: parseInt(brushSize.value) || 5
    };

    // Send the line to the server
    socket.emit('draw-line', line);
    
    // Update last position
    [lastX, lastY] = [e.offsetX, e.offsetY];
}

function stopDrawing() {
    isDrawing = false;
}

// Clear board
clearButton.addEventListener('click', () => {
    socket.emit('clear-board');
});

// Update brush size display
brushSize.addEventListener('input', (e) => {
    brushSizeValue.textContent = `${e.target.value}px`;
});

// Socket event handlers
socket.on('connect', () => {
    console.log('Connected to server');
});

socket.on('draw-line', (line) => {
    drawLine(line);
});

socket.on('board-state', (boardState) => {
    console.log('Received board state:', boardState);  // Debug log
    if (boardState && boardState.lines) {
        boardState.lines.forEach(line => drawLine(line));
    }
});

socket.on('clear-board', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});

// Error handling
socket.on('connect_error', (error) => {
    console.error('Connection error:', error);
});

socket.on('error', (error) => {
    console.error('Socket error:', error);
});