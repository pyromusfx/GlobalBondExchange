#!/usr/bin/env tsx

import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';

const execPromise = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log('Generating MySQL database migrations...');
  
  // Check for DATABASE_URL environment variable
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('Error: DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  try {
    // Use drizzle-kit to generate migrations
    console.log('Running drizzle-kit generate...');
    const configPath = path.resolve(__dirname, '../drizzle.config.mysql.ts');
    
    const { stdout, stderr } = await execPromise(`npx drizzle-kit generate:mysql --config=${configPath}`);
    
    if (stderr) {
      console.error('Generation error:', stderr);
    }
    
    console.log(stdout);
    console.log('Migration generation completed!');
    process.exit(0);
  } catch (error) {
    console.error('Migration generation failed:', error);
    process.exit(1);
  }
}

main();