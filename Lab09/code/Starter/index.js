const dotenv = require('dotenv');
const path = require('path');
const { DirectLine } = require('./directLine');

const ENV_FILE = path.join(__dirname, '.env');
dotenv.config({ path: ENV_FILE });

