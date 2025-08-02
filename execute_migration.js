import pg from 'pg';
import fs from 'fs';

const { Client } = pg;

async function executeMigration() {
  const client = new Client({
    connectionString: 'postgres://postgres.taxztmphioixwsxsveko:TmQwFRfaKJZidurx@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres',
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('Connecting to database...');
    await client.connect();
    
    // Step 1: Drop all tables
    console.log('\n1. Dropping all existing tables...');
    const dropSql = fs.readFileSync('drop_all_tables.sql', 'utf8');
    try {
      await client.query(dropSql);
      console.log('✅ All tables dropped successfully');
    } catch (error) {
      console.log('⚠️  Some drop commands may have failed (tables might not exist)');
    }

    // Step 2: Execute complete migration
    console.log('\n2. Executing complete migration...');
    const migrationSql = fs.readFileSync('complete_migration.sql', 'utf8');
    
    // Split SQL by semicolons but keep them
    const statements = migrationSql
      .split(/;(?=\s*(?:--|CREATE|ALTER|INSERT|DROP|GRANT|$))/g)
      .filter(stmt => stmt.trim().length > 0)
      .map(stmt => stmt.trim() + (stmt.trim().endsWith(';') ? '' : ';'));

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // Skip comments and empty statements
      if (!statement || statement.startsWith('--') || statement.trim() === ';') {
        continue;
      }

      try {
        process.stdout.write(`Executing statement ${i + 1}/${statements.length}... `);
        await client.query(statement);
        process.stdout.write('✅\n');
        successCount++;
      } catch (error) {
        process.stdout.write(`❌\n`);
        console.error(`Error: ${error.message}`);
        errorCount++;
        
        // Continue on error for things like "already exists"
        if (!error.message.includes('already exists') && 
            !error.message.includes('duplicate key')) {
          console.error('Statement:', statement.substring(0, 100) + '...');
        }
      }
    }

    console.log(`\n✅ Migration completed!`);
    console.log(`   - Successful statements: ${successCount}`);
    console.log(`   - Failed statements: ${errorCount}`);

    // Step 3: Test admin authentication
    console.log('\n3. Testing admin authentication...');
    const result = await client.query(
      "SELECT * FROM verify_admin_password('admin', 'admin123!')"
    );
    
    if (result.rows.length > 0) {
      console.log('✅ Admin authentication test passed!');
      console.log('   Admin user:', result.rows[0]);
    } else {
      console.log('❌ Admin authentication test failed');
    }

  } catch (error) {
    console.error('Fatal error:', error);
  } finally {
    await client.end();
    console.log('\nDatabase connection closed');
  }
}

executeMigration();