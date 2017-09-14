const getFileImports = require('./get-file-imports');
const readFile = require('./read-file');
const transformSource = require('./transform-source');
const writeFile = require('./write-file');
const addCommentsToSource = require('./add-comments-to-source');
const stripFileFromUrl = require('./strip-file-from-url');

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
	// console.log('------------');
	// console.log('Parse dependencies');
	// console.log('file: ' + chalk.yellow(file));
	// console.log('sourceLocation: ' + chalk.cyan(sourcePath));
	// console.log('tempLocation: ' + chalk.cyan(tempPath));

	// Get the imports for the current file
	return getFileImports(file).then((fileImports) => {
		// console.log('Files to be parsed:  \n' + JSON.stringify(fileImports, null, 4));

		// Loop through all the dependencies
		return runSeq(fileImports.map(fileImport => {
			return () => {
				const fileImportFullPath = path.resolve(sourcePath, `${fileImport}.js`);
				const fileImportTempPath = path.resolve(tempPath, `${fileImport}.js`);

				// console.log('Parsing file import');
				// console.log('- full path' + fileImportFullPath );
				// console.log('- temp path' + fileImportTempPath );

				const dependencySourcePath = stripFileFromUrl(fileImportFullPath);
				const dependencyTempPath = stripFileFromUrl(fileImportTempPath);

				// Run the parser for the imported file to find more dependencies
				return parseDependencies(fileImportFullPath, dependencySourcePath, dependencyTempPath)
				// Read the file on the source
				.then(() => readFile(fileImportFullPath))
				// Add the comments to the source
				.then(source => addCommentsToSource(source))
				// Transform the source to ES2015
				.then(source => transformSource(source))
				// Write the parsed content to the temp folder
				.then(source => writeFile(fileImportTempPath, source))
			};
		}));
	});
};