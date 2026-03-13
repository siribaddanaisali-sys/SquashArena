import { DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';

const TournamentRegistration = sequelize.define('TournamentRegistration', {
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
  playerId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'players', key: 'id' },
  },
  seedNumber: {
    type: DataTypes.INTEGER,
    defaultValue: null,
  },
  status: {
    type: DataTypes.ENUM('registered', 'confirmed', 'withdrawn', 'eliminated', 'champion'),
    defaultValue: 'registered',
  },
  registeredAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'tournament_registrations',
  timestamps: true,
  freezeTableName: true,
  indexes: [
    {
      unique: true,
      fields: ['tournamentId', 'playerId'],
    },
  ],
});

export default TournamentRegistration;
