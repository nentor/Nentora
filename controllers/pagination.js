exports.getPagination = async (req, res, next) => {
  let page = req.session.page;
  let pages = req.session.pages;

  let min = 1;
  let max = !(pages > 7) ? pages : 7;

  res.locals.prevPage = page - 1 < pages && page - 1 !== 0 ? page - 1 : page;
  res.locals.nextPage = page + 1 > pages ? page : page + 1;

  if (page > 3 && pages >= 7) {
    min = page - 3;
    max = page + 3 > pages ? pages : page + 3;

    switch (page) {
      case pages:
        min = page - 6;
        break;
      case pages - 1:
        min = page - 5;
        break;
      case pages - 2:
        min = page - 4;
        break;
    }
  }

  res.locals.min = min;
  res.locals.max = max;

  next();
};
