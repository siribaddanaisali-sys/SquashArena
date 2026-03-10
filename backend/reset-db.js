import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const resetDatabase = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });

  try {
    await connection.execute(`DROP DATABASE IF EXISTS \`Squash Arena\``);
    console.log('✓ Database dropped');
    
    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`Squash Arena\``);
    console.log('✓ Database created');
  } catch (error) {
    console.error('✗ Error:', error.message);
  } finally {
    await connection.end();
  }
};

resetDatabase();
