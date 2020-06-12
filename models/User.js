const crypto = require("crypto");
const fs = require("fs");
const util = require("util");
const ejs = require("ejs");
const path = require("path");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");

const absolutePath = require("../helpers/absolutePath");

const { Model, Op } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static async getUserInstance(...credentials) {
      try {
        const user = await User.findOne({
          where: credentials,
          attributes: { exclude: ["password"] },
        });
        return user;
      } catch (err) {
        throw err;
      }
    }

    static async register(...credentials) {
      const { username, email } = credentials[0];

      let user = {};

      try {
        user = await User.getUserInstance({
          [Op.or]: [{ username }, { email }],
        });
      } catch (err) {
        user = null;
      }

      if (user) {
        if (user.username === username) {
          throw new Error("This username already exists");
        }

        if (user.email === email) {
          throw new Error("This email address is already registered");
        }
      }

      try {
        const salt = await bcrypt.genSalt(generateSaltRounds());
        const hash = await bcrypt.hash(credentials[0].password, salt);

        const renderFile = util.promisify(ejs.renderFile);
        const randomBytes = util.promisify(crypto.randomBytes);

        const bytes = await randomBytes(64);
        const key = bytes.toString("hex");

        credentials[0].password = hash;

        // const newUser = await User.create(credentials);
        const newUser = User.build(...credentials);
        newUser.key = key;

        await newUser.save();

        const transporter = nodemailer.createTransport({
          service: "gmail",
          port: 587,
          secure: false, // true for 465, false for other ports
          auth: {
            user: "pentakillmaybe@gmail.com",
            pass: "123123123h",
          },
        });

        const mailOptions = {
          from: "pentakillmaybe@gmail.com",
          to: `${newUser.email}`,
          subject: "Nentora Account Verification",
          html: await renderFile(
            path.join(
              absolutePath,
              "views",
              "emails",
              "confirmation-email.ejs"
            ),
            { key }
          ),
        };

        transporter.sendMail(mailOptions, (err, data) => {
          if (err) {
            console.log("Error Occurs:", err);
          } else {
            console.log("Email sent!!!");
          }
        });

        return newUser;
      } catch (err) {
        throw err;
      }
    }

    async uploadAvatar(avatarPath) {
      try {
        const avatar = avatarPath.split("/avatars/")[1];
        this.set("avatar", avatar);

        await this.save();
      } catch (err) {
        throw err;
      }
    }

    async verify() {
      this.active = true;

      await this.save();
    }
  }

  User.init(
    {
      id: {
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      username: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      active: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      joined: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      key: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      avatar: {
        type: DataTypes.TEXT,
        defaultValue: "default.jpg",
      },
      selfDescription: {
        type: DataTypes.STRING,
        defaultValue: null,
        allowNull: true,
      },
      follower_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      timestamps: false,
      name: { singular: "user", plural: "users" },
    }
  );

  User.associate = function (models) {
    // User associations
    User.hasMany(models.Thread, { foreignKey: "user_id" });
    User.hasMany(models.Answer, { foreignKey: "user_id" });
    User.hasMany(models.Follower, { foreignKey: "user_id" });
    User.hasMany(models.Message, { as: "sender", foreignKey: "sender_id" });
    User.hasMany(models.Message, {
      as: "recipient",
      foreignKey: "recipient_id",
    });
    User.hasMany(models.MessageAnswer, { foreignKey: "user_id" });
    User.hasMany(models.Notification, { foreignKey: "user_id" });
  };

  return User;
};

function generateSaltRounds() {
  return Math.sin(Math.random()) * 10;
}
