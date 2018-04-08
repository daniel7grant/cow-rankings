const mongo = require('mongodb').MongoClient;

const PORT = process.env.PORT || 8081;
const murl = 'mongodb://localhost:27017';
const mdb = 'rankings';

module.exports = function(app, REST_ROUTE = '/api'){
	REST_ROUTE += '/votes';

	app.get(REST_ROUTE, function(req, res){
		let query = {};
		if(req.query.week) query.week = parseInt(req.query.week);
		if(req.query.stage) query.stage = parseInt(req.query.stage);
		mongo.connect(murl, function(err, client){
			if(err) console.error(err);
			const db = client.db(mdb);
			const collection = db.collection('votes');
			collection.find(query, { "projection" : {"teams": 1, "offense": 1, "tank": 1, "flex" : 1, "support": 1, "stage": 1, "week": 1}})
				.toArray(function(err, result){
					if(err) console.error(err);
					client.close();
					res.json(result);
				});
		});
	});
}
