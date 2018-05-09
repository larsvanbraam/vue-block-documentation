const babel = require('babel-core');
const es2015 = require('babel-preset-es2015');
const proxySourceMethods = require('./proxy-source-methods');

/**
 * @description Transform input source to ES2015 to allow running in NodeVM
 * @param inputSource
 */
module.exports = function transformSource(inputSource) {
  // Apply the proxy methods to the input source
  const source = proxySourceMethods(inputSource);

  // use babel to transform the source
  return babel.transform(source, {
    ast: false,
    comments: false,
    presets: [es2015],
  }).code;
};
