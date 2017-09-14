/**
 * @description find a tag in the comments array
 * @param name
 * @param comments
 * @returns {T|*}
 */
module.exports = function getComment(name, type, comments) {
	return comments.find((comment) => {
		return comment.name === name && comment.type === type;
	});
};