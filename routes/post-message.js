const express = require('express');

const messagesController = require('../controllers/messages');

const router = express.Router();

router
  .route('/')
  .post(messagesController.postMessage);

module.exports = router;