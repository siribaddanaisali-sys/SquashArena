import bcryptjs from 'bcryptjs';
import sequelize from './config/database.js';

const seq = sequelize;

(async () => {
  try {
    await seq.authenticate();

    const hash = await bcryptjs.hash('Test@123', 10);

    // Get region IDs
    const [regions] = await seq.query('SELECT id, name FROM regions WHERE code IN ("EG","UK","LK")');
    const egypt = regions.find(r => r.name === 'Egypt');
    const uk = regions.find(r => r.name === 'United Kingdom');
    const lk = regions.find(r => r.name === 'Sri Lanka');

    // Check if admins already exist
    const [existing] = await seq.query('SELECT email FROM users WHERE email IN ("admin.egypt@squash.com","admin.uk@squash.com","admin.lk@squash.com")');
    if (existing.length > 0) {
      console.log('Admin users already exist:', existing.map(e => e.email));
      await seq.close();
      return;
    }

    const admins = [
      { email: 'admin.egypt@squash.com', firstName: 'Nour', lastName: 'Hassan', regionId: egypt.id },
      { email: 'admin.uk@squash.com', firstName: 'James', lastName: 'Wright', regionId: uk.id },
      { email: 'admin.lk@squash.com', firstName: 'Kamal', lastName: 'Perera', regionId: lk.id }
    ];

    for (const admin of admins) {
      await seq.query(
        'INSERT INTO users (id, email, password, firstName, lastName, role, isActive, regionId, createdAt, updatedAt) VALUES (UUID(), ?, ?, ?, ?, "admin", 1, ?, NOW(), NOW())',
        { replacements: [admin.email, hash, admin.firstName, admin.lastName, admin.regionId] }
      );
      console.log('✓ Created:', admin.email, '-> regionId:', admin.regionId);
    }

    console.log('\n✅ Done! 3 admin users inserted.');
    console.log('Credentials: [email] / Test@123');
    await seq.close();
  } catch (err) {
    console.error('Error:', err.message);
    await seq.close();
    process.exit(1);
  }
})();
