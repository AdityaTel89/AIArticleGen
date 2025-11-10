# AIArticleGen - Frontend

React + TypeScript + Vite frontend.

## 🚀 Setup

npm install
cp .env.example .env
npm run dev # localhost:5173

## 📦 Build

npm run build # Production build
npm run preview # Preview build

## 🔧 Environment

VITE_API_URL=http://localhost:3000/api

## 📁 Structure
src/
├── api/ # API calls
├── components/ # Reusable components
├── context/ # Auth context
├── pages/ # Routes (Home, Blog, Login)
└── App.tsx # Main app

## 🚢 Deploy to Vercel

vercel --prod

**Or via dashboard:**
1. Import GitHub repo
2. Framework: Vite
3. Build: `npm run build`
4. Output: `dist`
5. Add `VITE_API_URL` env var

## 🛠️ Stack

React • TypeScript • Vite • Tailwind • React Router • Axios

## 📝 Key Files

- `src/context/AuthContext.tsx` - Authentication
- `src/api/articleApi.ts` - API client
- `src/pages/Home.tsx` - Chat interface
- `src/pages/Blog.tsx` - Articles list
