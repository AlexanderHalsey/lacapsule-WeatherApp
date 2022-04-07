var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
});
  
const UserModel = mongoose.model("users", userSchema);
  
module.exports = UserModel;