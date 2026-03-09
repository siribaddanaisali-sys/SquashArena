import { DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';

const Match = sequelize.define('Match', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  tournamentId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'tournaments', key: 'id' },
  },
  player1Id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'players', key: 'id' },
  },
  player2Id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'players', key: 'id' },
  },
  winnerId: {
    type: DataTypes.UUID,
    defaultValue: null,
  },
  score: {
    type: DataTypes.JSON,
    defaultValue: { games: [] },
  },
  status: {
    type: DataTypes.ENUM('scheduled', 'ongoing', 'completed', 'cancelled'),
    defaultValue: 'scheduled',
  },
  scheduledTime: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  courtId: {
    type: DataTypes.UUID,
    defaultValue: null,
  },
  roundNumber: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
}, {
  tableName: 'matches',
  timestamps: true,
});

export default Match;
