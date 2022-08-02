const logger = require('service-claire/helpers/logger');
const { ok } = require('service-claire/helpers/responses');
const {
  Auth,
} = require('../models');
const { handleOauthOnboarding } = require('./oauth');

/**
 * When a user creates a new account, we are automatically
 * given an oauth access token for that account.
 *
 * @private
 */
const handleOauth = function ({ event }) {
  const { accessToken, publicKey, accountId } = event;

  handleOauthOnboarding({
    accessToken,
    publicKey,
    accountId,
  });
};

const handleOauthRevoked = function ({ event }) {
  const { accessToken, accountId } = event;

  Auth.destroy({
    where: {
      accessToken,
      accountId,
    },
  }).catch(function (err) {
    logger.error(err);
  });
};


/**
 * When you register an integration and set up a callback url,
 * we first want to make sure that you own that url and make you
 * perform a simple handshake.
 * 
 * We give you a token that you should check, and then you send
 * us back the challenge we gave you.
 */
const onVerify = ({ token, challenge }, res) => {
  if (token === process.env.TOKEN) {
    res.status(200).send({
      challenge,
    });
  } else {
    res.status(403).send({
      reason: 'Invalid token',
    });
  }
}

const callback = function (req, res) {
  const { type, eventType } = req.body;

  if (type === 'url_verification') {
    onVerify(req.body, res);
    return;
  } else if (type === 'oauth_callback' && eventType === 'integration.activated') {
    handleOauth(req.body);
  } else if (type === 'oauth_callback' && eventType === 'integration.revoked') {
    handleOauthRevoked(req.body);
  }

  ok(res)({});
};

module.exports = {
  callback,
};
