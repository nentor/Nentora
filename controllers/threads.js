const Sequelize = require("sequelize");

const { User, Answer, Thread, Category } = require("../models");

exports.getThreads = async (req, res, next) => {
  let { page } = req.query;
  const { threadsPerPage } = req.session;
  const { isOnUserProfile } = res.locals;

  page = isNaN(page) || page <= 0 ? 1 : parseInt(page);

  let startingIndex = (page - 1) * threadsPerPage; // zero-based indexing
  let username;
  let threads = [];

  if (startingIndex < 0) {
    startingIndex = 0; // page 1 (zero-based indexing)
  }

  if (isOnUserProfile) {
    username = req.session.profileUser.username;

    threads = await Thread.findAndCountAll({
      include: [
        {
          model: User,
          where: {
            username,
          },
        },
        { model: Category },
      ],
      offset: startingIndex,
      limit: threadsPerPage,
      order: [["id", "DESC"]],
    }); // contains rows and count
  } else {
    let where = {};
    let order = [["id", "DESC"]];

    if (req.session.category) {
      where = {
        "$category.name$": req.session.category,
      };
    }

    if (req.session.order === "ASC") {
      order = [["id", req.session.order]];
    }

    threads = await Thread.findAndCountAll({
      where,
      include: [{ model: User }, { model: Category }],
      offset: startingIndex,
      limit: threadsPerPage,
      order,
    }); // contains rows and count
  }

  req.session.page = page;
  req.session.pages = Math.ceil(threads.count / threadsPerPage);

  if (page > req.session.pages) {
    page = req.session.pages;
  }

  res.locals.threads = threads.rows; // contains only the rows

  next();
};

exports.getAnswers = async (req, res, next) => {
  let { page } = req.query;
  const { answersPerPage } = req.session;
  const { isOnUserProfile } = res.locals;

  page = isNaN(page) || page <= 0 ? 1 : parseInt(page);

  let startingIndex = (page - 1) * answersPerPage; // zero-based indexing
  let username;
  let answers = [];

  if (startingIndex < 0) {
    startingIndex = 0; // page 1 (zero-based indexing)
  }

  if (req.params.id) {
    answers = await Answer.findAndCountAll({
      where: {
        thread_id: req.params.id,
      },
      offset: startingIndex,
      limit: answersPerPage,
      order: [["id", "ASC"]],
      include: [{ model: User }, { model: Thread }],
    });

    res.locals.answers = answers.rows;
    req.session.page = page;
    req.session.pages = Math.ceil(answers.count / answersPerPage);
    req.session.answersPerPage = answersPerPage;

    return next();
  }

  if (isOnUserProfile) {
    username = req.session.profileUser.username;

    answers = await Answer.findAndCountAll({
      include: [
        {
          model: User,
          where: {
            username,
          },
        },
        {
          model: Thread,
        },
      ],
      offset: startingIndex,
      limit: answersPerPage,
      order: [["id", "DESC"]],
    }); // contains rows and count

    for (let answer of answers.rows) {
      // a stands for answer
      for (const [index, a] of (await answer.thread.getAnswers()).entries()) {
        if (a.id === answer.id) {
          Object.assign(answer, {
            index: index + 1,
          });
        }
      }
    }
  } else {
    const answers = await Answer.findAndCountAll({
      include: [{ model: User }, { model: Thread }],
      offset: startingIndex,
      limit: answersPerPage,
      // order: ["id", "DESC"],
      order: [["id", "DESC"]],
    }); // contains rows and count
  }
  res.locals.answers = answers.rows; // contains only the rows
  req.session.answersPerPage = answersPerPage;
  req.session.page = page;
  req.session.pages = Math.ceil(answers.count / answersPerPage);

  if (page > req.session.pages) {
    page = req.session.pages;
  }

  console.log("Pages: ", req.session.pages);

  next();
};

exports.getThreadById = async (req, res, next) => {
  const id = req.params.id;

  const thread = await Thread.findByPk(id, {
    include: User,
  });

  if (!thread) {
    return res.render("error404");
  }

  res.locals.thread = thread;

  next();
};

exports.postThread = async (req, res) => {
  const { title, body, category: categoryName } = req.body;

  const category = await Category.findOne({
    where: {
      name: categoryName,
    },
  });

  if (title.length < 5 || body.length < 5) {
    req.flash(
      "warning",
      "The title and the body of your thread must contain at least 5 characters each"
    );
    return res.redirect("/");
  }

  const thread = await Thread.create({
    title,
    body,
    user_id: req.user.id,
    category_id: category.id,
  });

  req.flash("success", "Your thread has been successfully posted");
  res.redirect("/");
};

exports.postEditThread = async (req, res) => {
  const { title, body } = req.body;
  const { id } = req.params;

  try {
    const thread = await Thread.update(
      { title, body },
      {
        where: {
          id,
          user_id: req.user.id,
        },
      }
    ); // returns how many rows were affected (updated)

    if (!thread) {
      throw new Error(
        "Either this thread does not exist or you are not authorized to modify it"
      );
    } else {
      req.flash("success", "You successfully updated this thread");
      res.redirect(`/thread/${id}`);
    }
  } catch (err) {
    req.flash("danger", err.message);
    res.redirect(`/thread/${id}`);
  }
};

exports.postEditAnswer = async (req, res, next) => {
  if (req.isAuthenticated()) {
    const { id, body } = req.body;

    try {
      await Answer.update(
        {
          body,
        },
        {
          where: {
            id,
            user_id: req.user.id,
          },
        }
      );

      const answer = await Answer.findOne({
        where: {
          id,
        },
        include: [{ model: Thread }],
      });

      res.status(201).json({
        status: "success",
        id,
        body,
      });
    } catch (err) {
      req.flash(
        "An error occurred whilst persisting your new changes. You might not be authorized to change that answer"
      );
      res.redirect("/");
    }
  }
};

exports.postAnswer = async (req, res, next) => {
  const { answerBody } = req.body;
  const id = parseInt(req.params.id);
  let { pages, answersPerPage } = req.session;
  let page = req.session.page;

  if (!(answerBody.length > 3)) {
    req.flash("warning", "Your answer must contain at least 3 characters");
    return res.redirect(`/thread/${id}?page=${pages}`);
  }

  const startingIndex = (pages - 1) * answersPerPage; // zero-based indexing

  let answer = await Answer.create({
    body: answerBody,
    user_id: req.user.id,
    thread_id: id,
  });

  answer = await Answer.findOne({
    where: {
      body: answerBody,
      user_id: req.user.id,
      thread_id: id,
    },
  });

  if (!isNaN(startingIndex) && !(startingIndex < 0)) {
    const answersOnLastPage = await Answer.findAll({
      where: {
        thread_id: id,
      },
      offset: startingIndex,
      limit: answersPerPage + 1,
    });

    const count = Object.keys(answersOnLastPage).length;

    if (count > answersPerPage) {
      req.session.pages = ++pages;
    }
  }

  res.redirect(`/thread/${id}?page=${pages}#ans-${answer.id}`);
};
