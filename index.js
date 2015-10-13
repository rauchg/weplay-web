
var browserify = require('browserify-middleware');
var mustache = require('mustache-express');
var express = require('express');
var app = express();

var port = process.env.WEPLAY_WEB_PORT || 3000;

var redis = require('./redis')();

process.title = 'weplay-web';

app.listen(port);
console.log('listening on *:' + port);

app.engine('mustache', mustache());
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));

if ('development' == process.env.NODE_ENV) {
    app.use('/main.js', browserify('./client/app.js'));

    app.use(function(req, res, next){
        req.socket.on('error', function(err){
        console.error(err.stack);
    });
    next();
    });
}

var iourl = process.env.WEPLAY_IO_URL || 'http://localhost:3001';
var siteurl = process.env.THIS_URL_PORT || 'http://localhost:3000';
app.get('/', function(req, res, next){
  redis.get('weplay:frame', function(err, image){
    if (err) return next(err);
    redis.get('weplay:connections-total', function(err, count){
      if (err) return next(err);
      res.render('index.mustache', {
        img: image.toString('base64'),
        io: iourl,
        connections: count,
        www: siteurl
      });
    });
  });
});

app.get('/screenshot.png', function(req, res, next) {
  redis.get('weplay:frame', function(err, image){
    if (err) return next(err);
    res.writeHead(200, {
      'Content-Type':'image/png',
      'Content-Length': image.length});
    res.end(image);
  });
});
