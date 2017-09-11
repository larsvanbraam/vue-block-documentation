const proxyMethods = require('../config/proxy-methods')();

/**
 * @description Some vue methods do not return the required response so we proxy them with these methods!
 * @param source
 * @returns {*}
 */
module.exports = function proxySourceMethods(source) {
	Object.keys(proxyMethods).forEach((key) => {
		const regex = new RegExp(`VueTypes.${key}`, 'g');
		// Get the value
		const method = proxyMethods[key];
		// Replace with the custom shape method
		source = source.replace(regex, key);
		// Merge the source
		source = method + source;
	});
	// return the modified source
	return source;
};