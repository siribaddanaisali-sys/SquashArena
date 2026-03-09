import { DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';

const PlayerCoach = sequelize.define('PlayerCoach', {
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
  coachId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'coaches', key: 'id' },
  },
  startDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  endDate: {
    type: DataTypes.DATE,
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active',
  },
}, {
  tableName: 'player_coaches',
  timestamps: true,
});

export default PlayerCoach;
