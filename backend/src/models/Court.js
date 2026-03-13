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
  courtType: {
    type: DataTypes.ENUM('glass_show_court', 'glass_back_wall', 'traditional'),
    defaultValue: 'traditional',
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
