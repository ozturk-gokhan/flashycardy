import 'dotenv/config';
import { db } from '../lib/db';
import { decksTable, cardsTable } from '../db/schema';

async function testDatabaseConnection() {
  try {
    console.log('🔗 Testing database connection...');
    
    // Test connection by running a simple query
    const result = await db.execute('SELECT NOW() as current_time');
    console.log('✅ Database connection successful!');
    console.log('Current database time:', result.rows[0]);

    // Test schema by counting tables (this will work after schema is pushed)
    try {
      const deckCount = await db.select().from(decksTable).limit(1);
      console.log('✅ Schema tables are accessible');
    } catch (error) {
      console.log('⚠️  Schema tables not yet created. Run `npx drizzle-kit push` to create them.');
    }
    
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

testDatabaseConnection();
