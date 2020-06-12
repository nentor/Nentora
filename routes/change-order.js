const express = require('express');

const changeOrder = require('../middleware/changeOrder');

const router = express.Router();

router
  .route('/')
  .post(changeOrder);

module.exports = router;