/**
 * Migration script untuk menambahkan kolom mode ke rooms table
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
    console.log('🔄 Adding mode column to rooms table...\n');

    // Check if column already exists
    const columnExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'rooms' 
        AND column_name = 'mode'
      );
    `);

    if (columnExists.rows[0].exists) {
      console.log('✅ Column "mode" already exists in rooms table');
      
      // Check if constraint exists
      const constraintExists = await pool.query(`
        SELECT EXISTS (
          SELECT FROM pg_constraint
          WHERE conname = 'rooms_mode_check'
        );
      `);

      if (!constraintExists.rows[0].exists) {
        console.log('🔄 Adding check constraint for mode...');
        await pool.query(`
          ALTER TABLE rooms 
          ADD CONSTRAINT rooms_mode_check 
          CHECK (mode IN ('solo','versus','multiplayer'));
        `);
        console.log('✅ Check constraint added');
      } else {
        console.log('✅ Check constraint already exists');
      }

      // Set default value if not set
      await pool.query(`
        ALTER TABLE rooms 
        ALTER COLUMN mode SET DEFAULT 'solo';
      `);
      console.log('✅ Default value set to "solo"');

      // Update existing rooms without mode to 'solo'
      const updateResult = await pool.query(`
        UPDATE rooms 
        SET mode = 'solo' 
        WHERE mode IS NULL;
      `);
      console.log(`✅ Updated ${updateResult.rowCount} rooms to have mode = 'solo'`);

      process.exit(0);
      return;
    }

    // Add mode column
    await pool.query(`
      ALTER TABLE rooms 
      ADD COLUMN mode TEXT CHECK (mode IN ('solo','versus','multiplayer')) DEFAULT 'solo' NOT NULL;
    `);

    console.log('✅ Mode column added successfully!');
    console.log('📊 Changes:');
    console.log('   - Added mode column (TEXT, default: "solo")');
    console.log('   - Added check constraint: mode IN ("solo","versus","multiplayer")');
    console.log('   - Set default value: "solo"');
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



