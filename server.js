require("dotenv").config({ path: "./config/.env" });

const socket = require("socket.io");
require("express-socket.io-session");
const passportSocketIo = require("passport.socketio");
const app = require("./app");

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log("Server was run successfully");
});

global.socket = socket;
global.io = socket(server);

const socketIoPassportOptions = Object.assign(app.sessionOptions, {
  success: (data, accept) => {
    accept(null, false);
  },
  fail: (data, message, error, accept) => {
    accept(null, false);
  },
});

global.io.use(passportSocketIo.authorize(app.sessionOptions));

global.sessionMap = {};

global.io.on("connection", (socket) => {
  console.log(global.sessionMap);
  if (!global.sessionMap.hasOwnProperty(socket.request.user.id)) {
    global.sessionMap[socket.request.user.id] = socket.id;
  }
});

module.exports = server;
