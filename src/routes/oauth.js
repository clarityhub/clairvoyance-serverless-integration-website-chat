const { handleOauthCode } = require('../controllers/oauth');

module.exports = function (router) {
  router.route('/oauth')
    .get(handleOauthCode);
};
