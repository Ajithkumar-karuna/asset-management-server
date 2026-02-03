// backend/models/transaction.model.js
module.exports = (sequelize, DataTypes) => {
  const Transaction = sequelize.define('Transaction', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    assetId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'assets',
        key: 'id'
      }
    },
    employeeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'employees',
        key: 'id'
      }
    },
    type: {
      type: DataTypes.ENUM('issue', 'return', 'scrap'),
      allowNull: false
    },
    transactionDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    remarks: {
      type: DataTypes.TEXT
    },
    reason: {
      type: DataTypes.STRING(200)
    }
  }, {
    tableName: 'transactions',
    timestamps: true
  });

  return Transaction;
};