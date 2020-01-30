const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../config/config.env') });


const getGeoCode = async (address) => {

  const radiusUrl = 'http://localhost:5000/api/v1/bootcamps/radius/'
  const gMapsUrl = "https://maps.googleapis.com/maps/api/geocode/json?address="

  try {
    const res = await axios.get(`${gMapsUrl}${address}${process.env.GMAPS_KEY}`)
    const {lat, lng} = res.data.results[0].geometry.location
    console.log(lat, lng)
    return {success: true, lat, lng}
    }
    catch (e) {
      return e
    }
}


module.exports = getGeoCode
