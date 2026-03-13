import { DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';

const ClubMembership = sequelize.define('ClubMembership', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  clubId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'clubs', key: 'id' },
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'users', key: 'id' },
  },
  role: {
    type: DataTypes.ENUM('member', 'captain', 'admin', 'coach'),
    defaultValue: 'member',
  },
  status: {
    type: DataTypes.ENUM('active', 'pending', 'suspended', 'left'),
    defaultValue: 'active',
  },
  joinedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'club_memberships',
  timestamps: true,
  freezeTableName: true,
  indexes: [
    { unique: true, fields: ['clubId', 'userId'] },
  ],
});

export default ClubMembership;
