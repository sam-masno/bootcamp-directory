const NodeGeocoder = require('node-geocoder');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../config/config.env') })


const options = {
  provider: process.env.GEOCODER_PROVIDER,
  // provider: 'mapquest',

  // Optional depending on the providers
  httpAdapter: 'https', // Default
  apiKey: process.env.GEOCODER_API_KEY,
  // apiKey: 'BnxZxOgDmRD45OdtHvujWfDHaqjlstLA', // for Mapquest, OpenCage, Google Premier
  formatter: null         // 'gpx', 'string', ...
};

const geocoder = NodeGeocoder(options);

module.exports = geocoder;
