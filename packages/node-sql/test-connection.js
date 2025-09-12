const mysql = require('mysql2/promise');

async function testConnection() {
  console.log('Testing direct MySQL connection...');
  
  try {
    const connection = mysql.createPool({
      uri: 'mysql://ship_user:ship_password@localhost:3306/ship_nuxt',
    });

    console.log('Pool created, testing query...');
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('Query result:', rows);
    
    await connection.end();
    console.log('✅ Direct connection test passed!');
  } catch (error) {
    console.error('❌ Direct connection test failed:', error);
  }
}

testConnection();
