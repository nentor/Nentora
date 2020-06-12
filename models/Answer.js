const { Model } = require("sequelize");
const moment = require("moment");

module.exports = (sequelize, DataTypes) => {
  class Answer extends Model {}

  Answer.init(
    {
      id: {
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      body: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      thread_id: {
        type: DataTypes.INTEGER,
      },
      user_id: {
        type: DataTypes.INTEGER,
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        get() {
          return moment(this.getDataValue("createdAt")).format(
            "DD/MM/YYYY h:mm:ss"
          );
        },
      },
      updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        get() {
          return moment(this.getDataValue("updatedAt")).format(
            "DD/MM/YYYY h:mm:ss"
          );
        },
      },
    },
    { sequelize, name: { singular: "answer", plural: "answers" } }
  );

  Answer.associate = function (models) {
    // Answer associations
    Answer.belongsTo(models.User, { foreignKey: "user_id" });
    Answer.belongsTo(models.Thread, { foreignKey: "thread_id" });
    // Answer.belongsTo(models.Notification, {
    //   foreignKey: "answer_id",
    // });
  };
  return Answer;
};
