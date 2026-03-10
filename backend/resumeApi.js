// backend/resumeApi.js
// Simple Express backend for resume improvement

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const app = express();
app.use(cors());
app.use(express.json());

// Multer setup for file uploads (memory storage)
const upload = multer({ storage: multer.memoryStorage() });

// Simulated AI improvement logic
function improveResume(text) {
    let improved = text
        .replace(/\b(i|me|my)\b/gi, 'the candidate')
        .replace(/\b(job|work)\b/gi, 'professional experience')
        .replace(/\b(good|nice)\b/gi, 'excellent')
        .replace(/\b(do|did|make|made)\b/gi, 'accomplished');
    const keywords = ['leadership', 'teamwork', 'communication', 'problem-solving'];
    keywords.forEach(keyword => {
        if (!improved.toLowerCase().includes(keyword)) {
            improved += `\n• Demonstrated strong ${keyword} skills`;
        }
    });
    return `AI-Enhanced Resume:\n\n${improved}\n\n*Note: This is a simulated AI improvement. In production, integrate with a real AI service.*`;
}


// New endpoint for file upload (PDF or TXT)
app.post('/api/improve-resume-file', upload.single('resume'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });
    let text = '';
    try {
        if (req.file.mimetype === 'application/pdf') {
            // Extract text from PDF
            const data = await pdfParse(req.file.buffer);
            text = data.text;
        } else if (req.file.mimetype === 'text/plain') {
            text = req.file.buffer.toString('utf-8');
        } else {
            return res.status(400).json({ error: 'Unsupported file type. Please upload a PDF or TXT file.' });
        }
        const improved = improveResume(text);
        res.json({ improved });
    } catch (err) {
        res.status(500).json({ error: 'Failed to process file.' });
    }
});

// Keep the old JSON endpoint for .txt pasted text
app.post('/api/improve-resume', (req, res) => {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'No resume text provided.' });
    const improved = improveResume(text);
    res.json({ improved });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Resume API running on port ${PORT}`));
