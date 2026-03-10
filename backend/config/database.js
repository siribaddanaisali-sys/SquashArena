import mysql from 'mysql2/promise';
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    port: process.env.DB_PORT,
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
  }
);

export const initDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('✓ Database connection established');
    
    // Use force: false to avoid dropping tables, and set specific sync options
    await sequelize.sync({ 
      alter: false,
      logging: false
    });
    console.log('✓ Database synchronized');
  } catch (error) {
    console.error('✗ Database connection failed:', error.message);
    process.exit(1);
  }
};

export default sequelize;
