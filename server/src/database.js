import {Pool} from "pg"

/* //Serverless DB
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});
*/

// Local DB
export const pool = new Pool({
  user: process.env.DATABASE_USER,
  host: 'db',
  database: process.env.DATABASE_NAME,
  password: process.env.DATABASE_PASSWORD,
  port: 5432,
});