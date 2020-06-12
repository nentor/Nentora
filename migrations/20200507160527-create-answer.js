"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    // This is for MySQL
    queryInterface.sequelize.query("SET FOREIGN_KEY_CHECKS = 0");

    return queryInterface.createTable("Answers", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      body: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      thread_id: {
        type: Sequelize.INTEGER,
        onDelete: "CASCADE",
        references: {
          model: "Threads",
          key: "id",
        },
      },
      user_id: {
        type: Sequelize.INTEGER,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("Answers");
  },
};
