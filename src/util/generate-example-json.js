const Config = require('../config/config');
const VueType = require('../config/vue-type');
const VueTypesLabel = require('../config/vue-type-label');

/**
 * @description Generates an example json based on the comment values and types
 * @param properties
 * @param root
 * @returns {*}
 */
module.exports = function generateExampleJSON(properties, root) {
	properties.forEach(function (property) {
		switch (property.type) {
			case VueTypesLabel[VueType.STRING]:
				root[property.name] = property.placeholder || Config.PLACEHOLDER_STRING;
				break;
			case VueTypesLabel[VueType.BOOL]:
				root[property.name] = property.placeholder || Config.PLACEHOLDER_BOOLEAN;
				break;
			case VueTypesLabel[VueType.NUMBER]:
				root[property.name] = property.placeholder || Config.PLACEHOLDER_NUMBER;
				break;
			case VueTypesLabel[VueType.SHAPE]:
			case VueTypesLabel[VueType.OBJECT_OF]:
				root[property.name] = generateExampleJSON(property.properties, {});
				break;
			case VueTypesLabel[VueType.ARRAY_OF]:
				root[property.name] = [];
				root[property.name].push(generateExampleJSON(property.properties, {}));
				break;
			case VueTypesLabel[VueType.ONE_OF]:
				root[property.name] = property.placeholder || property.properties[0].name;
				break;
			default:
				root[property.name] = 'TODO: ' + property.type;
				break;
		}
	});

	return root;
};