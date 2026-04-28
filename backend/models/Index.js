
const { sequelize } = require('../config/database');
const User = require('./User');
const Task = require('./Task');


const db = {
  sequelize,
  User,
  Task
};

module.exports = db;