import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.SUPABASE_DB_URL,
  ssl: false,
});


pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Database connection test failed:', err);
  } else {
    console.log('✅ Database connected at:', res.rows[0].now);
  }
});

export default pool;
