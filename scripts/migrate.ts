#!/usr/bin/env tsx

import { drizzle } from 'drizzle-orm/mysql2';
import { migrate } from 'drizzle-orm/mysql2/migrator';
import mysql from 'mysql2/promise';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database connection
async function main() {
  console.log('Starting MySQL database migration...');
  
  // Check for DATABASE_URL environment variable
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('Error: DATABASE_URL environment variable is not set');
    process.exit(1);
  }
  
  try {
    // Create a MySQL connection
    console.log('Connecting to MySQL database...');
    const pool = mysql.createPool({
      uri: dbUrl
    });
    
    // Create a Drizzle instance
    const db = drizzle(pool);
    
    // Run migrations from the 'migrations' directory
    console.log('Running migrations...');
    await migrate(db, { migrationsFolder: path.resolve(__dirname, '../migrations') });
    
    console.log('Migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

main();