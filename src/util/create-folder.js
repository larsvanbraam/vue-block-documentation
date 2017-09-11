const fs = require('fs-extra');

/**
 * @description Create a temp folder for outputting the parsed js files
 * @param folder
 * @returns {Promise.<T>}
 */
module.exports = function createFolder(folder) {
	return new Promise((resolve, reject) => {
		fs.ensureDir(folder).then(resolve).catch((reason => reject('Unable to create folder')));
	});
};