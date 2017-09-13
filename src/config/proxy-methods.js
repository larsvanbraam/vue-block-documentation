const VueTypes = require('./vue-types')();

module.exports = function getProxyMethods() {
	return {
		[VueTypes.SHAPE]: 'const shape = object => Object.assign(VueTypes.shape(object), { properties: object }); \n',
		[VueTypes.OBJECT_OF]: 'const objectOf = object => Object.assign(VueTypes.objectOf(object), { properties: object }); \n',
		[VueTypes.ONE_OF]: 'const oneOf = array => Object.assign(VueTypes.oneOf(array), { properties: array }); \n',
	};
};
