
var redis = require('redis');
var uri = process.env.WEPLAY_REDIS_URI || 'localhost:6379';
var auth_password = process.env.WEPLAY_REDIS_AUTH || '';
var pieces = uri.split(':');

module.exports = function(){
  var client =  redis.createClient(pieces[1], pieces[0], { return_buffers: true });
  client.auth(auth_password);
  return client;
};
