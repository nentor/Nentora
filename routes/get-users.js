const express = require('express');
const router = express.Router();

const usersController = require('../controllers/users');

router
  .route('/')
  .post(usersController.getUsers);

module.exports = router;