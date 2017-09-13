const VueTypes = require('../config/vue-types')();

/**
 * @description Generates an example json based on the comment values and types
 * @param properties
 * @param root
 * @returns {*}
 */
module.exports = function generateExampleJSON(properties, root) {
	properties.forEach(function (property) {
		switch (property.type) {
			case VueTypes.label[VueTypes.STRING]:
				root[property.name] = property.placeholder || config.placeholderValues.string;
				break;
			case VueTypes.label[VueTypes.BOOLEAN]:
				root[property.name] = config.placeholderValues.boolean;
				break;
			case VueTypes.label[VueTypes.NUMBER]:
				root[property.name] = config.placeholderValues.boolean;
				break;
			case VueTypes.label[VueTypes.SHAPE]:
			case VueTypes.label[VueTypes.OBJECT_OF]:
				root[property.name] = generateExampleJSON(property.properties, {});
				break;
			case VueTypes.label[VueTypes.ARRAY_OF]:
				root[property.name] = [];
				root[property.name].push(generateExampleJSON(property.properties, {}));
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
};