const express = require('express');
const app = express();

// NPM dependencies
const path = require('path');
const bodyParser = require('body-parser');
const mongo = require('mongodb').MongoClient;
const useragent = require('useragent');

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
	body.agent = useragent.parse(req.headers['user-agent']);
	body.stage = req.query.stage || STAGE;
	body.week = req.query.week || WEEK;
	mongo.connect(murl, function(err, client){
		const db = client.db(mdb);
		const collection = db.collection('votes');
		collection.remove({ipaddress : body.ipaddress, agent : body.agent, stage : body.stage, week : body.week}, function(err){
			if(err) console.error(err);
		});
		collection.insert(body, function(err, result){
			if(err) console.error(err);
			client.close();
		});
	});
	res.sendFile(path.join(__dirname, 'public/thanks.html'));
});

app.get('/result', function(req, res){
	res.sendFile(path.join(__dirname, 'public/result.html'));
});

// Votes REST API
const votes = require('./votes.js');
votes(app);

app.listen(PORT, function(){
	console.log('danielgrants.com is running on port ' + PORT);
});
