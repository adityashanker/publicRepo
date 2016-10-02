
//Sets up model for the data
//Since arbitrary JSON handling is required, we do not define a strict schema

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//strict:false is used to allow any item to be inserted into the DB
var itemSchema = new Schema({ any: {} }, {strict: false});

//Exports module so it can be used by our server

module.exports = mongoose.model('item' ,itemSchema);
