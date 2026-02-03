// backend/models/asset.model.js
module.exports = (sequelize, DataTypes) => {
  const Asset = sequelize.define('Asset', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    assetId: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false
    },
    serialNumber: {
      type: DataTypes.STRING(100),
      unique: true,
      allowNull: false
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'categories',
        key: 'id'
      }
    },
    make: {
      type: DataTypes.STRING(100)
    },
    model: {
      type: DataTypes.STRING(100)
    },
    description: {
      type: DataTypes.TEXT
    },
    purchaseDate: {
      type: DataTypes.DATE
    },
    purchasePrice: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00
    },
    branch: {
      type: DataTypes.STRING(100)
    },
    status: {
      type: DataTypes.ENUM('available', 'assigned', 'repair', 'scrapped'),
      defaultValue: 'available'
    },
    assignedTo: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'employees',
        key: 'id'
      }
    },
    assignedDate: {
      type: DataTypes.DATE
    }
  }, {
    tableName: 'assets',
    timestamps: true
  });

  return Asset;
};