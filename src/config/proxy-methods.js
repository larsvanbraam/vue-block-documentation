const VueType = require('./vue-type');

module.exports = Object.freeze({
	[VueType.SHAPE]: 'const shape = object => Object.assign(VueTypes.shape(object), { properties: object }); \n',
	[VueType.OBJECT_OF]: 'const objectOf = object => Object.assign(VueTypes.objectOf(object), { properties: object }); \n',
	[VueType.ONE_OF]: 'const oneOf = array => Object.assign(VueTypes.oneOf(array), { properties: array }); \n',
	[VueType.ARRAY_OF]: 'const arrayOf = object => Object.assign(VueTypes.arrayOf(object), { properties: object }); \n',
});