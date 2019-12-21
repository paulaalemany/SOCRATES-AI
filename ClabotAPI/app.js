const express = require('express');
const cors = require('cors');
const sugerencias = require('./sugerencias');
const app = express();


app.use(cors());
app.use(express.json());

app.post('/',function(req,res){	
	res.status(200).json({
		usr: req.body.usr || "usr missing from query",
		msg: req.body.msg || "msg missing from query",
		type: "text", 
		originalQuerry: req.body
	});
});

app.post('/rcmnd',function(req,res){	
	var values = {
		kpi : req.body.kpi, 
		country: req.body.country,
		month: req.body.month,  
		year: req.body.year
	}
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
	  }
	sugerencias.getSug(values , function(results){
		res.status(200).json({
			result: results,
			originalQuerry: req.query
		});
	});
});
app.get('/rcmnd/hist',function(req,res){	
	sugerencias.getHist(req.query.date,function(results){
		res.status(200).json({
			result: results,
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
//DEPRECATED: Mantengo el soporte por si alguien ya lo estaba usando.
app.get('/', function(req,res){	
	res.status(200).json({
		alert: "This service now uses POST for the requests.",
		usr: req.query.usr || "usr missing from query",
		msg: req.query.msg || "msg missing from query",
		type: "text",
		originalQuerry: req.query
	});
});

module.exports = app;