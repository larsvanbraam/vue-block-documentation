const VueType = require('./vue-type');

module.exports = Object.freeze({
  [VueType.ANY]: 'any',
  [VueType.ARRAY]: 'array',
  [VueType.BOOL]: 'boolean',
  [VueType.FUNC]: 'function',
  [VueType.NUMBER]: 'number',
  [VueType.INTEGER]: 'integer',
  [VueType.OBJECT]: 'object',
  [VueType.STRING]: 'string',
  [VueType.INSTANCE_OF]: 'instanceOf',
  [VueType.ONE_OF]: 'oneOf',
  [VueType.ONE_OF_TYPE]: 'oneOfType',
  [VueType.ARRAY_OF]: 'arrayOf',
  [VueType.OBJECT_OF]: 'objectOf',
  [VueType.SHAPE]: 'object',
});
