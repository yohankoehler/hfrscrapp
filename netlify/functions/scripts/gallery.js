'use strict';

const testFolder = './tests/';
const fs = require('fs');

//constructor
function Gallery(params) {
	//this.currentPage = params.page || 'last';
	this.folder = params.folder;
}

Gallery.prototype = {

	getImages: function() {

		let folder = this.folder;
		let imgs = [];

		fs.readdir(folder, (err, files) => {
			files.forEach(file => {
				console.log(file);

				imgs.push(file);
			});
		})

		return imgs;
	}

};


module.exports = Gallery;