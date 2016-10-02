//server.js

//Global variables

//Update this variable with the relevant DNS
var serviceUrl = "http://ec2-54-85-6-185.compute-1.amazonaws.com:8080/api/objects/";

//Basic Setup

//Calling Packages Required
var express = require('express');				
var app = express();						
var bodyParser = require('body-parser');			

//Connecting to database
//arbitJson is the name of the database used
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/arbitJson');

//Defining Model for entries
var jsonItem = require('../app/models/jsonitem');

//Configure app to use bodyParser()
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

//Set port to 8080
var port = process.env.PORT || 8080;				

//Setting up our routes
var router = express.Router();					

//Middleware for logging requests and handling incorrect types
router.use(function(req, res, next){

	console.log('Request received!');
	
	if (req.method && ((req.method == 'POST') || (req.method == 'PUT'))){
		var contentType = req.headers['content-type'];
		if (!contentType || (contentType.indexOf('application/json') !== 0)
		&& (contentType.indexOf('application/x-www-form-urlencoded') !== 0)){
			res.json({verb: req.method,url: serviceUrl,message: "Incorrect Object Type" });
			res.end();
		}
		else
			next();
	}
	else
		next();							
});


//Test Route
router.get('/', function(req,res){
	res.json({ message: 'Welcome to the arbitJson API!' });
});

//Main Routes to use
router.route('/objects')

	//Creating an entry
	.post(function(req,res) {
			
		var jsonitem = new jsonItem();			
		
		for (var key in req.body){
			if (req.body.hasOwnProperty(key)) {
				item = req.body[key];
				jsonitem.set(key,item);
			}
		}
		
		//Used to send back to the user
		var jsonData = jsonitem.toObject();	

		jsonitem.save(function(err){
			if (err)
				res.send(err);
			
			res.json(jsonData);
		});

	})

	//Get all Entries
	//Uses an array to generate/store the URL's of all objects
	.get(function(req, res){
		jsonItem.find(function(err,jsonitems) {
			if (err)
				res.send(err);				

			var outputArray = [];
						
			jsonitems.forEach(function(user) {
				var userIds = {};
				userIds["url"] = serviceUrl.concat(user._id);
				outputArray.push(userIds);
			});

			res.json(outputArray);
		});
	});

//Route for single Item Get/Put/Delete Operations
router.route('/objects/:item_id')

	//Get the JSON field with that ID
	.get(function(req, res) {
		var jsonObject = {};
		jsonItem.findById(req.params.item_id, function(err,jsonitem){

			if (err)
                res.send(err);
			
			if (jsonitem != null){	
				jsonObject = jsonitem.toObject();
				delete jsonObject.__v;
			}
			res.json(jsonObject);
		});
	})
	
	//Update the JSON Item
	//Completely deletes the old element, and replaces it with the new field 
	//with the same id
	//Mongoose's FindOneandUpdate did not seem to function the same way as 
	//MongoDB's findAndModify command (it did not replace the document as a whole)
	
	.put(function(req, res){

		var updateItem = new jsonItem();
		
		for (var key in req.body){
			if (req.body.hasOwnProperty(key)){
				updateItem.set(key,req.body[key]);
			}
		}
	
		var updateData = updateItem.toObject();
		delete updateData._id;
		
		//For displaying the output
		updateData["_id"] = req.params.item_id;
		updateItem.set("_id",req.params.item_id);
		
		//Removes the old entry with the same ID
		jsonItem.remove({_id: req.params.item_id},function(err,jsonitem){
			if(err)
				res.send(err);
		});

		//Inserts the update under the same ID
		updateItem.save(function(err){
                        if (err)
                                res.send(err);

                        res.json(updateData);
                });
				
	})
	
	//Deleting the JSON Item
	.delete(function(req, res) {
		jsonItem.remove({_id: req.params.item_id
		}, function(err, jsonitem) {
			if (err)
				res.send(err);
			
			res.send();
		});
	});
	
//Registering prefix for routes
app.use('/api',router);

//Starting the server
app.listen(port);
console.log('Listening on port ' + port);



