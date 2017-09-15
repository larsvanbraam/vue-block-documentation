module.exports = function stripFileFromPath(path) {
	// Split into parts
	const parts = path.split('/');
	// Strip out the file
	parts.pop();
	//return the url
	return parts.join('/');
};