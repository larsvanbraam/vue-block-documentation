const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const progress = require('cli-progress');
const Config = require('./config/config');
const VueType = require('./config/vue-type');
const VueTypeLabel = require('./config/vue-type-label');

const sequentialPromises = require('./util/sequential-promises');
const transformSource = require('./util/transform-source');
const createDirectory = require('./util/fs/create-directory');
const parseDependencies = require('./util/parse-dependencies');
const writeFile = require('./util/fs/write-file');
const readFile = require('./util/fs/read-file');
const runSource = require('./util/run-source');
const getDirectories = require('./util/fs/get-directories');
const addCommentsToSource = require('./util/comment/add-comments-to-source');
const generateExampleJSON = require('./util/generate-example-json');
const getComment = require('./util/comment/get-comment');
const addCommentKeysToSource = require('./util/comment/add-comment-keys-to-source');

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
	const fileName = blockDirectory + 'Data.js';
	const sourcePath = path.resolve(`${settings.input}/${blockDirectory}`);
	const sourceFile = `${sourcePath}/${fileName}`;
	const tempPath = `${path.resolve(Config.OUTPUT_TEMP_FOLDER, settings.input)}/${blockDirectory}`;
	const tempFile = `${tempPath}/${fileName}`;

	// if(blockDirectory !== 'ArticleTeaser') throw new Error('stop');

	// Load the root file
	return readFile(sourceFile)
	// Add the inline comments to the source so we can use them later on
	.then(source => addCommentsToSource(source))
	// Write the transformed source to the temp folder
	.then(source => writeFile(tempFile, transformSource(source)))
	// Parse the dependencies for the block
	.then(() => parseDependencies(sourceFile, sourcePath, tempPath))
	// Read the temp file contents
	.then(() => readFile(tempFile))
	// Execute the source in a sandbox
	.then(source => runSource(source, tempFile))
	// Add the nested comment key to all the source so we can retrieve the comments later on!
	.then(executedSource => addCommentKeysToSource(executedSource))
	// Run the parsed temp file
	.then(executedSource => {
		// Get the root level comments
		let comments = executedSource[Config.COMMENTS_KEY] || [];

		// Get the tags level
		comments = comments.length ? comments[0].tags : [];

		// Parse all the properties
		const properties = parseProperties(executedSource, comments);

		// Start the parsing of the properties
		output.blocks.push({
			name: blockDirectory,
			properties: properties,
			example: JSON.stringify({
				id: blockDirectory,
				data: generateExampleJSON(properties, {}),
			}, null, 4),
		});

		// Update the progress bar
		if (Config.ENABLE_PROGRESS_BAR) {
			progressBar.increment();
		}
	})
	.catch(reason => {
		progressBar.stop();
		// Re-throw the error to notify about the failure
		return Promise.reject(`${fileName} → ${reason}`);
	});
}

/**
 * @description Parse all the properties for a block
 * @param blockData
 * @param parent
 */
function parseProperties(properties, comments) {
	return Object.keys(properties)
	// Filter out the ignored properties
	.filter((key, index) => {
		const name = properties[key][Config.COMMENT_KEY];
		const shouldKeep = getComment(name, 'ignore', comments) === void 0;

		// Skip ignored properties and the config key
		return shouldKeep && key !== Config.COMMENTS_KEY;
	})
	// Parse the properties
	.map((key, index) => parseProperty(key, properties[key], comments));
}

/**
 * @description Parse the data for a key
 * @param key
 * @param data
 * @param parent
 */
function parseProperty(key, data, comments) {
	const type = data[Config.VUE_TYPES_NAME_KEY];
	const name = data[Config.COMMENT_KEY];
	let childProperties = {};

	switch (type) {
		case VueType.ARRAY_OF:
			if(data.properties.properties) {
				delete data.properties.properties[Config.COMMENT_KEY];
				childProperties = data.properties.properties
			}else {
				childProperties = data.properties;
			}
			break;
		case VueType.SHAPE:
		case VueType.OBJECT_OF:
			childProperties = data.properties;
			break;
		case VueType.ONE_OF:
			data.properties.forEach(property => {
				childProperties[property] = {
					[Config.VUE_TYPES_NAME_KEY]: typeof property,
				};
			});
			break;
	}

	const description = getComment(name, 'description', comments);
	const placeholder = getComment(name, 'placeholder', comments);

	// Check if the child has it's own comments, if so use them instead of the parents comments
	if (
		Object.keys(childProperties).length &&
		childProperties[Config.COMMENTS_KEY] !== void 0 &&
		childProperties[Config.COMMENTS_KEY].length > 0
	) {
		comments = childProperties[Config.COMMENTS_KEY][0].tags;
	}

	return {
		name: key,
		type: VueTypeLabel[type],
		required: data.required || false,
		description: description ? description.description : '-',
		placeholder: placeholder ? placeholder.description : null,
		properties: parseProperties(childProperties, comments)
	};
}

/**
 * @description Remove the temp folder
 */
function removeTempFolder() {
	// Empty the dir first
	fs.emptyDirSync(Config.OUTPUT_TEMP_FOLDER);
	// Remove the dir
	fs.rmdir(Config.OUTPUT_TEMP_FOLDER);
}

/**
 * @description Method that actually generates the documentation
 * @param settings
 * @returns {Promise}
 */
module.exports = function generate(settings) {
	const blockFolder = path.resolve(settings.input);

	// Check if the block folder actually exists!
	if (fs.existsSync(blockFolder)) {
		// Get the blocks
		const blockDirectories = getDirectories(path.resolve(settings.input));
		const outputDirectory = path.resolve(`${settings.output}/`);
		const templateDirectory = path.resolve(__dirname, Config.LOCAL_TEMPLATE_FOLDER);

		// Star the progress bar
		if (Config.ENABLE_PROGRESS_BAR) {
			progressBar.start(blockDirectories.length, 0);
		}

		// Create a _temp folder for outputting the generated parsed js files
		return createDirectory(Config.OUTPUT_TEMP_FOLDER)
		.then(() => sequentialPromises(blockDirectories.map((directory, index) =>
			() => parseBlockDirectory(directory, settings))))
		// Create the documentation folder
		.then(() => createDirectory(outputDirectory))
		// Write the output json to the documentation folder
		.then(() => fs.writeJson(`${outputDirectory}/${Config.OUTPUT_JSON_FILE}`, output))
		// Copy the output template to the documentation folder
		.then(() => fs.copy(
			`${templateDirectory}/${Config.OUTPUT_INDEX_FILE}`,
			`${outputDirectory}/${Config.OUTPUT_INDEX_FILE}`
		))
		// Empty the temp folder
		.then(() => fs.emptyDirSync(Config.OUTPUT_TEMP_FOLDER))
		// Remove the temp folder
		.then(() => fs.rmdir(Config.OUTPUT_TEMP_FOLDER))
		.catch(reason => {
			// Catch failure and remove the temp data
			removeTempFolder();
			// Re-throw the error
			return Promise.reject(reason);
		})
	} else {
		return Promise.reject(`The provided input folder(${settings.input}) does not exist!`);
	}
};
