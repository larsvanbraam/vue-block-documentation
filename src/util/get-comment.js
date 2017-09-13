/**
 * @description find a tag in the comments array
 * @param name
 * @param comments
 * @returns {T|*}
 */
module.exports = function getComment(name, type, comments) {

	// if(name === 'link') {
	// 	console.log(`Searching for [${type}] within: [${name}]`);
	// 	console.log(JSON.stringify(comments, null, 4));
	// }
	// console.log(comments);

	const comment = comments.find((comment) => {
		return comment.name === name && comment.type === type;
	});

	// if(name === 'link') {
	// 	console.log('Found comment: ' + (comment !== void 0));
	//
	// 	console.log('-------------------');
	// }

	return comment;
};