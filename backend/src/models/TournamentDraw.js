import { DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';

const TournamentDraw = sequelize.define('TournamentDraw', {
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
  drawType: {
    type: DataTypes.ENUM('single_elimination', 'double_elimination', 'round_robin', 'group_stage'),
    defaultValue: 'single_elimination',
  },
  totalRounds: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  bracketData: {
    type: DataTypes.JSON,
    defaultValue: { rounds: [] },
    get() {
      const val = this.getDataValue('bracketData');
      if (typeof val === 'string') {
        try { return JSON.parse(val); } catch { return { rounds: [] }; }
      }
      return val || { rounds: [] };
    },
  },
  status: {
    type: DataTypes.ENUM('draft', 'published', 'in_progress', 'completed'),
    defaultValue: 'draft',
  },
  generatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'tournament_draws',
  timestamps: true,
  freezeTableName: true,
});

export default TournamentDraw;
