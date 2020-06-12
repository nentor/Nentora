module.exports = changeOrder = (req, res, next) => {
  const { order } = req.body;

  if (order === "Ascending") {
    req.session.order = "ASC";
  } else {
    req.session.order = "DESC";
  }

  next();
};
