/**
 * @description Resolve promises sequential
 * @param promises
 * @returns {Promise}
 */
module.exports = function sequentialPromises(promises) {
  return new Promise((resolve, reject) => {
    const resolvePromise = promise => {
      promise()
        .then(() => {
          if (promises.length) {
            resolvePromise(promises.shift());
          } else {
            resolve();
          }
        })
        .catch(reason => reject(reason));
    };
    // Start the loop
    if (promises.length) {
      resolvePromise(promises.shift());
    } else {
      resolve();
    }
  });
};
