const express = require('express');
const app = express();

// NPM dependencies
const path = require('path');
const bodyParser = require('body-parser');
const mongo = require('mongodb').MongoClient;
const useragent = require('useragent');
const _ = require('lodash');
const sw = require('./stageweek.js');

const PORT = process.env.PORT || 8081;
const murl = 'mongodb://localhost:27017';
const mdb = 'rankings';

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
	body.stage = sw().stage;
	body.week = sw().week;
	mongo.connect(murl, function(err, client){
		if(err) console.error(err);
		const db = client.db(mdb);
		const collection = db.collection('votes');
		collection.remove({ipaddress : body.ipaddress, agent : body.agent, stage : body.stage, week : body.week}, function(err){
			if(err) console.error(err);
			collection.insert(body, function(err, result){
				if(err) console.error(err);
				client.close();
			});
		});
	});
	res.sendFile(path.join(__dirname, 'public/thanks.html'));
});

app.get('/result', function(req, res){
	let stage = parseInt(req.query.stage), week = parseInt(req.query.week);
	if(!stage && !week) return res.redirect('/result?stage='+sw().stage+'&week='+sw().week);
	if(!stage) return res.redirect('/result?stage='+sw().stage+'&week='+week);
	if(!week) return res.redirect('/result?stage='+stage+'&week=1');
	if(Number.isInteger(stage) && Number.isInteger(week) && 1 <= stage && stage <= 4 && 1 <= week && week <= 5
		&& 10*stage + week <= 10*sw().stage + sw().week){
		res.sendFile(path.join(__dirname, 'public/result.html'));
	}else{
		res.redirect('/result_error');
	}
});

app.get('/result_error', function(req, res){
	res.sendFile(path.join(__dirname, 'public/result_error.html'));
});

// Votes REST API
const votes = require('./votes.js');
votes(app);

// Stageweek REST API
app.get('/api/stageweek', function(req, res){
	res.json(sw());
});

app.listen(PORT, function(){
	console.log('danielgrants.com is running on port ' + PORT);
});
