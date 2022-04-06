var request = require('sync-request');

const capitalize = word => {
    return word.charAt(0).toUpperCase() + word.slice(1);
};

const temp_req = ville => {
    /* envoyer un requete a openweathermap pour recevoir les informations */
    var cle = process.env.WEATHER_API_KEY;
    var lang = "fr";
    var units = "metric";
    var temp_req = request('GET',`https://api.openweathermap.org/data/2.5/weather?q=${ville}&lang=${lang}&appid=${cle}&units=${units}`);
    return JSON.parse(temp_req.body);
  }

module.exports = { capitalize, temp_req };
