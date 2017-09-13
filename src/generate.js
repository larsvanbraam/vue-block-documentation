const fs = require('fs-extra');
const _ = require('lodash');
const path = require('path');
const chalk = require('chalk');
const progress = require('cli-progress');

const Config = require('./config/config');
const VueTypes = require('./config/vue-types')();

const transformSource = require('./util/transform-source');
const createFolder = require('./util/create-folder');
const parseDependencies = require('./util/parse-dependencies');
const writeFile = require('./util/write-file');
const readFile = require('./util/read-file');
const runSource = require('./util/run-source');
const getDirectories = require('./util/get-directories');
const addCommentsToSource = require('./util/add-comments-to-source');
const generateExampleJSON = require('./util/generate-example-json');
const getComment = require('./util/get-comment');

const config = Config.getConfig();
const output = {
	blocks: [],
	enums: [],
};

let progressBar = new progress.Bar({
	format: 'Parsing blocks: [{bar}] {percentage}% | {value}/{total}',
	stopOnComplete: true,
});

/**
 * @description Parse the provided block directory
 * @param blockDirectory
 * @param settings
 * @returns {Promise.<TResult>}
 */
function parseBlockDirectory(blockDirectory, settings) {
	const fileName = _.replace(settings.file, config.replaceableBlockName, blockDirectory);
	const filePath = path.resolve(`${config.settings.input}/${blockDirectory}/${fileName}`);
	const tempFilePath = `${path.resolve(config.tempFolder, config.settings.input)}/${fileName}`;

	// Load the root file
	return readFile(filePath)
	// Add the inline comments to the source so we can use them later on
	.then(source => addCommentsToSource(source))
	// Write the transformed source to the temp folder
	.then(source => writeFile(tempFilePath, transformSource(source)))
	// Parse the dependencies for the block
	.then(() => parseDependencies(filePath))
	// Read the temp file contents
	.then(() => readFile(tempFilePath))
	// Run the parsed temp file
	.then((source) => {
		// Execute the source in a sandbox
		const executedSource = runSource(source, tempFilePath).default;
		const properties = parseProperties(executedSource);

		// Start the parsing of the properties
		output.blocks.push({
			name: blockDirectory,
			properties: properties,
			example: JSON.stringify({
				id: blockDirectory,
				data: generateExampleJSON(properties, {})
			}, null, 4)
		});

		// Update the progress bar
		if (config.enableProgressBar) {
			progressBar.increment();
		}
	});
}

/**
 * @description Parse all the properties for a block
 * @param blockData
 * @param parent
 */
function parseProperties(properties) {
	const commentProperty = properties[config.commentKey];
	let comments = [];

	if(commentProperty !== void 0 && commentProperty.length) {
		comments = commentProperty[0].tags;
	}

	return Object.keys(properties)
	// Filter out the ignored properties
	.filter((key, index) => {
		const shouldKeep = getComment(key, 'ignore', comments) === void 0;

		// Skip ignored properties and the config key
		return shouldKeep && key !== config.commentKey;
	})
	// Parse the properties
	.map((key, index) => {
		return parseProperty(key, properties[key], comments);
	});
}

/**
 * @description Parse the data for a key
 * @param key
 * @param data
 * @param parent
 */
function parseProperty(key, data, comments) {
	const type = data[config.typeLabel];
	let childProperties = {};

	switch (type) {
		case VueTypes.SHAPE:
		case VueTypes.OBJECT_OF:
			childProperties = data.properties;
			break;
		case VueTypes.ONE_OF:
			data.properties.forEach(property => {
				childProperties[property] = {
					[config.typeLabel]: typeof property,
				};
			});
			break;
	}

	const description = getComment(key,  'description', comments);
	const placeholder = getComment(key, 'placeholder', comments);
	console.log('ParseProperty', key, 'children', Object.keys(childProperties).length);

	return {
		name: key,
		type: VueTypes.label[type],
		required: data.required || false,
		defaultValue: typeof data.default === 'string' && data.default !== '' ? data.default : '-',
		description: description ? description.description : '-',
		placeholder: placeholder ? placeholder.description : '-',
		properties: parseProperties(childProperties)
	};
}

/**
 * @description Method that actually generates the documentation
 * @param settings
 * @returns {Promise}
 */
module.exports = function generate(settings) {
	// Write the settings to the config object
	Config.setSettings(settings);
	// Get the blocks
	const blockDirectories = getDirectories(path.resolve(settings.input));
	const outputDirectory = path.resolve(`${settings.output}/`);
	const templateDirectory = path.resolve(__dirname, config.localTemplateDirectory);

	// Star the progress bar
	if (config.enableProgressBar) {
		progressBar.start(blockDirectories.length, 0);
	}

	// Create a _temp folder for outputting the generated parsed js files
	return createFolder(config.tempFolder)
	// Parse all the blocks
	.then(() => Promise.all(blockDirectories.map(directory => parseBlockDirectory(directory, settings))))
	// Create the documentation folder
	.then(() => createFolder(outputDirectory))
	// Write the output json to the documentation folder
	.then(() => fs.writeJson(`${outputDirectory}/${config.outputJsonFile}`, output))
	// Copy the output template to the documentation folder
	.then(() => fs.copy(
		`${templateDirectory}/${config.outputIndexFile}`,
		`${outputDirectory}/${config.outputIndexFile}`
	))
	// Empty the temp folder
	// .then(() => fs.emptyDirSync(config.tempFolder))
	// Remove the temp folder
	// .then(() => fs.rmdir(config.tempFolder))
};
