import pg from 'pg';

const { Client } = pg;

async function testLocalAdmin() {
  const client = new Client({
    connectionString: 'postgresql://postgres:postgres@127.0.0.1:54322/postgres'
  });

  try {
    console.log('Connecting to local database...');
    await client.connect();
    
    // Step 1: Check admin user
    console.log('\n1. Checking admin users...');
    const adminUsers = await client.query('SELECT id, username, email, is_active FROM admin_users');
    console.log('Admin users:', adminUsers.rows);

    // Step 2: Test verify_admin_password function
    console.log('\n2. Testing admin authentication...');
    const authResult = await client.query(
      "SELECT * FROM verify_admin_password('admin', 'admin123!')"
    );
    
    if (authResult.rows.length > 0) {
      console.log('✅ Admin authentication successful!');
      console.log('   Authenticated admin:', authResult.rows[0]);
    } else {
      console.log('❌ Admin authentication failed');
    }

    // Step 3: Check subdomains
    console.log('\n3. Checking subdomains...');
    const subdomains = await client.query('SELECT id, name, display_name FROM subdomains LIMIT 5');
    console.log('Subdomains:', subdomains.rows);

    // Step 4: Check posts
    console.log('\n4. Checking posts...');
    const posts = await client.query('SELECT id, title, subdomain_id FROM posts LIMIT 3');
    console.log('Posts:', posts.rows);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
    console.log('\nDatabase connection closed');
  }
}

testLocalAdmin();