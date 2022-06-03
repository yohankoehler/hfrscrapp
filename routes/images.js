'use strict';

var express = require('express');
var router = express.Router();
var hfrImages = require('../scripts/hfrimages');
var gallery = require('../scripts/gallery');


router.get('/', function(req, res) {
	var hf = new hfrImages({ page : 'last'});

	hf.getImages(req.params.page).then(function(images){
	 	res.render('imagesInfiniteScroll', images);
	});
});

router.get('/hot', function(req, res) {
	var hf = new hfrImages({ page : 'last'});

	hf.getImages(req.params.page).then(function(images){
	 	res.render('imagesHotInfiniteScroll', images);
	});
});

router.get('/page/:page', function(req, res) {
	var hf = new hfrImages({ page : req.params.page});

	hf.getImages(req.params.page).then(function(images){
	 	res.render('images', images);
	});
});

router.get('/hot/page/:page', function(req, res) {
	var hf = new hfrImages({ page : req.params.page});

	hf.getImages(req.params.page).then(function(images){
		res.render('imagesHotInfiniteScroll', images);
	});
});

router.get('/gallery', function(req, res) {

	console.log('gallery');
	var ga = new gallery({ folder : '/Users/yohan.koehler/Developpement/scrapper/ykr/public/img'});
	//var imgs = ;
	
	res.render('gallery', { imgs : ga.getImages() });
});

module.exports = router;
