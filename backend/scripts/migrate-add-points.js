// Migration script untuk menambahkan kolom points ke users table
// Points adalah koin/platform currency (off-chain)

import { Pool } from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from backend directory
dotenv.config({ path: join(__dirname, '..', '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/space_stellar',
});

const migrate = async () => {
  try {
    console.log('🔄 Adding points column to users table...\n');

    // Add points column to users table
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 20 NOT NULL;
    `);

    // Add check constraint to ensure points >= 0
    await pool.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint 
          WHERE conname = 'users_points_check'
        ) THEN
          ALTER TABLE users 
          ADD CONSTRAINT users_points_check 
          CHECK (points >= 0);
        END IF;
      END $$;
    `);

    // Create index for points (for leaderboard/sorting)
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_users_points ON users(points DESC);
    `);

    // Set default points untuk existing users yang belum punya points
    await pool.query(`
      UPDATE users 
      SET points = 20 
      WHERE points IS NULL;
    `);

    console.log('✅ Points column added successfully!');
    console.log('📊 Changes:');
    console.log('   - Added points column (INTEGER, default: 20)');
    console.log('   - Added constraint: points >= 0');
    console.log('   - Created index on points');
    console.log('   - Set default points (20) for existing users');
    console.log('');
    console.log('💡 Points System:');
    console.log('   - Points adalah koin/platform currency (off-chain)');
    console.log('   - Setiap user mendapat 20 points saat pertama kali register');
    console.log('   - Points digunakan untuk mint NFT dan belanja di shop');
    console.log('   - Points akan dikurangi saat mint NFT');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  }
};

migrate();

