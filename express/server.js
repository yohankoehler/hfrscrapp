var express = require("express");
var path = require("path");
var favicon = require("serve-favicon");
var logger = require("morgan");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var exphbs = require("express-handlebars");
const serverless = require("serverless-http");

var routes = require("../routes/index");
var images = require("../routes/images");

var app = express();

// view engine setup

app.engine(
  "handlebars",
  exphbs({
    defaultLayout: "main",
    partialsDir: [path.join(__dirname, "../views/partials")],
  })
);

app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "../views"));

var env = process.env.NODE_ENV || "development";
app.locals.ENV = env;
app.locals.ENV_DEVELOPMENT = env == "development";

// app.use(favicon(__dirname + '/public/img/favicon.ico'));
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "../public")));
app.use("/scripts", express.static(path.join(__dirname, "../node_modules/")));
app.use("/", routes);
app.use("/images", images);

/// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// development error handler
// will print stacktrace
if (app.get("env") === "development") {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render("error", {
      message: err.message,
      error: err,
      title: "error",
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.render("error", {
    message: err.message,
    error: {},
    title: "error",
  });
});

module.exports = app;
module.exports.handler = serverless(app);
