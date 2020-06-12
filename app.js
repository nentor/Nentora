// Node-provided modules
const path = require("path");

// My Utility Modules
const absolutePath = require("./helpers/absolutePath");

// Third Party Modules
require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const bodyParser = require("body-parser");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const flash = require("connect-flash");
const morgan = require("morgan");
const ejsLayouts = require("express-ejs-layouts");
const fileUpload = require("express-fileupload");
const sanitizeHtml = require("sanitize-html");
const colors = require("colors");

const database = require("./config/database");

const SequelizeStore = require("connect-session-sequelize")(session.Store);

const routes = require("./routes/routes");
const app = express();

app.use(helmet());
app.use(cors());

app.set("views", path.join(absolutePath, "views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(absolutePath, "resources")));

app.use(ejsLayouts);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(
  fileUpload({
    createParentPath: true,
  })
);

const dbStore = new SequelizeStore({
  db: database,
  checkExpirationInterval: 15 * 60 * 1000,
  tableName: "sessions",
});

app.sessionOptions = {
  secret: "secret",
  store: dbStore,
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false,
    maxAge: 1000 * 60 * 60 * 24 * 30 * 5,
  },
};

app.use(session(app.sessionOptions));
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

dbStore.sync({ alter: true });

app.use(flash());

// Passport.js auth middleware
app.use(passport.initialize());
app.use(passport.session());

app.use(async (req, res, next) => {
  res.locals.req = req;
  res.locals.sanitizeHtml = sanitizeHtml;

  next();
});

// This deals with the authentication part
// as well as the routing related to it
// specifically the register and login routes
require("./config/auth")(app, passport);

app.use(routes);

app.use((err, req, res, next) => {
  res.status(500).send("An error occurred while performing this action");
});

module.exports = app;
