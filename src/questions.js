const toSpaceCase = require('to-space-case');

exports.getGeneratorQuestions = function(type, settings, name) {
  let questions;

  if (type) {
    questions = [
      askName(name),
      askDestination(type, settings.templates[type].destination) || settings.destination,
    ];
  } else {
    questions = [askType(settings.templates), askName(name)];

    Object.keys(settings.templates).forEach(key => {
      questions.push(
        askDestination(key, settings.templates[key].destination || settings.destination, true),
      );
    });
  }

  return questions;
};

exports.getSettingQuestions = function(settings) {
  return Object.keys(settings).map(key => askSetting(key, settings[key]));
};

function askSetting(key, defaultValue) {
  return {
    type: 'input',
    name: key,
    message: toSpaceCase(key),
    default: defaultValue || '',
  };
}
