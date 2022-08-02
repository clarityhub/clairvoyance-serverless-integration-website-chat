const logger = require('service-claire/helpers/logger');

const {
  error,
} = require('service-claire/helpers/responses');
const rp = require('request-promise');
const {
  Auth,
} = require('../models');
const ClarityHub = require('node-clarity-hub');

const {
  AUTH_URL: authUrl,
  INTEGRATION_URL: integrationUrl,
  APPS_URL: appsUrl,
  INTEGRATION_UUID: integrationUuid,
  CLIENT_ID: clientId,
  CLIENT_SECRET: clientSecret,
} = process.env;

const handleOauthOnboarding = function ({
  accessToken,
  publicKey,
  accountId,
}) {
  return new Promise(function (resolve, reject) {
    Auth.findCreateFind({
      where: {
        accountId,
      },
      defaults: {
        accessToken,
        publicKey,
        accountId,
      },
    }).then(function (arr) {
      const created = arr[0];
      if (!created) {
        Auth.update({
          accessToken,
          publicKey,
        }, {
          where: {
            accountId,
          },
        });
      }

      const clarityHub = new ClarityHub({
        accessToken,
        url: integrationUrl,
      });

      const script = `<script type="text/javascript" src="${appsUrl}/scripts/chat.js?API_KEY=${publicKey}">
</script>`;

      clarityHub.integrationSettings.update({
        integrationUuid,
        settings: [
          {
            type: 'text',
            value: 'Add the following HTML to your website:',
          },
          {
            type: 'textarea',
            value: script,
            label: 'Widget Code',
            clipboard: true,
            disabled: true,
          },
        ],
      });

      resolve({
        wasAlreadyActive: !created,
        script,
      });
    }).catch(function (err) {
      logger.error(err);
      reject(err);
    });
  });
};

/**
 * Use the given code to create an oauth access token.
 * This is usually caused by re-activating the integration.
 */
const handleOauthCode = function (req, res) {
  const {
    code,
  } = req.query;

  const options = {
    method: 'POST',
    uri: `${authUrl}/auth/credentials/code/${code}/activate`,
    json: true,
    body: {
      clientId,
      clientSecret,
    },
  };

  return rp(options).then(function (response) {
    return handleOauthOnboarding({
      accessToken: response.accessToken,
      publicKey: response.publicKey,
      accountId: response.accountId,
    }).then(function (data) {
      const {
        wasAlreadyActive,
        script,
      } = data;

      res.status(200).render('oauth', {
        wasAlreadyActive,
        script,
      });
    })
  }).catch(function (err) {
    logger.error(err);
    res.status(404).send();
  });
};


module.exports = {
  handleOauthOnboarding,
  handleOauthCode,
};
