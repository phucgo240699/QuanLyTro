const Sequelize = require("sequelize");

// params: database, username, password
const sequelize = new Sequelize("heroku_fbdd922f5789452", "b25818cb5a5f3a", "ff400693", {
  dialect: "mysql",
  host: "us-cdbr-east-05.cleardb.net"
});

module.exports = sequelize;
