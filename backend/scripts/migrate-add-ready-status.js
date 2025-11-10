/**
 * Migration script untuk menambahkan kolom host_ready dan guest_ready ke rooms table
 */

import { Pool } from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/space_stellar',
});

const migrate = async () => {
  try {
    console.log('🔄 Adding ready status columns to rooms table...\n');

    // Check if host_ready column exists
    const hostReadyExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'rooms' 
        AND column_name = 'host_ready'
      );
    `);

    if (!hostReadyExists.rows[0].exists) {
      // Add host_ready column
      await pool.query(`
        ALTER TABLE rooms 
        ADD COLUMN host_ready BOOLEAN DEFAULT FALSE NOT NULL;
      `);
      console.log('✅ Added host_ready column');
    } else {
      console.log('✅ host_ready column already exists');
    }

    // Check if guest_ready column exists
    const guestReadyExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'rooms' 
        AND column_name = 'guest_ready'
      );
    `);

    if (!guestReadyExists.rows[0].exists) {
      // Add guest_ready column
      await pool.query(`
        ALTER TABLE rooms 
        ADD COLUMN guest_ready BOOLEAN DEFAULT FALSE NOT NULL;
      `);
      console.log('✅ Added guest_ready column');
    } else {
      console.log('✅ guest_ready column already exists');
    }

    console.log('\n✅ Ready status columns migration completed!');
    console.log('📊 Changes:');
    console.log('   - Added host_ready column (BOOLEAN, default: FALSE)');
    console.log('   - Added guest_ready column (BOOLEAN, default: FALSE)');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail
    });
    process.exit(1);
  }
};

migrate();



