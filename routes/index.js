var express = require('express');
const { route } = require('express/lib/application');
var router = express.Router();

var cityList = [
  {nom: "Paris", temps: {
    desc: "nuageux", img: "picto-1.png", jour: 7.22, nuit: 5.56
  }},
  {nom: "Lyon", temps: {
    desc: "ciel dégagé", img: "picto-1.png", jour: 6, nuit: 3.89
  }},
];

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('login');
});

router.get('/weather', function(req, res, next) {
  res.render('weather', { cityList });
});


const decimal = (high, low) => {
  return (Math.round(Math.random() * high * 10 * 10)/100 + low).toFixed(2);
};

const doublon_verification = (nameAdd) => {
  for (let city of cityList) {
    // console.log("city name ", city.nom);
    // console.log("name add: ", nameAdd);
    if (city.nom.toLowerCase() === nameAdd.toLowerCase()) {
      return false
    };
  };
  return true;
};

router.post('/add-city', function(req, res, next) {
  /* verifier les doublons */
  if (doublon_verification(req.body.name)) {
    /* ajouter un nouveaux ville a notre tableau avec tous les inputs du frontend */
    cityList.push({
      nom: req.body.name, temps: {
        desc: "fictif", img: "picto-1.png", jour: decimal(20, -5), nuit: decimal(20, -5)
      }});
  };
  res.render('weather', { cityList });
});

router.get('/delete-city', function(req, res, next) {
  cityList.splice(req.query.remove, 1);
  res.render('weather', { cityList });
})

module.exports = router;
