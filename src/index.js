import express from 'express';

const app = express();
const PORT = 8000;

// Use JSON middleware to parse incoming requests with JSON payloads
app.use(express.json());

// Root GET route that returns a short message
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Sportz Realtime API server!' });
});

// Start the server and log the URL
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
