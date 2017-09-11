const fs = require('fs-extra');
const _ = require('lodash');
const path = require('path');
const chalk = require('chalk');

const Config = require('./config/config');
const VueTypes = require('./config/vue-types')();

const transformSource = require('./util/transform-source');
const createFolder = require('./util/create-folder');
const parseDependencies = require('./util/parse-dependencies');
const writeFile = require('./util/write-file');
const readFile = require('./util/read-file');
const runSource = require('./util/run-source');
const getDirectories = require('./util/get-directories');
const parseComments = require('./util/parse-comments');

const config = Config.getConfig();
const output = {
	blocks: [],
	enums: [],
};

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

	const comments = {};

	// Load the root file
	return readFile(filePath)
	// Use the source to create a comment object that we can use in building the docs
	.then(source => parseComments(source))
	// Write the transformed source to the temp folder
	.then(source => writeFile(tempFilePath, transformSource(source)))
	// Parse the dependencies for the block
	.then(() => parseDependencies(filePath))
	// Read the temp file and execute it!
	.then(() => readFile(tempFilePath))
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
	});
}

/**
 * @description Parse all the properties for a block
 * @param blockData
 * @param parent
 */
function parseProperties(properties) {
	const allComments = properties[config.commentKey] || {};

	return Object.keys(properties)
	// Filter out the comment key section
	.filter(key => key !== config.commentKey)
	.map((key, index) => {
		const propertyComments = allComments[index] ? allComments[index].tags : [];
		return parseProperty(key, properties[key], propertyComments);
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

	const description = comments.find((comment) => comment.name === 'description');
	const placeholder = comments.find((comment) => comment.name === 'placeholder');

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

function generateExampleJSON(properties, root) {
	properties.forEach(function (property) {
		switch(property.type) {
			case VueTypes.label[VueTypes.STRING]:
				root[property.name] = property.placeholder || config.placeholderValues.string
				break;
			case VueTypes.label[VueTypes.BOOLEAN]:
				root[property.name] = config.placeholderValues.boolean;
				break;
			case VueTypes.label[VueTypes.NUMBER]:
				root[property.name] = config.placeholderValues.boolean;
				break;
			case VueTypes.label[VueTypes.SHAPE]:
			case VueTypes.label[VueTypes.OBJECT_OF]:
				root[property.name] = generateExampleJSON( property.properties, {} );
				break;
			case VueTypes.label[VueTypes.ARRAY_OF]:
				root[property.name] = [];
				root[property.name].push( generateExampleJSON( property.properties, {} ) );
				break;
			case VueTypes.label[VueTypes.ONE_OF]:
				root[property.name] = property.placeholder || property.properties[0].name;
				break;
			default:
				root[property.name] = 'TODO: ' + property.type;
				break;
		}
	});

	return root;
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
	// Create a _temp folder for outputting the generated parsed js files
	return createFolder(config.tempFolder)
	// Parse all the blocks
	.then(() => Promise.all(blockDirectories.map(directory => parseBlockDirectory(directory, settings))))
	// Creat the documentation folder
	.then(() => createFolder(outputDirectory))
	.then(() => fs.writeJson(`${outputDirectory}/${config.outputJsonFile}`, output))
	.then(() => fs.copy(
		`${templateDirectory}/${config.outputIndexFile}`,
		`${outputDirectory}/${config.outputIndexFile}`
	));
};
