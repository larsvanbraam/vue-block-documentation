const Config = require('../config/config');
const getFileImports = require('./get-file-imports');
const readFile = require('./read-file');
const transformSource = require('./transform-source');
const writeFile = require('./write-file');
const parseComments = require('./parse-comments');

const path = require('path');
const fs = require('fs-extra');

const config = Config.getConfig();

/**
 * @description Parse the imports of a provided file by transforming the source to es2015 and writing the output to
 * a _temp folder so we can run it with NodeVM
 * @param file
 * @returns {Promise}
 */
module.exports = function parseDependencies(file) {
	return new Promise((resolve, reject) => {
		// Get the imports for the current file
		getFileImports(file).then((fileImports) => {
			// Loop through all the dependencies
			Promise.all(fileImports.map(fileImport => {
				// Build the temp file path for the transformed source
				const tempFilePath = `${path.resolve(config.tempFolder, config.settings.input)}/${fileImport}.js`;
				// Get the absolute path
				const absolutePath = path.resolve(file, `../${fileImport}.js`);
				// Read the file on the source
				return readFile(absolutePath)
				// Parse the comments
				.then(source => parseComments(source))
				// Transform the source to ES2015
				.then(source => transformSource(source))
				// Write the parsed content to the temp folder
				.then(source => writeFile(tempFilePath, source));
			}));
		})
		.then(() => resolve())
		.catch(reason => reject(`Unable to parse the dependencies reason: ${reason}`));
	});
};