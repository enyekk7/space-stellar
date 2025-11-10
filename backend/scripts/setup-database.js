import { Client } from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from backend directory
dotenv.config({ path: join(__dirname, '..', '.env') });

const setupDatabase = async () => {
  // Connect to PostgreSQL server (not specific database)
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: 'postgres', // Connect to default postgres database
  });

  try {
    console.log('🔄 Connecting to PostgreSQL server...');
    await client.connect();
    console.log('✅ Connected to PostgreSQL server');

    // Check if database exists
    const dbName = process.env.DB_NAME || 'space_stellar';
    const result = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName]
    );

    if (result.rows.length === 0) {
      console.log(`📦 Creating database: ${dbName}...`);
      await client.query(`CREATE DATABASE ${dbName}`);
      console.log(`✅ Database '${dbName}' created successfully!`);
    } else {
      console.log(`✅ Database '${dbName}' already exists`);
    }

    await client.end();
    console.log('✅ Database setup completed!');
    console.log('\n📝 Next steps:');
    console.log('   1. Run migration: npm run db:migrate');
    console.log('   2. Start server: npm start');
  } catch (error) {
    console.error('❌ Database setup error:', error.message);
    
    if (error.message.includes('password authentication failed')) {
      console.error('\n💡 Tips:');
      console.error('   1. Check PostgreSQL password in .env file');
      console.error('   2. Default password is "postgres"');
      console.error('   3. Or set DB_PASSWORD in .env file');
    } else if (error.message.includes('connect')) {
      console.error('\n💡 Tips:');
      console.error('   1. Make sure PostgreSQL is running');
      console.error('   2. Check PostgreSQL is installed');
      console.error('   3. Default port is 5432');
    }
    
    process.exit(1);
  }
};

setupDatabase();

