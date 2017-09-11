const Config = require('../config/config');
const config = Config.getConfig();
const commentParser = require('comment-parser');
const _ = require('lodash');

/**
 * @description method to parse the comments and append them to the file
 * @param source
 * @returns {Promise}
 */
module.exports = function parseComments(source) {
	return new Promise((resolve, reject) => {
		// Parse the file to get the comments
		const comments = commentParser(source);

		// Modify the source to include the parsed comments so we can retrieve them later on
		source = _.replace(
			source,
			'export default {',
			`export default {\n\t${config.commentKey}: ${JSON.stringify(comments)},\n`);

		// Return the modified source
		resolve(source);
	});
};