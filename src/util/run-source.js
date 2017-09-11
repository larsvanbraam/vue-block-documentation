const vm2 = require('vm2');
const chalk = require('chalk');

/**
 * @description Run provided javascript within a safe sandbox.
 * @param source
 * @param scriptPath
 * @returns {*}
 */
module.exports = function runSource(source, scriptPath) {
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
		console.log(chalk.red('Failed to compile script.'));
		throw error;
	}

	try {
		compiledSource = vm.run(vmScript, scriptPath);
	}
	catch (error) {
		console.log(chalk.red('Failed to execute script.'));
		throw error;
	}

	return compiledSource;
};