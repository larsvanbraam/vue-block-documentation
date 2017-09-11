// All available vue types
const vueType = {
	'ANY': 'any',
	'ARRAY': 'array',
	'BOOL': 'bool',
	'FUNC': 'func',
	'NUMBER': 'number',
	'INTEGER': 'integer',
	'OBJECT': 'object',
	'STRING': 'string',
	'INSTANCE_OF': 'instanceOf',
	'ONE_OF': 'oneOf',
	'ONE_OF_TYPE': 'oneOfType',
	'ARRAY_OF': 'arrayOf',
	'OBJECT_OF': 'objectOf',
	'SHAPE': 'shape',
};

// Some vue types have weird names so we create custom labels for them!
const vueTypeLabels = {
	[vueType.ANY]: 'any',
	[vueType.ARRAY]: 'array',
	[vueType.BOOL]: 'boolean',
	[vueType.FUNC]: 'function',
	[vueType.NUMBER]: 'number',
	[vueType.INTEGER]: 'integer',
	[vueType.OBJECT]: 'object',
	[vueType.STRING]: 'string',
	[vueType.INSTANCE_OF]: 'instanceOf',
	[vueType.ONE_OF]: 'oneOf',
	[vueType.ONE_OF_TYPE]: 'oneOfType',
	[vueType.ARRAY_OF]: 'array',
	[vueType.OBJECT_OF]: 'object',
	[vueType.SHAPE]: 'object',
};

/**
 * @description get all the available vue types
 * @returns {{}}
 */
module.exports = function VueTypes() {
	return Object.assign(vueType, {
		label: vueTypeLabels,
	});
};