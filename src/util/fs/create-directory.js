const fs = require('fs-extra');

/**
 * @description Create a folder on a provided path
 * @param folder
 * @returns {Promise.<T>}
 */
module.exports = function createDirectory(folder) {
	return new Promise((resolve, reject) => {
		fs.ensureDir(folder)
		.then(resolve)
		.catch((reason => reject('Unable to create folder')));
	});
};