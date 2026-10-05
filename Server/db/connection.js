import 'dotenv/config';
import pg from 'pg';

const isProduction = process.env.NODE_ENV === 'production';

const pool = new pg.Pool({
    ...(process.env.DATABASE_URL
        ? {
            connectionString: process.env.DATABASE_URL.trim(),
        }
        : {
            user: process.env.DB_USER?.trim() || 'postgres',
            host: process.env.DB_HOST?.trim() || 'localhost',
            database: process.env.DB_NAME?.trim(),
            password: process.env.DB_PASSWORD?.trim(),
            port: Number(process.env.DB_PORT) || 5432,
        }),
    ...(isProduction
        ? {
            ssl: {
                rejectUnauthorized: false,
            },
        }
        : {}),
});

export default pool;
