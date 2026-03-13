import { DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';

const Discipline = sequelize.define('Discipline', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  playerId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'players', key: 'id' },
  },
  issuedBy: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'users', key: 'id' },
  },
  type: {
    type: DataTypes.ENUM('warning', 'yellow_card', 'red_card', 'suspension', 'ban'),
    allowNull: false,
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  tournamentId: {
    type: DataTypes.UUID,
    defaultValue: null,
    references: { model: 'tournaments', key: 'id' },
  },
  matchId: {
    type: DataTypes.UUID,
    defaultValue: null,
    references: { model: 'matches', key: 'id' },
  },
  startDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  endDate: {
    type: DataTypes.DATE,
    defaultValue: null,
  },
  status: {
    type: DataTypes.ENUM('active', 'expired', 'appealed', 'overturned'),
    defaultValue: 'active',
  },
}, {
  tableName: 'disciplines',
  timestamps: true,
  freezeTableName: true,
});

export default Discipline;
