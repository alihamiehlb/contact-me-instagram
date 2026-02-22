# 📸 Instagram Contact Form

A beautiful, dark-themed contact form that sends submissions directly to your **Telegram**, built with Node.js + Express. Deployed on Vercel.

## ✨ Features

- 🎨 Instagram-inspired dark UI with gradient accents
- 📬 Form submissions sent to Telegram (email, Instagram handle, subject, message)
- 📸 Captures a visitor photo via camera and sends it to Telegram
- 🌐 Collects IP address and device info automatically
- 🔒 Credentials stored securely in environment variables — never exposed client-side
- 📲 Redirects to your Instagram profile after submission

## 📁 Project Structure

```
├── public/
│   └── index.html       # Frontend contact form
├── server.js            # Express backend (API + static serving)
├── vercel.json          # Vercel deployment config
├── .env.example         # Template for environment variables
└── package.json
```

## 🚀 Quick Start (Local)

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env
# Edit .env and fill in your Telegram credentials

# 3. Run
npm start
# → http://localhost:3000
```

## ⚙️ Environment Variables

| Variable | Description |
|---|---|
| `TELEGRAM_BOT_TOKEN` | Your bot token from [@BotFather](https://t.me/BotFather) |
| `TELEGRAM_CHAT_ID` | Your chat/user ID (use [@userinfobot](https://t.me/userinfobot)) |
| `PORT` | Server port (default: 3000) |

## ☁️ Deploy to Vercel

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → **New Project** → import the repo
3. Add the environment variables in the Vercel dashboard
4. Select **"Other"** as the framework preset
5. Click **Deploy** 🚀

## 🛠 Tech Stack

- **Frontend**: Vanilla HTML/CSS/JS
- **Backend**: Node.js, Express
- **File Uploads**: Multer
- **HTTP**: node-fetch
- **Deployment**: Vercel
