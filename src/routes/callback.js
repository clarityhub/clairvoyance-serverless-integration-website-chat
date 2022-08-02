const checkTokenMiddleware = require('../middleware/checkToken');
const { callback } = require('../controllers/callback');

module.exports = function (router) {
  router.route('/callback')
    .post(
      checkTokenMiddleware,
      callback
    );
};
