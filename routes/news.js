var express = require('express');
var router = express.Router();
async function getNews(cityName) {
    const axios = require('axios');
    const apiKey = process.env.News_API_Key;

    const options = {
        method: 'GET',
        url: `https://newsapi.org/v2/everything?q=${cityName}&language=en&sortBy=relevancy&apiKey=${apiKey}`,
    };

    try {
        const response = await axios.request(options);
        return response.data.articles;
    } catch (error) {
        console.error(error);
    }
}

router.get('/', async function (req, res, next) {
    const cityName = req.query.cityName
    //console.log('Hello');
    const newsData = await getNews(cityName);
    res.render('news', { newsData });
});

module.exports = router;
