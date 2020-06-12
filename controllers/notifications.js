const { Sequelize, QueryTypes, Op } = require("sequelize");

const { Notification, User, Thread } = require("../models");

exports.getNotifications = async (req, res, next) => {
  if (req.isAuthenticated()) {
    let { limit, offset } = req.query;

    [limit, offset] = [limit, offset].map((str, index, arr) => {
      return !isNaN(Number(str, index, arr)) ? Number(str, index, arr) : null;
    });

    const notifications = await Notification.findAndCountAll({
      where: {
        recipient_id: req.user.id,
      },
      limit,
      offset,
      include: [
        {
          model: User,
          required: true,
          where: {
            id: Sequelize.col("Notification.user_id"),
          },
        },
        {
          model: Thread,
          required: true,
        },
      ],
      order: [["id", "DESC"]],
    });

    res.status(201).json({
      status: "success",
      result: {
        notifications: notifications.rows,
        count: notifications.count,
      },
    });
  }
};
