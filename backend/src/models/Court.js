import { DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';

const Court = sequelize.define('Court', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  venueId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'venues', key: 'id' },
  },
  courtNumber: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  courtName: {
    type: DataTypes.STRING,
  },
  status: {
    type: DataTypes.ENUM('available', 'occupied', 'maintenance'),
    defaultValue: 'available',
  },
}, {
  tableName: 'courts',
  timestamps: true,
  freezeTableName: true,
});

export default Court;
