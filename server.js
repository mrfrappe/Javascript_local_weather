const express = require('express');
const path = require('path');

require('dotenv').config()


var keys ={
    apiOpenWeatherKey: process.env.API_OPENWEATHER_KEY,
    apiUnsplashKey: process.env.API_UNSPLASH_KEY,
    apiGooglePlacesKey: process.env.API_GOOGLEPLACES_KEY
}

const hostname = '127.0.0.1';
const port = 3000;

const server = express();

server.set('views', path.join(__dirname, '/'));
server.set('view engine', 'hbs');
server.use(express.static(path.join(__dirname, 'public')));

server.get('/', (req,res) => {
    res.render('index', {data: JSON.stringify(keys)});
})


server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
  });