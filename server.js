const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3001;  // Different from React's port 3000

app.use(cors());
app.use(express.json());

const dataPath = path.join(__dirname, 'data', 'todos.json');

// Get all todos
app.get('/api/todos', async (req, res) => {
  try {
    const data = await fs.readFile(dataPath, 'utf8');
    res.json(JSON.parse(data));
  } catch (error) {
    res.status(500).json({ error: 'Error reading todos' });
  }
});

// Update todos
app.post('/api/todos', async (req, res) => {
  try {
    const todos = req.body;
    await fs.writeFile(dataPath, JSON.stringify({ todos }, null, 2));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error saving todos' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 