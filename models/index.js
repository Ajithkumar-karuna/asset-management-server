
const { Sequelize } = require('sequelize');
const config = require('../config/database');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  dbConfig
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;


db.Employee = require('./employee.model')(sequelize, Sequelize);
db.Asset = require('./asset.model')(sequelize, Sequelize);
db.Category = require('./category.model')(sequelize, Sequelize);
db.Transaction = require('./transaction.model')(sequelize, Sequelize);


db.Asset.belongsTo(db.Category, {
  foreignKey: 'categoryId',
  as: 'category'
});

db.Asset.belongsTo(db.Employee, {
  foreignKey: 'assignedTo',
  as: 'assignedEmployee'
});

db.Transaction.belongsTo(db.Asset, {
  foreignKey: 'assetId',
  as: 'asset'
});

db.Transaction.belongsTo(db.Employee, {
  foreignKey: 'employeeId',
  as: 'employee'
});

db.Category.hasMany(db.Asset, {
  foreignKey: 'categoryId',
  as: 'assets'
});

db.Employee.hasMany(db.Asset, {
  foreignKey: 'assignedTo',
  as: 'assignedAssets'
});

module.exports = db;