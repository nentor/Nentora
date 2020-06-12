const profileRoutes = require("./profile");
const homeRoutes = require("./home");
const postThreadRoutes = require("./post-thread");
const postMessageRoutes = require('./post-message');
const getCategoriesRoutes = require('./get-categories');
const changeCategoryRoutes = require('./change-category');
const changeOrderRoutes = require('./change-order');
const threadRoutes = require("./thread");
const followRoutes = require("./follow");
const unfollowRoutes = require("./unfollow");
const getUsersRoutes = require('./get-users');

const express = require("express");

const categoriesConntroller = require("../controllers/categories");
const paginationController = require('../controllers/pagination');
const notificationsController = require('../controllers/notifications');


const router = express.Router();

router.use((req, res, next) => {
  req.session.answersPerPage = 5;
  req.session.threadsPerPage = 5;
  
  res.locals.isOnUserProfile = req.path.includes('profile');

  next();
});

// router.use(categoriesConntroller.getAllCategories);
router.get("/", (req, res) => res.redirect("/index"));
router.use("/index", homeRoutes);
router.use("/post-thread", postThreadRoutes);
router.use('/post-message', postMessageRoutes);
router.use("/profile", profileRoutes);
router.use("/thread", threadRoutes);
router.use("/follow", followRoutes);
router.use("/unfollow", unfollowRoutes);
router.use('/get-users', getUsersRoutes);
router.use('/get-categories', getCategoriesRoutes);
router.use('/get-notifications', notificationsController.getNotifications)
router.use('/change-category', changeCategoryRoutes);
router.use('/change-order', changeOrderRoutes);
router.use((req, res) => res.render("error404"));



module.exports = router;
