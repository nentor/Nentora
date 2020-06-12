const express = require("express");

// Controllers
const threadsController = require("../controllers/threads");
const categoriesController = require('../controllers/categories');
const paginationController = require('../controllers/pagination');
const notificationsController = require("../controllers/notifications");
// Instantiate a router
const router = express.Router();


router
  .route('/')
  .get(categoriesController.getAllCategories)
  .get(threadsController.getThreads)
  .get(paginationController.getPagination)
  .get((req, res) => res.render("index"));

module.exports = router;
