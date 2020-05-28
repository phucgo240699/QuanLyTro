const Sequelize = require("sequelize");

const sequelize = require("../utils/database");

const Users = sequelize.define("users", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  username: {
    type: Sequelize.STRING,
    allowNull: false
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false
  },
  isAdmin: {
    type: Sequelize.BOOLEAN,
    allowNull: false
  }
});

module.exports = Users;
