import express from 'express';
import { matchRouter } from './routes/matches.js';

const app = express();
const PORT = 8000;

app.use(express.json());

// Root GET route that returns a short message
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Sportz Realtime API server!' });
});

app.use('/matches', matchRouter)

// Start the server and log the URL
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
