require('dotenv').config();
const CityModel = require('../models/cities');
const UserModel = require('../models/users');
var { capitalize, temp_req } = require('../utils');

var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  if (req.session.user) res.redirect('/weather');
  else res.render('login', { error: "" });
});

router.post('/signup', async function(req, res, next) {
  /* chercher si un user avec cette email existe deja */
  var existingUser = await UserModel.findOne({ email: req.body.email });
  /* si non on procede */
  if (!existingUser) {
    /* creer nouveau user */
    const newUser = UserModel({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password
    });
    await newUser.save();
    /* sauvegarder l'information en session */
    req.session.user = {
      id: newUser._id,
      username: newUser.username,
    };
    res.redirect('/weather');
  /* si oui on ne cree pas un nouveau user */
  } else res.render('login', { 
    error: "Email deja trouve dans le systeme. Veulliez essayer de creer un compte avec un email unique."
  });
});

router.post('/signin', async function(req, res, next) {
  /* verifier que les details du login soient correctes */
  const currentUser = await UserModel.findOne({ username: req.body.username, password: req.body.password });
  if (currentUser) {
    /* sauvegarder cette information en session */
    req.session.user = {
      id: currentUser._id,
      username: currentUser.username
    }
    /* aller sur la page principale */
    res.redirect('/weather');
  /* si les informations sont incorrectes on est de retour sur le login */
  } else res.render('login', { 
    error: "Email ou mot de passe incorrecte",
  });
});

router.get('/logout', function(req, res, next) {
  /* on elimine les informations du session user */
  req.session.user = null;
  /* on retourne sur la page login */
  res.redirect('/');
})

router.get('/weather', async function(req, res, next) {
  /* si quelqu'un essaye d'acceder cette url sans avoir un session valid on retourne au login */
  if (!req.session.user) { res.redirect('/'); }
  else {
    /* recuperer toutes les villes du base des donnees */
    var cityList = await CityModel.find({});
    res.render('weather', { cityList, error: false });
  };
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