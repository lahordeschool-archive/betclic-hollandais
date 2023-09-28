// Import dependencies
require('dotenv').config();
const http = require('http');
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const session = require("express-session");
const createError = require("http-errors");
const fs = require("fs");
const compression = require("compression"); 
const rfs = require("rotating-file-stream");
const helmet = require("helmet");
const { emitter } = require("./lib/emitter");
const i18n = require('i18n');
const lang = require('./lib/lang');
const flash = require('connect-flash');

const app = express();
app.use(flash());

// Import lib
const { connect, createStore } = require('./lib/database');

// Require all models dynamically
fs.readdirSync(path.join(__dirname, 'models')).forEach((file) => {
  require(path.join(__dirname, 'models', file));
});


const port = process.env.SERVER_PORT || 4000; // Default port is 3000 if PORT env variable is not set
app.set("port", port);

const server = http.createServer(app);
const io = require('socket.io')(server);

i18n.configure({
  locales: ['en', 'fr'],
  defaultLocale: 'en',
  queryParameter: 'lang',
  cookie: 'lang',
  updateFiles: false,
  directory: __dirname + '/locales',
  objectNotation: true
});
app.use(i18n.init);

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(compression());
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", 'https://cdn.jsdelivr.net', 'https://cdnjs.cloudflare.com', 'https://fonts.googleapis.com', "'unsafe-inline'"],
      fontSrc: ["'self'", 'https://fonts.googleapis.com', 'https://cdnjs.cloudflare.com', 'https://fonts.gstatic.com', 'https://cdn.jsdelivr.net', "'unsafe-inline'"],
      scriptSrc: ["'self'", 'https://cdnjs.cloudflare.com','https://ajax.googleapis.com', "blob:" , "'unsafe-inline'", "'unsafe-eval'"],
      workerSrc: ["blob:"]
    }
  }
}));
app.use(lang);

// Set up logging
const logDirectory = path.join(__dirname, 'logs');
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);
const accessLogStream = rfs.createStream('access.log', {
  interval: '1d', // rotate daily
  path: logDirectory
});
app.use(logger("combined", { stream: accessLogStream }));

connect()
  .then(() => {
    console.log('Connected to MongoDB');

  })
  .catch((err) => {
    console.error('Error connecting to MongoDB', err);
  });

app.use(
  session({
    secret: process.env.MONGODB_SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: createStore(),
  })
);


const { passport } = require('./lib/auth');
app.use(passport.initialize());
app.use(passport.session());

app.set("views", path.join(__dirname, "views"));

// Define the modules folder path
const modulesFolder = path.join(__dirname, "modules");

// Recursively read the contents of the modules folder
const readModulesFolder = (folderPath) => {
  fs.readdirSync(folderPath).forEach((file) => {
    const filePath = path.join(folderPath, file);
    if (folderPath.endsWith("public")) {
      app.use(express.static(folderPath));
      
    } else if (file.endsWith(".listener.js") && folderPath.endsWith("listeners")) {
      // If the file ends with '.listener.js' and its parent folder is listeners, load the listener module
      require(filePath);
    }
    else if (file.endsWith(".router.js") && folderPath.endsWith("routes")) {
      // If the file ends with '.router.js' and its parent folder is routes, load the router module
      const routerName = path.basename(file, ".router.js");
      const router = require(filePath)(io);
      if (routerName === "homepage") {
        app.use("/", router);
      } else {
        app.use(`/${routerName}`, router);
      }
    } else if (folderPath.endsWith("views")) {
      // If the file is a view, add its parent folder to the view engine's search path
      app.set("views", [...app.get("views"), folderPath]);
    } else if (fs.statSync(filePath).isDirectory()) {
      // If the file is a directory, recurse into it
      readModulesFolder(filePath);
    }
  });
};
readModulesFolder(modulesFolder);

// view engine setup
app.set("view engine", "pug");

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});


module.exports = { app, server, io };
