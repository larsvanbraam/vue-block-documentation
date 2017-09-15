const getFileImports = require('./get-file-imports');
const readFile = require('./fs/read-file');
const transformSource = require('./transform-source');
const writeFile = require('./fs/write-file');
const addCommentsToSource = require('./comment/add-comments-to-source');
const stripFileFromPath = require('./fs/strip-file-from-path');

const path = require('path');
const chalk = require('chalk');
const runSeq = require('sequential-promise');

/**
 * @description Parse the imports of a provided file by transforming the source to es2015 and writing the output to
 * a _temp folder so we can run it with NodeVM
 * @param file
 * @returns {Promise}
 */
module.exports = function parseDependencies(file, sourcePath, tempPath) {
	// Get the imports for the current file
	return getFileImports(file).then((fileImports) => {
		// Loop through all the dependencies
		return runSeq(fileImports.map(fileImport => {
			return () => {
				// Get the full paths and the temp path of the source files
				const fileImportFullPath = path.resolve(sourcePath, `${fileImport}.js`);
				const fileImportTempPath = path.resolve(tempPath, `${fileImport}.js`);
				// Get the full path and the temp path of the dependency file
				const dependencySourcePath = stripFileFromPath(fileImportFullPath);
				const dependencyTempPath = stripFileFromPath(fileImportTempPath);
				// parsing files that already exist is a bit of overhead so skip them!
				return readFile(fileImportTempPath)
				// Run the parser for the imported file to find more dependencies
				.catch(() => parseDependencies(fileImportFullPath, dependencySourcePath, dependencyTempPath))
				// Read the file on the source
				.then(() => readFile(fileImportFullPath))
				// Add the comments to the source
				.then(source => addCommentsToSource(source))
				// Transform the source to ES2015
				.then(source => transformSource(source))
				// Write the parsed content to the temp folder
				.then(source => writeFile(fileImportTempPath, source));
			};
		}));
	});
};