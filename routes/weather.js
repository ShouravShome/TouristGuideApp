const e = require('express');
var express = require('express');
var router = express.Router();
async function getWeather(lat,long) {
  //getting weather
    const axios = require('axios');
    const apiKEY = process.env.Weather_API_Key;
    
    const options = {
      method: 'GET',
      url: `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${long}&units=metric&appid=${apiKEY}`,
    };
  
    try {
      const response = await axios.request(options);
      return response.data;
    } catch (error) {
      console.error(error);
    }
  }


router.get('/', async function (req, res, next) {
  const lat = req.query.lat;
  const long = req.query.long;
  const cityName = req.query.cityName;
  var selectedDate = 'default'
  if (!req.query.date){
    selectedDate = 'default';
  }else{
    selectedDate = req.query.date;
  }
  //console.log(lat);
  //console.log(cityName);

  const weatherData = await getWeather(lat,long);
  //differently storing 8 results in 5 variables from total 40 results
  const firstDay = weatherData.list.slice(0,8);
  const secondDay = weatherData.list.slice(8,16);
  const thirdDay = weatherData.list.slice(16,24);
  const fourthDay = weatherData.list.slice(24,32);
  const fifthDay = weatherData.list.slice(32,40);

//extracting date from the 5 dates
  const [firstDate, time1] = firstDay[0].dt_txt.split(' ');
  const [secondDate,time2] = secondDay[0].dt_txt.split(' ');
  const [thirdDate,time3] = thirdDay[0].dt_txt.split(' ');
  const [fourthDate,time4] = fourthDay[0].dt_txt.split(' ');
  const [fifthDate,time5] = fifthDay[0].dt_txt.split(' ');
  //console.log(weatherData);

  var weatherDataToDisplay;

  //check what date user is selecting and push data based on that date in weatherDataToDisplay
  if(selectedDate == 'default'){
    weatherDataToDisplay = firstDay;
  }
  else if(selectedDate == firstDate){
    weatherDataToDisplay = firstDay;
  }
  else if(selectedDate == secondDate){
    weatherDataToDisplay = secondDay;
  }
  else if(selectedDate == thirdDate){
    weatherDataToDisplay = thirdDay;
  }
  else if(selectedDate == fourthDate){
    weatherDataToDisplay = fourthDay;
  }
  else if(selectedDate == fifthDate){
    weatherDataToDisplay = fifthDay;
  }

  //const currentWeather = weatherData.weather[0].main;
  //console.log(currentWeather);
  res.render('weather', {firstDate,secondDate,thirdDate,fourthDate,fifthDate, weatherDataToDisplay, cityName,lat,long,selectedDate});
});

module.exports = router;
