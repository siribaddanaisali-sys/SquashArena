import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const createDatabase = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });

  try {
    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`Squash Arena\``);
    console.log('✓ Database "Squash Arena" created successfully');
  } catch (error) {
    console.error('✗ Database creation failed:', error.message);
  } finally {
    await connection.end();
  }
};

createDatabase();
