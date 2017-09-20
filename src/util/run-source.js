const vm2 = require('vm2');
const chalk = require('chalk');

/**
 * @description Run provided javascript within a safe sandbox.
 * @param source
 * @param scriptPath
 * @returns {*}
 */
module.exports = function runSource(source, scriptPath) {
	return new Promise((resolve, reject) => {
		const vm = new vm2.NodeVM({
			require: {
				external: true,
			},
		});

		let vmScript = source;
		let compiledSource = null;

		try {
			vmScript = new vm2.VMScript(source);
		}
		catch (error) {
			reject(`Failed to compile script. ${error}`);
			return;
		}

		try {
			compiledSource = vm.run(vmScript, scriptPath);
		}
		catch (error) {
			reject(`Failed to execute script. ${error}`);
			return;
		}

		resolve(compiledSource.default);
	});
};
