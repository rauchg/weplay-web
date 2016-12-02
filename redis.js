import redis from 'redis';
const uri = process.env.WEPLAY_REDIS_URI || 'localhost:6379';
const pieces = uri.split(':');

export default () => {
  const host = pieces[0];
  const port = pieces[1] || 6379;
  const redisClient = redis.createClient(port, host, {return_buffers: true});
  redisClient.on('connect', () => {
    console.log(`Redis connected to ${host}:${port}`);
  });
  redisClient.on('error', err => {
    console.error('Redis error ', err);
  });
  return redisClient;
};
