const express = require("express");
const router = express.Router();

const paginationController = require('../controllers/pagination');
const usersController = require("../controllers/users");
const followersController = require("../controllers/followers");
const threadsController = require("../controllers/threads");
const messagesController = require('../controllers/messages');

const isLoggedIn = require('../middleware/isLoggedIn');

router
  .route('/')
  .get(isLoggedIn)
  .get(usersController.getUserProfile());

router
  .route("/:username")
  .get(isLoggedIn)
  .get(usersController.getUserProfile("profile"))
  .get(followersController.getIsFollowingUser)
  .get((req, res) => res.render("profile"));

router
  .route("/:username/messages")
  .get(isLoggedIn)
  .get(usersController.getUserProfile('messages'))
  .get(messagesController.getMessages)
  .get(paginationController.getPagination)
  .get((req, res) => res.render('profile'));

router
  .route('/:username/message/:id')
  .get(isLoggedIn)
  .get(usersController.getUserProfile('messages'))
  .get(messagesController.getMessageById)
  .get(messagesController.getMessageAnswers)
  .get(paginationController.getPagination)
  .get((req, res) => res.render('message'));

router
  .route('/:username/message/:id/post-message-answer')
  .post(isLoggedIn)
  .post(messagesController.postMessageAnswer);

router
  .route("/:username/threads")
  .get(isLoggedIn)
  .get(usersController.getUserProfile("threads"))
  .get(followersController.getIsFollowingUser)
  .get(threadsController.getThreads)
  .get(paginationController.getPagination)
  .get((req, res) => res.render("profile"));

router
  .route("/:username/answers")
  .get(isLoggedIn)
  .get(usersController.getUserProfile("answers"))
  .get(followersController.getIsFollowingUser)
  .get(threadsController.getAnswers)
  .get(paginationController.getPagination)
  .get((req, res) => res.render("profile"));

router
  .route("/upload-avatar")
  .get(isLoggedIn)
  .get((req, res) => res.redirect("/profile"));

router
  .route("/upload-avatar")
  .post(isLoggedIn)
  .post(usersController.postUploadAvatar);

router
  .route("/add-description")
  .post(isLoggedIn)
  .post(usersController.postAddDescription);

module.exports = router;
