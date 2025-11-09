import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import articleRoutes from './routes/articles';

dotenv.config();
console.log('Environment variables loaded, SUPABASE_DB_URL:', process.env.SUPABASE_DB_URL?.slice(0, 40) + '...');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/articles', articleRoutes);

export default app;
