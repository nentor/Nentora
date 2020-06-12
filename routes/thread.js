const express = require("express");
const router = express.Router();

const paginationController = require('../controllers/pagination');
const threadsController = require("../controllers/threads");

router
  .route("/:id")
  .get(threadsController.getThreadById)
  .get(threadsController.getAnswers)
  .get(paginationController.getPagination)
  .get((req, res) => res.render('thread'));

router
  .route("/:id/edit-thread")
  .post(threadsController.postEditThread);

router
  .route("/:id/post-answer")
  .post(threadsController.postAnswer);

router
  .route('/:id/edit-answer')
  .post(threadsController.postEditAnswer);

module.exports = router;
