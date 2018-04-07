const mongo = require('mongodb').MongoClient;

const PORT = process.env.PORT || 8081;
const murl = 'mongodb://localhost:27017';
const mdb = 'rankings';

module.exports = function(app, REST_ROUTE = '/api'){
	REST_ROUTE += '/votes';

	app.get(REST_ROUTE, function(req, res){
		mongo.connect(murl, function(err, client){
			const db = client.db(mdb);
			const collection = db.collection('votes');
			collection.find({}, { /*"projection" : {"teams": 1, "offense": 1, "tank": 1, "flex" : 1, "support": 1}*/}).toArray(function(err, result){
				if(err) console.error(err);
				client.close();
				res.json(result);
			});
		});
	});

	/* app.post(REST_ROUTE, function(req, res){
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
		res.json(body);
	}); */
}
