# AIArticleGen - Backend

Express + TypeScript API with JWT auth.

## 🚀 Setup

npm install
cp .env.example .env # Add credentials
npm run dev # localhost:3000

## 📦 Build

npm run build # Compiles to /dist
npm start # Run production


## 🔧 Environment

JWT_SECRET=<run: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))">
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=your-key
GEMINI_API_KEY=your-key
ALLOWED_ORIGINS=http://localhost:5173,https://yourdomain.com

## 🗄️ Database Setup

Run in Supabase SQL Editor:

-- Users
CREATE TABLE users (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
email VARCHAR(255) UNIQUE NOT NULL,
password_hash VARCHAR(60) NOT NULL,
name VARCHAR(255),
created_at TIMESTAMP DEFAULT NOW()
);

-- Articles
CREATE TABLE articles (
id SERIAL PRIMARY KEY,
title VARCHAR(255) NOT NULL,
content TEXT NOT NULL,
user_id UUID REFERENCES users(id) ON DELETE CASCADE,
author_name VARCHAR(255),
created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_articles_user_id ON articles(user_id);


## 📡 API Endpoints

GET /health
POST /api/auth/signup
POST /api/auth/login
GET /api/articles
POST /api/articles/generate (protected)
POST /api/articles/bulk-generate (protected)
DELETE /api/articles/:id (protected)

## 🚢 Deploy to Render

1. Push to GitHub
2. Render → New Web Service
3. Build: `npm install && npm run build`
4. Start: `npm run start:prod`
5. Add environment variables

## 🔒 Security

✅ JWT auth  
✅ bcrypt passwords  
✅ Rate limiting  
✅ CORS whitelist  
✅ Helmet.js  

## 🛠️ Stack

Node.js • Express • TypeScript • Supabase • JWT • Gemini AI
