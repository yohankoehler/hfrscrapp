var express = require("express");
var router = express.Router();

/* GET home page. */
express().use("/.netlify/functions/server", router);
router.get("/", function (req, res) {
  res.render("index", { title: "Express" });
});

module.exports = router;
