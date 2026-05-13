"use strict";
var path = require("path");

var express = require("express");
var router = express.Router();
var hfrImages = require("../scripts/hfrimages");
var gallery = require("../scripts/gallery");

express().use(express.static(path.join(__dirname, "public")));
express().use("/.netlify/functions/server", router);

router.get("/", async function (req, res) {
  try {
    var hf = new hfrImages({ page: "last" });
    var images = await hf.getImages();
    res.render("imagesInfiniteScroll", images);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erreur: " + err.message);
  }
});

router.get("/hot", async function (req, res) {
  try {
    var hf = new hfrImages({ page: "last" });
    var images = await hf.getImages();
    res.render("imagesHotInfiniteScroll", images);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erreur lors du chargement des images");
  }
});

router.get("/page/:page", async function (req, res) {
  try {
    var hf = new hfrImages({ page: req.params.page });
    var images = await hf.getImages();
    res.render("images", images);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erreur lors du chargement des images");
  }
});

router.get("/hot/page/:page", async function (req, res) {
  try {
    var hf = new hfrImages({ page: req.params.page });
    var images = await hf.getImages();
    res.render("imagesHotInfiniteScroll", images);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erreur lors du chargement des images");
  }
});

router.get("/gallery", function (req, res) {
  console.log("gallery");
  var ga = new gallery({
    folder: "/Users/yohan.koehler/Developpement/scrapper/ykr/public/img",
  });

  res.render("gallery", { imgs: ga.getImages() });
});

module.exports = router;
