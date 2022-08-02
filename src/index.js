const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('service-claire/middleware/helmet');
const errorHandler = require('service-claire/middleware/errors');
const logger = require('service-claire/helpers/logger');
const path = require('path');
const routes = require('./routes');

// XXX add a Bugsnag token here
logger.register('');

const app = express();

app.enable('trust proxy');
app.use(helmet());
app.use(bodyParser.json());
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, '/views'));
app.use('/website-chat', routes);
app.use(errorHandler);

logger.log('✅ 📲 service-website-chat running');

module.exports = { app }; // For testing
