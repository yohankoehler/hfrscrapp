'use strict';

const fetch = require('node-fetch');
const cheerio = require('cheerio');

const BASE_URL = 'http://forum.hardware.fr/hfr/Discussions/Loisirs/images-etonnantes-cons-sujet_78667_';
const FIRST_PAGE_URL = BASE_URL + '1.htm';

const BLACKLIST_RE = /forum-images\.hardware\.fr|forum\.hardware\.fr|hit\.xiti/i;

function onlyUnique(value, index, self) {
	return self.indexOf(value) === index;
}

function HFRImages(params) {
	this.currentPage = params.page || 'last';
}

HFRImages.prototype = {

	getPage: async function () {
		if (this.currentPage !== 'last') {
			return this.currentPage;
		}

		const res = await fetch(FIRST_PAGE_URL);
		const html = await res.text();
		const $ = cheerio.load(html);
		const pageLinks = $('.fondForum2PagesHaut .left a');
		const lastPage = parseInt($(pageLinks[pageLinks.length - 1]).text().trim());
		this.currentPage = lastPage;
		return lastPage;
	},

	getImages: async function () {
		await this.getPage();

		const url = BASE_URL + this.currentPage + '.htm';
		const res = await fetch(url);
		const html = await res.text();
		const $ = cheerio.load(html);

		const posts = [];
		$('.messagetable').each((_, row) => {
			const href = $(row).find('.message .right a').attr('href') || null;
			const images = $(row).find('img').map((_, el) => $(el).attr('src')).get();
			const imagesHot = $(row).find('table.spoiler img').map((_, el) => $(el).attr('src')).get();
			posts.push({ href, images, imagesHot });
		});

		const result = this.getObj({ posts });

		if (result.imagesObj.length === 0) {
			this.currentPage = parseInt(this.currentPage) - 1;
			return this.getImages();
		}

		return result;
	},

	getObj: function (obj) {
		const that = this;
		const imagesRes = [];
		const imagesColl = [];
		const imagesHot = [];

		for (const post of obj.posts) {
			if (!post.href || !post.images) continue;

			for (const img of post.images) {
				if (!img || BLACKLIST_RE.test(img)) continue;

				imagesRes.push(img);

				const imgObj = {
					src: img,
					postHref: post.href,
					page: that.currentPage
				};

				if (post.imagesHot && post.imagesHot.indexOf(img) !== -1) {
					imgObj.spoiler = true;
					imagesHot.push(imgObj);
				}

				imagesColl.push(imgObj);
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
