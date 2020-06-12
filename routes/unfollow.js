const express = require('express');

const followersController = require('../controllers/followers');

const router = express.Router();

router
  .route('/:username')
  .get(followersController.getUnfollowUser);

module.exports = router;
