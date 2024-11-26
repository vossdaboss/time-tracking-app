const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 3000;

// In-memory storage for time entries
let timeEntries = [];

app.use(bodyParser.json());
app.use(express.static('public'));

// API endpoints
app.get('/api/entries', (req, res) => {
    res.json(timeEntries);
});

app.post('/api/entries', (req, res) => {
    const entry = {
        id: Date.now(),
        ...req.body,
        startTime: new Date(req.body.startTime),
        endTime: req.body.endTime ? new Date(req.body.endTime) : null
    };
    timeEntries.push(entry);
    res.json(entry);
});

app.put('/api/entries/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = timeEntries.findIndex(entry => entry.id === id);
    if (index !== -1) {
        timeEntries[index] = { ...timeEntries[index], ...req.body };
        res.json(timeEntries[index]);
    } else {
        res.status(404).json({ error: 'Entry not found' });
    }
});

app.delete('/api/entries/:id', (req, res) => {
    const id = parseInt(req.params.id);
    timeEntries = timeEntries.filter(entry => entry.id !== id);
    res.json({ success: true });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
}); 