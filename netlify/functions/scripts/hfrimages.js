'use strict';

var Q = require('q');
var x = require('x-ray')();

function onlyUnique(value, index, self) {
	return self.indexOf(value) === index;
}

function onlyUniqueObject(value, index, self) {
	return self.indexOf(value) === index;
}

//constructor
function HFRImages(params) {
	this.currentPage = params.page || 'last';
}

HFRImages.prototype = {

	getLastPage: function() {
		var deferred = Q.defer();
		var that = this;
		x('http://forum.hardware.fr/hfr/Discussions/Loisirs/images-etonnantes-cons-sujet_78667_1.htm', {
			pages: ['.fondForum2PagesHaut .left a']
		})(function(err, obj) {
			that.currentPage = parseInt(obj.pages[obj.pages.length - 1]);
			deferred.resolve(obj.pages[obj.pages.length - 1]);
		});

		return deferred.promise;
	},

	getPage: function() {
		var deferred = Q.defer();
		var that = this;

		if (that.currentPage === 'last') {
			x('http://forum.hardware.fr/hfr/Discussions/Loisirs/images-etonnantes-cons-sujet_78667_1.htm', {
				pages: ['.fondForum2PagesHaut .left a']
			})(function(err, obj) {
				that.currentPage = parseInt(obj.pages[obj.pages.length - 1]);
				deferred.resolve(obj.pages[obj.pages.length - 1]);
			});
		} else {
			deferred.resolve(that.currentPage);
		}

		return deferred.promise;
	},

	getImages: function() {
		var that = this;
		var deferred = Q.defer();

		var url;

		this.getPage().then(function() {
			url = 'http://forum.hardware.fr/hfr/Discussions/Loisirs/images-etonnantes-cons-sujet_78667_' + that.currentPage + '.htm';

			x(url, {
				posts: x('.messagetable', [{
					href: '.message .right a@href',
					images: ['img@src'],
					imagesHot: ['table.spoiler img@src']
				}]),
			})(function(err, obj) {
				var myobj = that.getObj(obj);

				if (myobj.imagesObj.length === 0) {
					that.currentPage = parseInt(that.currentPage) - 1;
					that.getImages().then(function(images) {
						deferred.resolve(images);
					});
				} else {
					deferred.resolve(myobj);
				}
			});

		});

		return deferred.promise;
	},

	getObj: function(obj) {

		var that = this;
		var imagesRes = [];
		var imagesColl = [];
		var imgObj;
		var imagesHot = [];

		var postsLength = obj.posts.length;
		for (var i = 0; i < postsLength; ++i) {
			if (obj.posts[i].href && obj.posts[i].images) {
				var o = obj.posts[i];

				var blacklisted = [
					'forum-images.hardware.fr',
					'forum.hardware.fr',
					'hit.xiti'
				];

				var regex = new RegExp(blacklisted.join('|'), 'i');

				var imgLength = o.images.length;
				for (var j = 0; j < imgLength; ++j) {
					var img = o.images[j];
					if (!regex.test(img)) {
						imagesRes.push(img);

						imgObj = {
							src: img,
							postHref: o.href,
							page: that.currentPage
						};

						if (o.imagesHot) {
							if (o.imagesHot.indexOf(o.images[j]) !== -1) {
								imgObj.spoiler = true;
								imagesHot.push(imgObj);
							}
						}
						imagesColl.push(imgObj);
					}
				}
			}
		}

		return {
			imagesHot: imagesHot.reverse(),
			images: imagesRes.filter(onlyUnique).reverse(),
			imagesObj: imagesColl.reverse(),
			page: that.currentPage,
			pagePrev: parseInt(that.currentPage) - 1,
			pageNext: parseInt(that.currentPage) + 1
		};
	}
};


module.exports = HFRImages;
