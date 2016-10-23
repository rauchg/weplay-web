var redis = require('redis');
var uri = process.env.WEPLAY_REDIS_URI || 'localhost:6379';
var pieces = uri.split(':');

module.exports = function () {
  var host = pieces[0];
  var port = pieces[1] || 6379;
  var redisClient = redis.createClient(port, host, {return_buffers: true})
  redisClient.on('connect', function () {
    console.log('Redis connected to ' + host + ':' + port);
  });
  redisClient.on('error', function (err) {
    console.error('Redis error ', err);
  });
  return redisClient;
};
