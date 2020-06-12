const express = require("express");

// Controllers
const categoriesController = require('../controllers/categories');
const threadsController = require("../controllers/threads");

const router = express.Router();

router
  .route('')
  .get(categoriesController.getAllCategories)
  .get((req, res) => res.render("post-thread"));
  
router
  .route('')
  .post(threadsController.postThread);

module.exports = router;
