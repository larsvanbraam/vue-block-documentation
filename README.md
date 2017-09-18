[![Travis](https://img.shields.io/travis/larsvanbraam/vue-block-documentation.svg?maxAge=2592000)](https://travis-ci.org/larsvanbraam/vue-block-documentation)
[![npm](https://img.shields.io/npm/dm/vue-block-documentation.svg?maxAge=2592000)](https://www.npmjs.com/package/vue-block-documentation)
[![GitHub issues](https://img.shields.io/github/issues/larsvanbraam/vue-block-documentation.svg?style=flat-square)](https://github.com/larsvanbraam/vue-block-documentation/issues)

# vue-block-documentation
A CLI generator to generate API documentation [vue-block-system projects](https://www.github.com/larsvanbraam/vue-block-system)

## Install

```console
$ npm install -g vue-block-documentation
```

## Commands

To use the generator open your console and change directory to the src directory of your [vue-block-system project](https://www.github.com/larsvanbraam/vue-block-system).

![Demo](http://vue-block-documentation.larsvanbraam.nl/demo.gif)

#### init-block-documentation

This will initialize the block documentation tool in your project, it will ask you to confirm some settings. This will most likely mean pressing enter until it's done.

```console
$ init-block-documentation
```

#### generate-block-documentation

This is where the magic happens. Running this fill scan the block directory annd create a documentation folder in the src folder. Opening this on a webserver will display your generated documentation.

```console
$ generate-block-documentation
```

Options:

* ```-i, --input <input>```: Override the input directory.
* ```-o, --output <output>```: Override the output directory.

## Typing your block data
The tool will scan the block folders for the `{BlockName}Data.js` files, this file should contain all the data
provided by your API. Describing the data is done by using [Vue-Types](https://github.com/dwightjack/vue-types).

### Basic example 

```javascript
import VueTypes from 'vue-types';

export default {
	heading: VueTypes.string.isRequired,
	paragraph: VueTypes.string.isRequired,
	image: VueTypes.shape({
		src: VueTypes.string.isRequired,
		alt: VueTypes.string.isRequired,
	}).isRequired,
};
```

### Using external objects
To avoid having to redefine the same object over and over again you can also import js files that describe the shape of the reusable object

**ImageDataObject.js**

```javascript
import VueTypes from 'vue-types';

export default {
	src: VueTypes.string.isRequired,
	alt: VueTypes.string.isRequired,
};
```

**BlockFooData.js**

```javascript
import VueTypes from 'vue-types';
import ImageDataObject from './image-data-object';

export default {
	heading: VueTypes.string.isRequired,
	paragraph: VueTypes.string.isRequired,
	image: VueTypes.shape(ImageDataObject).isRequired,
};
```

### Adding custom descriptions and placeholders
When generating API documentation it also outputs example json structures, for easy development you want this to be as accurate as possible for the backender building your API. To create better documentation you can add descriptions and placeholder values into your object describing the object. You do this by adding a comment block above your data object. The structure for adding descriptions and placeholder is as followed:

```
@param {description|placehoder} [NAME_OF_YOUR_PARAM] Your description goes here...
```

This could end up in the following:

```javascript
import VueTypes from 'vue-types';

/**
 * @param {description} heading This is the heading of the component
 * @param {placeholder} heading Lorem ipsum dolor sit amet
 *
 * @param {description} paragraph This is the paragraph of the component
 * @param {placeholder} paragraph Lorem ipsum dolor sit amet
 *
 * @param {description} image this is the image object of the component
 *
 * @param {description} image.src this is the source of your image
 * @param {placeholder} image.src path/to/image.jpg
 *
 * @param {description} image.alt this is the alt text for your image 
 * @param {placeholder} image.alt path/to/image.jpg 
 */
export default {
	heading: VueTypes.string.isRequired,
	paragraph: VueTypes.string.isRequired,
	image: VueTypes.shape({
		src: VueTypes.string.isRequired,
		alt: VueTypes.string.isRequired,
	}).isRequired,
};
```
*Note: Adding description and placeholders to your object also works when using the external objects.*

## Demo
This tool wil only work on a vue-block-system project. I've created an example output so you can preview what the output might look like!

### [Check the example output online.](http://vue-block-documentation.larsvanbraam.nl)


