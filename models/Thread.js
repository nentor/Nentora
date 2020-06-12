const { Model } = require("sequelize");
const sequelize = require("../config/database");
const moment = require("moment");

const Notification = sequelize.import("Notification");

module.exports = (sequelize, DataTypes) => {
  class Thread extends Model {}

  Thread.init(
    {
      id: {
        primaryKey: true,
        type: DataTypes.INTEGER,
        autoIncrement: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      body: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.INTEGER,
        references: {
          model: "Users",
          key: "id",
        },
      },
      category_id: {
        type: DataTypes.INTEGER,
      },
      createdAt: {
        type: DataTypes.DATE,
        get() {
          return moment(this.getDataValue("createdAt")).format(
            "DD/MM/YYYY h:mm:ss"
          );
        },
      },
      updatedAt: {
        type: DataTypes.DATE,
        get() {
          return moment(this.getDataValue("updatedAt")).format(
            "DD/MM/YYYY h:mm:ss"
          );
        },
      },
    },
    { sequelize, name: { singular: "thread", plural: "threads" } }
  );

  Thread.associate = function (models) {
    // Thread associations
    Thread.hasMany(models.Answer, { foreignKey: "thread_id" });
    Thread.hasMany(models.Notification, { foreignKey: "thread_id" });
    Thread.belongsTo(models.Category, { foreignKey: "category_id" });
    Thread.belongsTo(models.User, { foreignKey: "user_id" });
  };

  Thread.afterSave(async (thread) => {
    // console.log(thread);

    const notification = await Notification.createNotification(
      "thread",
      thread.user_id,
      thread.id
    );
  });

  return Thread;
};
