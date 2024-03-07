var express = require("express");
var path = require("path");
var favicon = require("serve-favicon");
var logger = require("morgan");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var exphbs = require("express-handlebars");

var routes = require("./routes/index");
var users = require("./routes/user");
var images = require("./routes/images");
var port = 8080;
// var host = "0.0.0.0";

var app = express();

// view engine setup

app.engine(
  "handlebars",
  exphbs({
    defaultLayout: "main",
    partialsDir: ["views/partials/"],
  })
);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "handlebars");

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

app.use(express.static(path.join(__dirname, "public")));
app.use("/", routes);
app.use("/users", users);
app.use("/images", images);

app.use("/scripts", express.static(__dirname + "/node_modules/"));

/// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error("Not Found");
  err.status = 404;
  next(err);
});

/// error handlers

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

app.listen(process.env.PORT || port);
// console.log(`server listen to ${process.env.PORT || port}`);

// var open = require("open");
// open(`http://${host}:${process.env.PORT || port}/images`);
