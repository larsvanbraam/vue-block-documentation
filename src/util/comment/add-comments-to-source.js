const Config = require('../../config/config');
const commentParser = require('comment-parser');
const _ = require('lodash');

/**
 * @description method to parse the comments and append them to the file
 * @param source
 * @returns {Promise}
 */
module.exports = function addCommentsToSource(source) {
	// Check if the file has the same line { style!
	const found = source.match(/export default {/i);

	if (found) {
		const comments = commentParser(source, {
			dotted_names: false,
		});

		// Modify the source to include the parsed comments so we can retrieve them later on
		return Promise.resolve(_.replace(
			source,
			'export default {',
			`export default {\n\t${Config.COMMENTS_KEY}: ${JSON.stringify(comments)},\n`)
		);
	} else {
		return Promise.reject('Incorrect export default format, should be: "export default {"');
	}
};