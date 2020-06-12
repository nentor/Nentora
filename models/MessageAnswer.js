const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class MessageAnswer extends Model {}

  MessageAnswer.init(
    {
      id: {
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      message_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.INTEGER,
      },
      body: {
        type: DataTypes.TEXT,
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
      updatedAt: {
        type: DataTypes.DATE,
        get() {
          return moment(this.getDataValue("updatedAt")).format(
            "DD/MM/YYYY h:mm:ss"
          );
        },
      },
    },
    {
      sequelize,
      name: { singular: "message_answer", plural: "message_answers" },
    }
  );

  MessageAnswer.associate = function (models) {
    // MessageAnswer associations
    MessageAnswer.belongsTo(models.Message, {
      foreignKey: "message_id",
    });
    MessageAnswer.belongsTo(models.User, { foreignKey: "user_id" });
  };
  return MessageAnswer;
};
