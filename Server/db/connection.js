import 'dotenv/config';
import pg from 'pg';

const pool = new pg.Pool({
    user: 'postgres',
    host: 'localhost',
    database: process.env.DB_NAME?.trim(),
    password: process.env.DB_PASSWORD?.trim(),
    port: Number(process.env.DB_PORT),
});

export default pool;
