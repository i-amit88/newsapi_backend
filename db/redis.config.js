import redis from 'express-redis-cache'
const redisCache = redis({
    port: 6379,
    host: "localhost",
    prefix: "caching",
    expire: 60 * 60 // 1 hour
})

redisCache.on('connected', () => {
    console.log('Successfully connected to Redis');
});

redisCache.on('disconnected', () => {
    console.log('Disconnected from Redis');
});

redisCache.on('error', (err) => {
    console.log('Redis error:', err);
});
export default redisCache;