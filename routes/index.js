var express = require('express');
var router = express.Router();
const axios = require('axios');

const AWS = require("aws-sdk");
require("dotenv").config();
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  sessionToken: process.env.AWS_SESSION_TOKEN,
  region: "ap-southeast-2",
});
const s3 = new AWS.S3();

// Specify the S3 bucket and object key
const bucketName = "shome-s3-project";
const objectKey = "counter.json";


async function createS3bucket() {
  try {
    await s3.createBucket({ Bucket: bucketName }).promise();
    console.log(`Created bucket: ${bucketName}`);
  } catch (err) {
    if (err.statusCode === 409) {
      console.log(`Bucket already exists: ${bucketName}`);
    } else {
      console.log(`Error creating bucket: ${err}`);
    }
  }
}

// Upload the JSON data to S3
async function uploadJsonToS3(jsonData) {
  const params = {
    Bucket: bucketName,
    Key: objectKey,
    Body: JSON.stringify(jsonData), // Convert JSON to string
    ContentType: "application/json", // Set content type
  };

  try {
    await s3.putObject(params).promise();
    console.log("JSON file uploaded successfully.");
  } catch (err) {
    console.error("Error uploading JSON file:", err);
  }
}

// Retrieve the object from S3
async function getObjectFromS3() {
  const params = {
    Bucket: bucketName,
    Key: objectKey,
  };

  try {
    const data = await s3.getObject(params).promise();
    // Parse JSON content
    const counterObjtec = JSON.parse(data.Body);
    const counter = counterObjtec.counter;
    const intCounter = parseInt(counter)
    console.log("Parsed JSON data:", intCounter);
    return intCounter;
  } catch (err) {
    if (err.code === 'NoSuchKey') {
      // Handle the case where the object doesn't exist
      console.log(`Object ${objectKey} not found. Creating with an initial value.`);
      const initialCounter = 0;
      const jsonData = {
        counter: initialCounter,
      };
      await uploadJsonToS3(jsonData);
      return initialCounter;
    } else {
      console.error("Error:", err);
      return 0;
    }
  }
}

//getting the countries name,currency and countryId
async function getCountries(offset) {
  const apiKey = process.env.XRapidAPIKey;

  const options = {
    method: 'GET',
    url: 'https://wft-geo-db.p.rapidapi.com/v1/geo/countries',
    params: {
      limit: '10',
      offset: offset
    },
    headers: {
      'X-RapidAPI-Key': apiKey, // process.env.RAPID_KEY
      'X-RapidAPI-Host': 'wft-geo-db.p.rapidapi.com'
    }
  };

  try {
    const response = await axios.request(options);
    return response.data;
  } catch (error) {
    console.error(error);
  }
}
var countriesListFirstPage;
/* GET home page. */
router.get('/', async function (req, res, next) {
  //increment page counter
  await createS3bucket();
  const getCounter = await getObjectFromS3();
  console.log(getCounter)
  const increment = getCounter + 1;
  console.log(increment)
  const jsonData = {
    counter: increment,
  };
  await uploadJsonToS3(jsonData);
  const offset = 0;
  const allData = await getCountries(offset);
  countriesListFirstPage = allData.data;
  const countriesList = countriesListFirstPage
  const offsetCount = allData.metadata.currentOffset;
  //console.log(offsetCount);
  res.render('index', { countriesList, offsetCount, increment });
});

//changes the list according to offset count. loads the next countries
router.get('/countries/next', async function (req, res, next) {
  await createS3bucket();
  const getCounter = await getObjectFromS3();
  console.log(getCounter)
  const increment = getCounter + 1;
  console.log(increment)
  const jsonData = {
    counter: increment,
  };
  await uploadJsonToS3(jsonData);
  //
  const offset = parseInt(req.query.offsetCount) + 10;
  console.log(offset);
  const allData = await getCountries(offset);
  const countriesList = allData.data;
  const offsetCount = allData.metadata.currentOffset;
  const totalCount = allData.metadata.totalCount;
  if (offset >= totalCount) {
    const offsetCount = 0;
    const countriesList = countriesListFirstPage;
    res.render('index', { countriesList, offsetCount,increment });
  } else {
    const offsetCount = allData.metadata.currentOffset;
    res.render('index', { countriesList, offsetCount, increment });
  }
});

//changes the list according to offset count. loads the previosu countries
router.get('/countries/previous', async function (req, res, next) {
  await createS3bucket();
  const getCounter = await getObjectFromS3();
  console.log(getCounter)
  const increment = getCounter + 1;
  console.log(increment)
  const jsonData = {
    counter: increment,
  };
  await uploadJsonToS3(jsonData);
  const offset = parseInt(req.query.offsetCount) - 10;
  console.log(offset);
  if (offset <= 0) {
    const offsetCount = 0;
    const countriesList = countriesListFirstPage;
    res.render('index', { countriesList, offsetCount, increment });
  } else {
    const allData = await getCountries(offset);
    const countriesList = allData.data;
    const offsetCount = allData.metadata.currentOffset;
    const totalCount = allData.metadata.totalCount;
    res.render('index', { countriesList, offsetCount, increment });
  }
});

module.exports = router;
