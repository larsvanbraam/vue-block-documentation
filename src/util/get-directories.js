const fs = require('fs-extra');

/**
 * @description Read all the folder within a provided path
 * @param path
 * @returns Array<string>>
 */
module.exports = function getDirectories(path) {
	return fs.readdirSync(path).filter(function (file) {
		return fs.statSync(path + '/' + file).isDirectory();
	});
};