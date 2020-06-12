const path = require("path");
const util = require("util");
const fs = require("fs");
const absolutePath = require("../helpers/absolutePath");

const Sequelize = require("sequelize");

const rmFile = util.promisify(fs.unlink);

const { User } = require("../models");

exports.postUploadAvatar = async (req, res, next) => {
  const avatar = req.files.avatar;
  const avatarName = avatar.name;
  const avatarPath = path.join(
    absolutePath,
    "resources",
    "images",
    "avatars",
    req.user.username
  );

  await avatar.mv(path.join(avatarPath, avatarName), (err) => {
    if (err) {
      console.error(err);
    }
  });

  fs.readdir(avatarPath, (err, files) => {
    if (err) {
      console.log(err);
    }

    files.forEach((file) => {
      const fileDir = path.join(avatarPath, file);

      if (file !== avatarName) {
        rmFile(fileDir);
      }
    });
  });

  const user = await User.findOne({
    where: {
      username: req.user.username,
    },
  });

  await user.uploadAvatar(path.join(avatarPath, avatarName));

  req.flash("success", "You successfully changed your avatar");
  res.redirect("/profile");
};

exports.postAddDescription = async (req, res, next) => {
  const description = req.body.description;

  const user = await User.findOne({
    where: {
      username: req.user.username,
    },
  });

  try {
    user.selfDescription = description;
    await user.save();
    req.flash("success", "You have successfully changed your description");
  } catch (err) {
    req.flash(
      "danger",
      "Description is way too long. Please provide a shorter one"
    );
    res.redirect("/profile");
  }

  res.redirect("/profile");
};

exports.getUserProfile = (active) => async (req, res, next) => {
  const { username } = req.params;

  if (!username && req.isAuthenticated()) {
    return res.redirect(`/profile/${req.user.username}`);
  }

  res.locals.active = active;

  req.session.profileUser = await User.findOne({
    where: {
      username,
    },
  });

  if (!req.session.profileUser) {
    return res.render("error404.ejs");
  }

  next();
};

exports.getUsers = async (req, res) => {
  const { query } = req.body;

  const users = await User.findAll({
    where: {
      username: Sequelize.where(
        Sequelize.fn("LOWER", Sequelize.col("username")),
        "LIKE",
        "%" + query + "%"
      ),
    },
  });

  const results = [];

  users.forEach((user) => {
    results.push({
      name: user.username,
      avatar: user.avatar,
      description: user.selfDescription,
    });
  });

  res.status(201).json({
    status: "success",
    body: {
      results,
    },
  });
};
