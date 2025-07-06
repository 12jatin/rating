import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});


pool.connect()
  .then(client => {
    console.log('PostgreSQL connected successfully');
    client.release(); 
  })
  .catch(err => {
    console.error('PostgreSQL connection failed:', err);
  });

export default pool;
