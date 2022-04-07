var mongoose = require('mongoose');

var citySchema = new mongoose.Schema({
    city_name: String,
    description: String,
    icon: String,
    high_temp: String,
    low_temp: String,
});
  
const CityModel = mongoose.model("cities", citySchema);
  
module.exports = CityModel;