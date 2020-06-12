const express = require('express');

const changeCategory = require('../middleware/changeCategory');

const router = express.Router();

router
  .route('/')
  .post(changeCategory);

module.exports = router;