import express from 'express';
import { matchRouter } from './routes/matches.js';
import http from 'http';
import { attachWebSocketServer } from './ws/server.js';
import { securityMiddleware } from './arject.js';

const PORT = Number(process.env.PORT) || 8000;
const HOST = process.env.HOST || '0.0.0.0';

const app = express();
const server = http.createServer(app)

app.use(express.json());

// Root GET route that returns a short message
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Sportz Realtime API server!' });
});

app.use(securityMiddleware())

app.use('/matches', matchRouter)

const {broadcastMatchCreated} = attachWebSocketServer(server);
app.locals.broadcastMatchCreated = broadcastMatchCreated;

// Start the server and log the URL
server.listen(PORT,HOST, () => {
  const baseURL = HOST === '0.0.0.0' ? `http://localhost:${PORT}`:`http://${HOST}:${PORT}`;

  console.log(`Server is running at ${baseURL}`);
  console.log(`Websocket Server is running on ${baseURL.replace('http', 'ws')}/ws`)
});
