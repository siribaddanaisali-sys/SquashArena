import { DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';

const Club = sequelize.define('Club', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    defaultValue: '',
  },
  city: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  country: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  address: {
    type: DataTypes.STRING,
    defaultValue: '',
  },
  website: {
    type: DataTypes.STRING,
    defaultValue: '',
  },
  contactEmail: {
    type: DataTypes.STRING,
    defaultValue: '',
  },
  contactPhone: {
    type: DataTypes.STRING,
    defaultValue: '',
  },
  logo: {
    type: DataTypes.STRING,
    defaultValue: null,
  },
  memberCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  foundedYear: {
    type: DataTypes.INTEGER,
    defaultValue: null,
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'pending'),
    defaultValue: 'active',
  },
  ownerId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'users', key: 'id' },
  },
}, {
  tableName: 'clubs',
  timestamps: true,
  freezeTableName: true,
});

export default Club;
