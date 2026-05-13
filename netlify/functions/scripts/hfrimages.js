'use strict';

const { chromium } = require('playwright');

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

		const browser = await chromium.launch();
		try {
			const page = await browser.newPage();
			await page.goto(FIRST_PAGE_URL);
			const pages = await page.$$eval('.fondForum2PagesHaut .left a', els => els.map(el => el.textContent.trim()));
			this.currentPage = parseInt(pages[pages.length - 1]);
			return this.currentPage;
		} finally {
			await browser.close();
		}
	},

	getImages: async function () {
		await this.getPage();

		const url = BASE_URL + this.currentPage + '.htm';

		const browser = await chromium.launch();
		try {
			const page = await browser.newPage();
			await page.goto(url);

			const posts = await page.$$eval('.messagetable', rows => rows.map(row => ({
				href: row.querySelector('.message .right a') ? row.querySelector('.message .right a').getAttribute('href') : null,
				images: Array.from(row.querySelectorAll('img')).map(img => img.getAttribute('src')),
				imagesHot: Array.from(row.querySelectorAll('table.spoiler img')).map(img => img.getAttribute('src'))
			})));

			const result = this.getObj({ posts });

			if (result.imagesObj.length === 0) {
				this.currentPage = parseInt(this.currentPage) - 1;
				return this.getImages();
			}

			return result;
		} finally {
			await browser.close();
		}
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
