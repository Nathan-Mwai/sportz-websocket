import express from 'express';
import { matchRouter } from './routes/matches.js';
import http from 'http';
import { attachWebSocketServer } from './ws/server.js';
import { securityMiddleware } from './arject.js';
import { commentaryRouter } from './routes/commentary.js';

const PORT = Number(process.env.PORT) || 8000;
const HOST = process.env.HOST || '0.0.0.0';

const app = express();
const server = http.createServer(app)

app.use(express.json());

app.use(securityMiddleware())

// Root GET route that returns a short message
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Sportz Realtime API server!' });
});


app.use('/matches', matchRouter)
app.use('/matches/:id/commentary',commentaryRouter)

const {broadcastMatchCreated, broadcastCommentary} = attachWebSocketServer(server);
app.locals.broadcastMatchCreated = broadcastMatchCreated;
app.locals.broadcastCommentary = broadcastCommentary;

// Start the server and log the URL
server.listen(PORT,HOST, () => {
  const baseURL = HOST === '0.0.0.0' ? `http://localhost:${PORT}`:`http://${HOST}:${PORT}`;

  console.log(`Server is running at ${baseURL}`);
  console.log(`Websocket Server is running on ${baseURL.replace('http', 'ws')}/ws`)
});
