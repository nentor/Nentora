const { Model } = require("sequelize");
const moment = require("moment");

module.exports = (sequelize, DataTypes) => {
  class Message extends Model {}

  Message.init(
    {
      id: {
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      title: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      body: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      sender_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      recipient_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        get() {
          return moment(this.getDataValue("createdAt")).format(
            "DD/MM/YYYY h:mm:ss"
          );
        },
      },
    },
    { sequelize, name: { singular: "message", plural: "messages" } }
  );

  Message.associate = function (models) {
    // Message associations
    Message.hasMany(models.MessageAnswer, {
      foreignKey: "message_id",
    });

    Message.belongsTo(models.User, { as: "sender", foreignKey: "sender_id" });
    Message.belongsTo(models.User, {
      as: "recipient",
      foreignKey: "recipient_id",
    });
    // Message.belongsTo(models.Notification, {
    //   foreignKey: "message_id",
    // });
  };
  return Message;
};
