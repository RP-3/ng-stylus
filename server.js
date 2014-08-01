var express = require('express');
var bodyParser = require('body-parser');
var csv = require('ya-csv');

var app = express();

var writer = new csv.CsvWriter(process.stdout);

app.use(bodyParser.json());
app.use(express.static(__dirname + 'index.html'));
app.use(express.static(__dirname));
app.use(function(req, res){
  if(Array.isArray(req.body)){
    writer.writeRecord(req.body);
  }
  res.send(200);
});


app.listen(3000);