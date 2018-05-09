const ProxyMethods = require('../config/proxy-methods');

/**
 * @description Some vue methods do not return the required response so we proxy them with these methods!
 * @param source
 * @returns {*}
 */
module.exports = function proxySourceMethods(source) {
  Object.keys(ProxyMethods).forEach(key => {
    const regex = new RegExp(`VueTypes.${key}`, 'g');
    // Get the value
    const method = ProxyMethods[key];
    // Replace with the custom shape method
    source = source.replace(regex, key);
    // Merge the source
    source = method + source;
  });
  // return the modified source
  return source;
};
