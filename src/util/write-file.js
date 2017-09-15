const fs = require('fs-extra');
const mkdirp = require('mkdirp');
const path = require('path');
const readFile = require('./read-file');

/**
 * @description Write the content in a provided file
 * @param file
 * @param contents
 * @returns {Promise}
 */
module.exports = function writeFile(file, contents) {
	return readFile(file)
	.catch(() => {
		// check if the file already exists
		return new Promise((resolve, reject) => {
			// Check if the directory exists, otherwise create them recursively
			mkdirp(path.dirname(file), (error) => {
				if (error) {
					reject(`Unable to write file: ${error}`);
				} else {
					// Actually write the file contents
					fs.writeFile(file, contents, (error) => {
						if (error) {
							reject(`Unable to write file: ${error}`);
						} else {
							resolve();
						}
					});
				}
			});
		});
	});
};