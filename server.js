const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const os = require('os');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const CODE_PASSWORD = process.env.CODE_PASSWORD || 'code123';

const KEYS = {
    openrouter: process.env.OPENROUTER_KEYS ? process.env.OPENROUTER_KEYS.split(',') : [],
    nvidia: process.env.NVIDIA_KEYS ? process.env.NVIDIA_KEYS.split(',') : [],
    gemini: process.env.GEMINI_KEYS ? process.env.GEMINI_KEYS.split(',') : []
};
let keyIndices = { openrouter: 0, nvidia: 0, gemini: 0 };

function getKey(provider) {
    const keys = KEYS[provider];
    if (!keys || keys.length === 0) return null;
    const index = keyIndices[provider];
    keyIndices[provider] = (index + 1) % keys.length;
    return keys[index];
}

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });
        req.user = user;
        next();
    });
};

app.post('/api/login', (req, res) => {
    const { password } = req.body;
    if (password === ADMIN_PASSWORD) {
        const token = jwt.sign({ admin: true }, JWT_SECRET, { expiresIn: '30d' });
        return res.json({ token });
    }
    res.status(401).json({ error: 'Wrong password' });
});

app.post('/api/verify-code-vault', (req, res) => {
    const { password } = req.body;
    if (password === CODE_PASSWORD) return res.json({ success: true });
    res.status(401).json({ error: 'Wrong code' });
});

app.get('/api/monitor', authenticateToken, (req, res) => {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    res.json({
        memory: {
            total: (totalMem / 1024 / 1024 / 1024).toFixed(2) + ' GB',
            used: (usedMem / 1024 / 1024 / 1024).toFixed(2) + ' GB',
            percentage: ((usedMem / totalMem) * 100).toFixed(1) + '%'
        },
        uptime: (os.uptime() / 3600).toFixed(2) + ' h',
        platform: os.platform(),
        cpu_load: os.loadavg()
    });
});

app.post('/api/chat', authenticateToken, async (req, res) => {
    const { provider, model, messages } = req.body;
    const apiKey = getKey(provider);
    if (!apiKey) return res.status(400).json({ error: 'No API key for ' + provider });
    try {
        let url, options;
        if (provider === 'openrouter') {
            url = 'https://openrouter.ai/api/v1/chat/completions'
            options = {
                method: 'POST',
                headers: { 'Authorization': 'Bearer ' + apiKey, 'Content-Type': 'application/json' },
                body: JSON.stringify({ model, messages })
            };
        } else if (provider === 'gemini') {
            url = 'https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent?key=' + apiKey;
            options = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: messages[messages.length-1].content }] }] })
            };
        } else {
            return res.status(400).json({ error: 'Unsupported provider' });
        }
        const response = await fetch(url, options);
        const data = await response.json();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/ai-self-modify', authenticateToken, async (req, res) => {
    const { filePath, content, commitMessage } = req.body;
    const githubToken = process.env.GITHUB_PAT;
    const repo = process.env.GITHUB_REPO;
    if (!githubToken || !repo) return res.status(500).json({ error: 'GitHub config missing' });
    try {
        const getFileUrl = 'https://api.github.com/repos/' + repo + '/contents/' + filePath;
        const fileRes = await fetch(getFileUrl, { headers: { 'Authorization': 'token ' + githubToken } });
        const fileData = await fileRes.json();
        const sha = fileData.sha;
        const updateRes = await fetch(getFileUrl, {
            method: 'PUT',
            headers: { 'Authorization': 'token ' + githubToken, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: commitMessage || 'AI auto-commit',
                content: Buffer.from(content).toString('base64'),
                sha: sha
            })
        });
        const updateData = await updateRes.json();
        res.json({ success: true, message: 'Committed to GitHub', details: updateData.commit?.html_url });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log('Backend running on port ' + PORT));
