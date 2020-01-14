'use strict';

// Post-procesa los slots para que sean válidos cuando hagamos la requests a HANA
function process_dimensions(slots){
    var Country = slots.Country;
    var Month = slots.Month;
    var Year = slots.Year;

    var numero = 0;
    if (Month == 'Janaury' || Month == 'janaury') numero = 1;
    else if (Month == 'February' || Month == 'february') numero = 2;
    else if (Month == 'May' || Month == 'may') numero = 3;
    else if (Month == 'April' || Month == 'april') numero = 4;
    else if (Month == 'June' || Month == 'june') numero = 5;
    else if (Month == 'July' || Month == 'july') numero = 6;
    else if (Month == 'Janaury' || Month == 'janaury') numero = 7;
    else if (Month == 'August' || Month == 'august') numero = 8;
    else if (Month == 'September' || Month == 'september') numero = 9;
    else if (Month == 'October' || Month == 'october') numero = 10;
    else if (Month == 'November' || Month == 'november') numero = 11;
    else numero = 12;

    var filter_string = new String();
    var primero = true;

    if (Country != null) {
        filter_string = (`﻿Country eq '${Country}'`);
        primero = false;
    }
    if (Month != null && (numero >= 1 && numero <= 12)) {
        if (primero){
            filter_string += ('Month eq ');
            primero = false;
        }
        else filter_string += (' and Month eq ');
        filter_string += numero;
    }
    if (Year != null && (Year >= 2017 && Year <= 2019)) {
        if (primero){
            filter_string += ('Year eq ');
            primero = false;
        }
        else filter_string += (' and Year eq ');
        filter_string += Year;
    }
    return filter_string;
}

// Envía una request a la BD de HANA con el KPI y las dimensiones que hayamos extraído de LEX
function postman_request(KPI, slots, callback) {
    var request = require("request");

    var dimensions = process_dimensions(slots);
    var options = { method: 'GET',
        url: 'https://ajmac1bfe500.hana.ondemand.com/POC/service.xsodata/sales',
        qs:
            { '$format': 'json',
                '$filter': dimensions.replace("\\",""),
                '$select': KPI },
        headers:
            { 'cache-control': 'no-cache',
                Connection: 'keep-alive',
                'Accept-Encoding': 'utf8',
                Host: 'ajmac1bfe500.hana.ondemand.com',
                'Postman-Token': '0072164b-57c1-4bda-af44-1f685688d2a8,9046507a-c8a3-4398-a7ff-5480ed83e08f',                
                'Cache-Control': 'no-cache',
                 Accept: '*/*',
                 Authorization: 'Basic UE9DOnBvY0ZJQjAxMjM0NTY3ODk=' } };

    request(options, function (error, response, body) {
        if (error) {
            callback(-1);
        }
        else {
            var jsonbody = JSON.parse(body);
            callback(jsonbody.d.results[0][KPI]);
        }
        
    });
}

// Close dialog with the customer, reporting fulfillmentState of Failed or Fulfilled ("Thanks, your pizza will arrive in 20 minutes")
function close(sessionAttributes, fulfillmentState, message) {
    return {
        sessionAttributes,
        dialogAction: {
            type: 'Close',
            fulfillmentState,
            message,
        },
    };
}


// Envia a la base de datos de sugerencia la nueva consulta con KPI y valores
function sendKPI(values)
{    
    var request = require("request"); 
    request.post({
    headers: {'content-type' : 'application/json'},
    url:     'http://vps764501.ovh.net:3000/rcmnd',
    body:    values,
    json: true
    }, function(error, response, body){
        if(error)
            throw error;

    });
}


// Recive la lista de sugerencias que nos retorne el sistema
function getSug(callback)
{    
    var request = require("request");
    request({url:'http://vps764501.ovh.net:3000/rcmnd/lastsug'}, function(error, response, body) {
        if(error)
            throw error;
        else {
            var jsonbody = JSON.parse(body);
            callback(jsonbody.result);
        }
    });
}


// --------------- Events -----------------------
function dispatch(intentRequest, callback) {
    const sessionAttributes = intentRequest.sessionAttributes;
    const slots = intentRequest.currentIntent.slots;
    try {

        if (slots.Index == null) {
            //Debemos ir a buscar la sugerencia
            getSug(function(suggestion) {
                if (suggestion.length == 0 || suggestion == undefined) { //No ha encontrado sugerencia. Motivos: Tiempo o no vista anterioremente
                    callback(close(sessionAttributes, 'Fulfilled', {'contentType': 'PlainText', 
                        'content': "Sorry, we don't have any suggestion right now :("
                    }));
                }
                else { //Retornamos "lista de sugerencias"
                    var list = "If you want to receive the result of one listened suggestion, introduce his index (1, 2, ...). Otherwise 0 \n";

                    suggestion.forEach(function(currentValue, index) {
                        
                        list += "\n ";
                        list += (index+1 + ". Value of kpi: " + currentValue.kpi + " ");

                        if (currentValue.country != null) {
                            list += ("with Country: " + currentValue.country + " ");
                        }
                        if (currentValue.month != null) {
                            list += ("with Month: " + currentValue.month + " ");
                        }
                        if (currentValue.year != null) {
                            list += ("with Year: " + currentValue.year + " ");
                        }
                    });

                    callback( 
                    {
                        "dialogAction": {
                            "type": "ElicitSlot",
                            "message": {
                              "contentType": "PlainText",
                              "content": list
                            },
                           "intentName": intentRequest.currentIntent.name,
                           "slots": {
                              "Index": null  
                           },
                           "slotToElicit" : "Index"
                       }
                    });
                }
            });
        }
        else {
            //Debemos consultar a Hana con el índice que nos haya pasado el usuario
            var index = slots.Index - 1;
            if (index == -1) {
                callback(close(sessionAttributes, 'Fulfilled', {'contentType': 'PlainText', 
                            'content': "We are sorry for that :("
                    }));
            }
            else {
                getSug(function(suggestion) {
                    var values2 = { Month: suggestion[index].month || null, Year: suggestion[index].year || null, Country: suggestion[index].country || null };
                    postman_request(suggestion[index].kpi, values2, function (results) {

                        callback(close(sessionAttributes, 'Fulfilled', {'contentType': 'PlainText', 
                            'content': `Result for this suggestion: ${results}`
                        }));
                    });
                });
            }
        }
    }
    catch(err){
        console.dir(err);
    }

}

// --------------- Main handler -----------------------

// Route the incoming request based on intent.
// The JSON body of the request is provided in the event slot.
exports.handler = (event, context, callback) => {
    try {
        dispatch(event,
            (response) => {
                callback(null, response);
            });
    } catch (err) {
        callback(err);
    }
};