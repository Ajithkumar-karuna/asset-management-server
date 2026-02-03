module.exports = {
  development: {
    username: 'root',
    password: '123456789',
    database: 'asset_management',
    host: 'localhost',
    dialect: 'mysql',
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  },
 
};