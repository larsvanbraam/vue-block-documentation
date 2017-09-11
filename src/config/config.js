const config = {
	typeLabel: '_vueTypes_name',
	commentKey: '__comments',
	outputJsonFile: 'data.json',
	outputIndexFile: 'index.html',
	tempFolder: './_temp',
	localTemplateDirectory: '../template',
	replaceableBlockName: '{BlockName}',
	placeholderValues: {
		string: 'Lorem ipsum dolor sit amet',
		boolean: true,
		number: 1
	}
};

exports.getConfig = function () {
	return config;
};

exports.setSettings = function (settings) {
	return config.settings = settings;
};

