const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Notification extends Model {
    static async createNotification(type, userId, postId) {
      const { User, Follower, Thread } = require("./index");

      User.hasMany(Notification, { foreignKey: "user_id" });
      Notification.belongsTo(User, { foreignKey: "user_id" });

      Thread.hasMany(Notification, { foreignKey: "thread_id" });
      Notification.belongsTo(Thread, { foreignKey: "thread_id" });

      const followers = await Follower.findAll({
        where: {
          user_id: userId,
        },
      });

      if (type !== "thread" && type !== "answer" && type !== "message") {
        throw new Error("Invalid type");
      }

      for (let follower of followers) {
        await Notification.create({
          type,
          user_id: userId,
          recipient_id: follower.follower_id,
          [`${type}_id`]: postId,
        });

        const notification = await Notification.findOne({
          where: {
            type,
            user_id: userId,
            recipient_id: follower.follower_id,
          },
          include: [
            {
              model: User,
              required: true,
            },
            {
              model: Thread,
              required: true,
            },
          ],
          order: [["id", "DESC"]],
        });

        console.log(notification);

        const user = notification.user;
        const thread = notification.thread;

        if (global.sessionMap.hasOwnProperty(follower.follower_id)) {
          global.io.emit("notification", { notification, user, thread });
        }
      }
    }
  }

  Notification.init(
    {
      id: {
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      type: {
        type: DataTypes.ENUM("thread", "answer", "message"),
        allowNull: false,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      recipient_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      thread_id: {
        type: DataTypes.INTEGER,
      },
      answer_id: {
        type: DataTypes.INTEGER,
      },
      message_id: {
        type: DataTypes.INTEGER,
      },
    },
    {
      sequelize,
      timestamps: false,
      name: { singular: "notification", plural: "notifications" },
    }
  );

  Notification.associate = function (models) {
    // Notification associations
    Notification.belongsTo(models.Thread, { foreignKey: "thread_id" });
    Notification.belongsTo(models.User, { foreignKey: "user_id" });
  };

  return Notification;
};
