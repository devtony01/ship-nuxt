const mysql = require('mysql2/promise');

async function testSingleConnection() {
  console.log('Testing single MySQL connection...');
  
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'ship_user',
      password: 'ship_password',
      database: 'ship_nuxt'
    });

    console.log('Single connection created, testing query...');
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('Query result:', rows);
    
    await connection.end();
    console.log('✅ Single connection test passed!');
  } catch (error) {
    console.error('❌ Single connection test failed:', error);
  }
}

testSingleConnection();
