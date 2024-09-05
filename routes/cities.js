var express = require('express');
var router = express.Router();
async function getCities(countryID) {
  const axios = require('axios');
  const apiKey = process.env.XRapidAPIKey;

//get cities using country ID
  const options = {
    method: 'GET',
    url: `https://wft-geo-db.p.rapidapi.com/v1/geo/countries/${countryID}/places`,
    params: {
      types: 'CITY',
      minPopulation: '500000',
      limit: '10'
    },
    headers: {
      'X-RapidAPI-Key': apiKey,
      'X-RapidAPI-Host': 'wft-geo-db.p.rapidapi.com'
    }
  };

  try {
    const response = await axios.request(options);
    return response.data.data;
  } catch (error) {
    console.error(error);
  }
}


router.post('/', async function (req, res, next) {
  const countryID = req.body.CountryID
  //console.log('Hello');
  const citiesData = await getCities(countryID);
  res.render('cities', { citiesData });
});

router.get('/', async function (req, res, next) {
  const countryID = req.query.CountryID
  //console.log('Hello');
  const citiesData = await getCities(countryID);
  res.render('cities', { citiesData });
});

module.exports = router;
