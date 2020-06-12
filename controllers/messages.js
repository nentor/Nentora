const { Op, Sequelize } = require("sequelize");

const { Message, MessageAnswer, User } = require("../models");

exports.getMessages = async (req, res, next) => {
  let { page } = req.query;
  page = isNaN(page) || page <= 0 ? 1 : parseInt(page);

  if (page > req.session.pages) {
    page = req.session.pages;
  }

  const messages = await Message.findAndCountAll({
    where: {
      [Op.or]: [{ recipient_id: req.user.id }, { sender_id: req.user.id }],
    },
    include: [
      {
        model: User,
        required: true,
        as: "sender",
      },
      {
        model: User,
        required: true,
        as: "recipient",
      },
    ],
    order: Sequelize.literal("id DESC"),
  });
  // console.log(await messages.rows[0].getUser());

  req.session.page = page;
  req.session.pages = Math.ceil(messages.count / 5);
  res.locals.messages = messages.rows;

  next();
};

exports.getMessageById = async (req, res, next) => {
  const { id } = req.params;

  const message = await Message.findOne({
    where: {
      id,
      [Op.or]: [{ recipient_id: req.user.id }, { sender_id: req.user.id }],
    },
    include: [
      {
        model: User,
        required: true,
        as: "sender",
      },
      {
        model: User,
        required: true,
        as: "recipient",
      },
    ],
  });

  if (!message) {
    req.flash("warning", "The message you are trying to access does not exist");
    return res.redirect("/profile");
  }

  res.locals.message = message;

  next();
};

exports.postMessage = async (req, res, next) => {
  const { title, body } = req.body;
  const { profileUser } = req.session;

  const message = await Message.create({
    title,
    body,
    sender_id: req.user.id,
    recipient_id: profileUser.id,
  });

  req.flash(
    "success",
    `You successfully sent a message to ${profileUser.username}`
  );
  res.redirect(`/profile/${req.user.username}/messages`);
};

exports.getMessageAnswers = async (req, res, next) => {
  let { page } = req.query;
  page = isNaN(page) || page <= 0 ? 1 : parseInt(page);

  if (page > req.session.pages) {
    page = req.session.pages;
  }

  let startingIndex = (page - 1) * 5; // zero-based indexing

  if (startingIndex < 0) {
    startingIndex = 0; // page 1 (zero-based indexing)
  }

  const message = res.locals.message;

  const messageAnswers = await MessageAnswer.findAndCountAll({
    where: {
      message_id: message.id,
    },
    offset: startingIndex,
    limit: 5,
    order: [["id", "DESC"]],
    include: [{ model: User }],
  });

  req.session.page = page;
  req.session.pages = Math.ceil(messageAnswers.count / 5);
  res.locals.messageAnswers = messageAnswers.rows;

  next();
};

exports.postMessageAnswer = async (req, res, next) => {
  const { id } = req.params;
  const { messageAnswerBody } = req.body;

  console.log(id);
  console.log(messageAnswerBody);

  const messageAnswer = await MessageAnswer.create({
    message_id: id,
    user_id: req.user.id,
    body: messageAnswerBody,
  });

  res.redirect(`/profile/${req.user.username}/message/${id}`);
};
