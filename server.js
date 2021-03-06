var express = require( 'express' );
var app = express();
var path = require('path');
var https = require('https');
var http = require('http');

app.use(express.static('client/build'));

app.get( '/', function( req, res ) {
  res.sendFile(path.join(__dirname + '/client/build/index.html'));
});

app.listen( process.env.PORT || 3030, function() {
  console.log( 'listening on 3030!' )
});
