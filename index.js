const express = require('express');
const app = express();

// NPM dependencies
const path = require('path');
const bodyParser = require('body-parser');
const mongo = require('mongodb').MongoClient;

const PORT = process.env.PORT || 8081;
const murl = 'mongodb://localhost:27017';
const mdb = 'rankings';
const STAGE = 3;
const WEEK = 1;

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({
	  extended: true
}));

app.get('/', function(req, res){
	res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.post('/send', function(req, res){
	let body = req.body;
	body.timestamp = Date.now();
	body.ipaddress = req.get('X-Real-IP');
	body.stage = req.query.stage || STAGE;
	body.week = req.query.week || WEEK;
	mongo.connect(murl, function(err, client){
		console.log(err);
		const db = client.db(mdb);
		const collection = db.collection('votes');
		collection.insert(body, function(result){
			client.close();
		});
	});
	console.log(JSON.stringify(req.body));
	res.sendFile(path.join(__dirname, 'public/thanks.html'));
});

app.get('/result', function(req, res){
	res.sendFile(path.join(__dirname, 'public/result.html'));
});

app.listen(PORT, function(){
	console.log('danielgrants.com is running on port ' + PORT);
});
