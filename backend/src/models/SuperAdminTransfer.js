import { DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';

const SuperAdminTransfer = sequelize.define('SuperAdminTransfer', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  fromUserId: {
    // Current SuperAdmin initiating the transfer
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'users', key: 'id' },
  },
  toUserId: {
    // Target user who will receive SuperAdmin role
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'users', key: 'id' },
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'cancelled', 'expired'),
    defaultValue: 'pending',
  },
  confirmationToken: {
    // Secure token required to confirm the transfer
    type: DataTypes.STRING,
    allowNull: false,
  },
  expiresAt: {
    // Transfer expires after a set duration for safety
    type: DataTypes.DATE,
    allowNull: false,
  },
  confirmedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'super_admin_transfers',
  timestamps: true,
  freezeTableName: true,
  indexes: [
    { fields: ['fromUserId'] },
    { fields: ['toUserId'] },
    { fields: ['status'] },
    { fields: ['confirmationToken'] },
  ],
});

export default SuperAdminTransfer;
