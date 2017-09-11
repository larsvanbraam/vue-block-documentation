const findImports = require('find-imports');

/**
 * @description Find all imports in the provided file
 * @param file
 * @param isRootFile
 * @returns { Promise<T> }
 */
module.exports = function getFileImports(file) {
	return new Promise((resolve) => {
		const imports = findImports(file, {
			absoluteImports: true,
			relativeImports: true,
			packageImports: false,
			flatten: true,
		});

		resolve(imports);
	});
};