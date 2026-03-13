import { DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';

const PlayerEloHistory = sequelize.define('PlayerEloHistory', {
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
  matchId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'matches', key: 'id' },
  },
  oldRating: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  newRating: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  ratingChange: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  opponentId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  opponentRating: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  result: {
    type: DataTypes.ENUM('win', 'loss'),
    allowNull: false,
  },
}, {
  tableName: 'player_elo_history',
  timestamps: true,
  freezeTableName: true,
});

export default PlayerEloHistory;
