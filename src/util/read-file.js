const fs = require('fs-extra');

/**
 * @description Read a file and
 * @param path
 * @returns {Promise<T>}
 */
module.exports = function readFile(path) {
	return new Promise((resolve, reject) => {
		fs.readFile(path, { encoding: 'utf8' })
		.then(content => resolve(content))
		.catch(reason => reject(`Unable to read file, ${reason}`));
	});
};