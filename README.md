# AIArticleGen 🤖

AI-powered article generator for developers. Generate technical articles instantly using Google Gemini AI.

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://aiarticlegen.vercel.app)

## 🚀 Quick Start

Clone repository
git clone https://github.com/yourusername/aiarticlegen.git

Setup backend
cd backend
npm install
cp .env.example .env # Add your credentials
npm run dev # Runs on :3000

Setup frontend (new terminal)
cd frontend
npm install
cp .env.example .env # Add backend URL
npm run dev # Runs on :5173

## 🛠️ Tech Stack

**Frontend:** React, TypeScript, Vite, Tailwind CSS  
**Backend:** Node.js, Express, TypeScript, Supabase  
**AI:** Google Gemini API  
**Auth:** JWT + bcrypt

## 📁 Structure

├── frontend/ # React app
├── backend/ # Express API
└── README.md

## 🌐 Deployment

**Frontend (Vercel):**
cd frontend && vercel --prod

**Backend (Render):**
- Push to GitHub
- Connect to Render
- Add environment variables
- Deploy

## 📝 Environment Variables

**Backend (.env):**
JWT_SECRET=your-secret-key
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-key
GEMINI_API_KEY=your-gemini-key
ALLOWED_ORIGINS=http://localhost:5173

**Frontend (.env):**
VITE_API_URL=http://localhost:3000/api

## 📚 Key Features

✅ AI article generation  
✅ Bulk creation (multiple articles)  
✅ User authentication  
✅ Chat interface  
✅ Blog management  
✅ Dark mode  

## 🔗 Links

- **Live:** [aiarticlegen.vercel.app](https://aiarticlegen.vercel.app)
- **API:** [aiarticlegen.onrender.com](https://aiarticlegen.onrender.com)
- **Docs:** See `/frontend` and `/backend` READMEs

## 👨‍💻 Author

**Aditya Telsinge**

## 📄 License

MIT
