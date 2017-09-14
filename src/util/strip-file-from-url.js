module.exports = function stripFileFromUrl(url) {
	// Split into parts
	const parts = url.split('/');
	// Strip out the file
	parts.pop();
	//return the url
	return parts.join('/');
};