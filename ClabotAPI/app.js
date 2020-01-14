const express = require('express');
const cors = require('cors');
const sugerencias = require('./sugerencias');
const app = express();


app.use(cors());
app.use(express.json());

app.post('/rcmnd',function(req,res){	
	/*var values = {
		kpi : req.body.kpi, 
		country: req.body.country,
		month: req.body.month,  
		year: req.body.year
	};*/
	var values = req.body;
	sugerencias.addNewKPI(values);
	res.status(200).json({
		originalQuerry: req.body
	});
});

app.get('/rcmnd',function(req,res){	
	var values = {
		kpiA : req.query.kpi, 
		countryA: req.query.country,
		monthA: req.query.month,  
		yearA: req.query.year, 
	};
	sugerencias.getSug(values , function(results){
		res.status(200).json({
			result: results,
			originalQuerry: req.query
		});
	});
});
app.get('/rcmnd/hist',function(req,res){	
	sugerencias.getHist(req.query.date | -1,req.query.t | 1,function(results){
		res.status(200).json({
			result: results,
			dateNow: new Date(),
			originalQuerry: req.query
		});
	});
});

app.get('/rcmnd/status',function(req,res){	
	sugerencias.getStatus(function(results){
		res.status(200).json({
			results
		});
	});
});

app.get('/rcmnd/lastsug',function(req,res){	
	sugerencias.getLastRecomend(function(results, last){
		res.status(200).json({
			result: results,
			lastQuery: last,
			dateNow: new Date(),
			originalQuerry: req.query
		});
	});
});

app.delete('/rcmnd',function(req,res){	
	console.log('Recibido comando para elimnar.');
	var error = sugerencias.resetTable(req.body.passwd);
	res.status(200).json({
		dateNow: new Date(),
		error: error,
		originalQuerry: req.body
	});
});

module.exports = app;