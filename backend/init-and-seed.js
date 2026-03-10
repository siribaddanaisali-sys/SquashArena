import { initDatabase } from './config/database.js';
import { seedDatabase } from './seed.js';

const start = async () => {
  try {
    console.log('Initializing database...');
    await initDatabase();
    
    console.log('\nSeeding database...');
    // Import seed function dynamically
    const module = await import('./seed.js');
    // The seed.js already has seedDatabase function that runs on import
  } catch (error) {
    console.error('Failed:', error.message);
    process.exit(1);
  }
};

start();
