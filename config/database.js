const Sequelize = require("sequelize");

const { username, password, database, host, dialect } =
  process.env.node_ENV === "development"
    ? require("./config.json").development
    : require("./config.json").production;

const sequelize = new Sequelize(database, username, password, {
  dialect,
  logging: false,
});

sequelize
  .authenticate()
  .then(() => {
    console.log(
      "Connection between server and database has been successfully established"
        .green.bold
    );
  })
  .catch((err) => {
    console.error(
      "Unable to connect the server to the database: ".white.bgRed.bold,
      err
    );
  });

module.exports = sequelize;
