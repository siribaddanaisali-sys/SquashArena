import sequelize from './config/database.js';
import dotenv from 'dotenv';
dotenv.config();

const run = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connected to database');

    // 1. Add 'admin' to user role ENUM
    await sequelize.query(`ALTER TABLE users MODIFY COLUMN role ENUM('player', 'coach', 'organiser', 'regulator', 'viewer', 'super_admin', 'admin') DEFAULT 'viewer'`);
    console.log('✓ Updated users role ENUM with admin');

    // Get the charset/collation from users table
    const [tableInfo] = await sequelize.query(`SELECT TABLE_COLLATION FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users'`);
    const collation = tableInfo[0]?.TABLE_COLLATION || 'utf8mb4_general_ci';
    const charset = collation.split('_')[0];
    console.log(`Using charset: ${charset}, collation: ${collation}`);

    // 2. Create audit_logs table
    await sequelize.query(`CREATE TABLE IF NOT EXISTS audit_logs (
      id CHAR(36) NOT NULL PRIMARY KEY,
      userId CHAR(36) NOT NULL,
      action ENUM('CREATE', 'UPDATE', 'DELETE') NOT NULL,
      entity VARCHAR(255) NOT NULL,
      entityId CHAR(36),
      oldValue JSON,
      newValue JSON,
      ipAddress VARCHAR(255),
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_audit_userId (userId),
      INDEX idx_audit_entity (entity, entityId),
      INDEX idx_audit_createdAt (createdAt)
    ) ENGINE=InnoDB DEFAULT CHARSET=${charset} COLLATE=${collation}`);
    console.log('✓ Created audit_logs table');

    // Add FK after table creation
    try {
      await sequelize.query(`ALTER TABLE audit_logs ADD CONSTRAINT fk_audit_user FOREIGN KEY (userId) REFERENCES users(id)`);
    } catch (e) { /* FK may already exist */ }

    // 3. Create approval_requests table
    await sequelize.query(`CREATE TABLE IF NOT EXISTS approval_requests (
      id CHAR(36) NOT NULL PRIMARY KEY,
      userId CHAR(36) NOT NULL,
      actionType VARCHAR(255) NOT NULL,
      entityType VARCHAR(255) NOT NULL,
      entityId CHAR(36) NOT NULL,
      payload JSON,
      status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
      reviewedBy CHAR(36),
      reviewNote TEXT,
      reviewedAt DATETIME,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_approval_userId (userId),
      INDEX idx_approval_status (status),
      INDEX idx_approval_entity (entityType, entityId)
    ) ENGINE=InnoDB DEFAULT CHARSET=${charset} COLLATE=${collation}`);
    console.log('✓ Created approval_requests table');

    try {
      await sequelize.query(`ALTER TABLE approval_requests ADD CONSTRAINT fk_approval_user FOREIGN KEY (userId) REFERENCES users(id)`);
      await sequelize.query(`ALTER TABLE approval_requests ADD CONSTRAINT fk_approval_reviewer FOREIGN KEY (reviewedBy) REFERENCES users(id)`);
    } catch (e) { /* FKs may already exist */ }

    // 4. Create super_admin_transfers table
    await sequelize.query(`CREATE TABLE IF NOT EXISTS super_admin_transfers (
      id CHAR(36) NOT NULL PRIMARY KEY,
      fromUserId CHAR(36) NOT NULL,
      toUserId CHAR(36) NOT NULL,
      status ENUM('pending', 'confirmed', 'cancelled', 'expired') DEFAULT 'pending',
      confirmationToken VARCHAR(255) NOT NULL,
      expiresAt DATETIME NOT NULL,
      confirmedAt DATETIME,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_transfer_fromUserId (fromUserId),
      INDEX idx_transfer_toUserId (toUserId),
      INDEX idx_transfer_status (status),
      INDEX idx_transfer_token (confirmationToken)
    ) ENGINE=InnoDB DEFAULT CHARSET=${charset} COLLATE=${collation}`);
    console.log('✓ Created super_admin_transfers table');

    try {
      await sequelize.query(`ALTER TABLE super_admin_transfers ADD CONSTRAINT fk_transfer_from FOREIGN KEY (fromUserId) REFERENCES users(id)`);
      await sequelize.query(`ALTER TABLE super_admin_transfers ADD CONSTRAINT fk_transfer_to FOREIGN KEY (toUserId) REFERENCES users(id)`);
    } catch (e) { /* FKs may already exist */ }

    console.log('\n✅ All migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  }
};

run();
