const { Category } = require("../models");

exports.getAllCategories = async (req, res, next) => {
  const categories = await Category.findAll();

  req.app.locals.categories = categories;

  next();
};

exports.getCategories = async (req, res, next) => {
  const categories = await Category.findAll();

  res.status(201).json({
    success: true,
    results: {
      categories,
    },
  });
};
