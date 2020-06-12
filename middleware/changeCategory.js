module.exports = changeCategory = (req, res, next) => {
  const { category } = req.body;

  if (category === "All") {
    req.session.category = null;
  } else {
    req.session.category = category;
  }

  next();
};
