const Config = require('../../config/config');

/**
 * @description Loop through the properties and add the comment key to the property
 * @param properties
 * @param previousCommentKey
 */
function addKeysToProperties(properties, previousCommentKey) {
	Object.keys(properties).forEach((key) => {
		const hasComments = properties[Config.COMMENTS_KEY] !== void 0;
		if (key !== Config.COMMENTS_KEY) {
			let commentKey = key;
			// console.log(Chalk.red('KEY: ' + key));
			// console.log('do we need to restart the namespace?', hasComments)

			// If we have a new comments key that means we reached a new file, so no more nesting!
			if (!hasComments) {
				commentKey = previousCommentKey ? previousCommentKey + '.' + key : key;
			}
			// console.log('namespace: ', commentKey);

			// Add to the object
			properties[key][Config.COMMENT_KEY] = commentKey;
			// Check for child properties
			const childProperties = properties[key].properties;
			// Restart the loop if required
			if (childProperties && Object.keys(childProperties).length) {
				addKeysToProperties(childProperties, commentKey);
			}
		}
	});
}

/**
 * @description Add comment keys to the source so we can find the correct comment
 * @param source
 * @returns {*}
 */
module.exports = function addCommentKeysToSource(source) {
	// Loop through the source and modify it
	addKeysToProperties(source);

	// Return the modified source
	return source;
};
