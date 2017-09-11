const settingsFile = '.blockdocumentation';

const userSettings = require('user-settings').file(settingsFile);
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const _ = require('lodash');

const defaultSettings = {
	input: './block',
	output: './documentation',
	file: '{BlockName}Data.js',
};

exports.getSettings = function (overrides = {}, ignoreLocalSettings = false, ignoreTemplateSettings = false) {
	const localSettings = ignoreLocalSettings ? {} : this.getLocalSettings();
	const settings = Object.assign({}, defaultSettings, this.getUserSettings(), localSettings, overrides);
	return settings;
};

exports.resetSettings = function () {
	Object.keys(defaultSettings).forEach(key => userSettings.unset(key));
};

exports.setGlobalSettings = function (settings) {
	Object.keys(settings).forEach(key => userSettings.set(key, settings[key]));
};

exports.setLocalSettings = function (settings) {
	fs.writeFileSync(path.resolve(settingsFile), JSON.stringify(settings, null, 2));
};

exports.hasLocalSettings = function (settingsPath = '.') {
	return fs.existsSync(path.join(settingsPath, settingsFile));
};

exports.getLocalSettings = function (settingsPath = '.') {
	if (this.hasLocalSettings(settingsPath)) {
		const fileContent = fs.readFileSync(path.join(settingsPath, settingsFile), { encoding: 'utf-8' });

		let settings;

		try {
			settings = JSON.parse(fileContent);
		} catch (e) {
			console.error(chalk.red(`Error parsing local ${settingsFile} file.`));
			process.exit(1);
		}

		if (settings.variables) {
			const defaultVariable = {
				type: 'input'
			};

			settings.variables = settings.variables.map((variable) => _.merge({}, defaultVariable, variable));
		}

		return settings;
	}

	return {};
};

exports.getUserSettings = function () {
	return Object.keys(defaultSettings).reduce((settings, key) => {
		const setting = userSettings.get(key);

		if (setting) {
			settings[key] = setting;
		}

		return settings;
	}, {});
};

exports.logSettings = function (settings, indent = 0) {
	const indentation = '  '.repeat(indent);

	Object.keys(settings).forEach((key) => {
		if (typeof settings[key] == 'object' && settings[key] !== null) {
			console.log(`${indentation}${chalk.bold(key)}:`);
			this.logSettings(settings[key], indent + 1);
		}
		else {
			console.log(`${indentation}${chalk.bold(key)}: '${settings[key]}'`);
		}
	});
};