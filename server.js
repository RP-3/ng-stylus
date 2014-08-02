var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var brain = require('brain');
var net = new brain.NeuralNetwork();
var fs = require('fs');
var startingData = require('./symbols.js');


var retrain = function(){
  var result = net.train(startingData, {
    errorThresh: 0.005,  // error threshold to reach
    iterations: 20000,   // maximum training iterations
    log: true,           // console.log() progress periodically
    logPeriod: 5,       // number of iterations between logging
    learningRate: 0.2    // learning rate
  });

  console.log(result);
};

var parseResults = function(resultsObj){
  var result = [];
  for(var key in resultsObj){
    var character = String.fromCharCode(key);
    var obj = {};
    obj[character] = resultsObj[key];
    result.push(obj);
  }
  result.sort(function(a, b){
    return b[Object.keys(b)[0]] - a[Object.keys(a)[0]];
  });

  return result.splice(0, 3);

};

retrain();

app.use(bodyParser.json());
app.use(express.static(__dirname + 'index.html'));
app.use(express.static(__dirname));

app.post('/', function(req, res){
  if(Object.keys(req.body.output)[0] === "NaN"){
    var result = net.run(req.body.input);
    console.log(parseResults(result));
    res.send(parseResults(result));
  }else{
    startingData.push(req.body); //add to the in-memory data store
    fs.appendFile('symbols.js', "  " + JSON.stringify(req.body) + ",\n", function(err){
      if(err) console.log(err); //write to a permanent storage of some kind
    });

    if(startingData.length % 10 === 0){
      retrain(); //only retrain once every 10 new items
    }
    res.send(200);
  }
});


app.listen(3000);