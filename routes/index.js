require('dotenv').config();
const CityModel = require('./bdd.js');
var express = require('express');
const { route } = require('express/lib/application');
var router = express.Router();
var request = require('sync-request');
var { capitalize, temp_req } = require('./utils');

/* GET home page. */
router.get('/', async function(req, res, next) {
  res.render('login');
});

router.get('/weather', async function(req, res, next) {
  var cityList = await CityModel.find({});
  res.render('weather', { cityList, error: false });
});

router.post('/add-city', async function(req, res, next) {
  /* verifier que le ville ne ce trouve pas dans les bases de donnees */
  var doublon = await CityModel.findOne({ city_name: capitalize(req.body.name.toLowerCase()) });
  if (!doublon) {
    /* envoyer un requete a openweathermap pour recevoir les informations */
    var dataAPI = temp_req(req.body.name);
    if (dataAPI.message === "city not found") {
      var cityList = await CityModel.find({});
      res.render('weather', { cityList, error: { ville: req.body.name, message: "Ce ville n'était pas trouvé par OpenWeatherMap"} });
    } else {
      /* ajouter un nouveaux ville a notre base de données avec les inputs du frontend et de openweathermap */
      const newCity = CityModel({
        city_name: dataAPI.name, 
        description: dataAPI.weather[0].description,
        icon: dataAPI.weather[0].icon,
        high_temp: dataAPI.main.temp_max,
        low_temp: dataAPI.main.temp_min
      });
      await newCity.save();
      var cityList = await CityModel.find({});
      res.render('weather', { cityList, error: false});
    }
  } else {
    var cityList = await CityModel.find({});
    res.render('weather', { cityList, error: { ville: req.body.name, message: "Ce ville est deja sur la liste!" } })
  };;
});

router.get('/delete-city', async function(req, res, next) {
  await CityModel.deleteOne({ _id: req.query.remove });
  var cityList = await CityModel.find({});
  res.render('weather', { cityList, error: false });
});

router.get('/update-cities', async function(req, res, next) {
  var cityList = await CityModel.find({});
  console.log(cityList);
  /* pour chaque ville dans notre base de données envoyez un requete a openweathermap pour recevoir les informations */
  for (city of cityList) {
    var dataAPI = temp_req(city.city_name);
    /* fair les updates */
    await CityModel.findByIdAndUpdate(city._id, {
      city_name: dataAPI.name,
      description: dataAPI.weather[0].description,
      icon: dataAPI.weather[0].icon,
      high_temp: dataAPI.main.temp_max,
      low_temp: dataAPI.main.temp_min
    });
  }
  var cityList = await CityModel.find({});
  res.render('weather', { cityList, error: false });
});

module.exports = router;