const mongoose = require('mongoose')

const redis = require('redis')
const redisUrl = 'redis://127.0.0.1:6379';
const client = redis.createClient(redisUrl);
const {promisify} = require('util')
client.hget = promisify(client.hget);

const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.cache = function (options = {}) {
    this.useCache = true;
    this.hashKey = JSON.stringify(options.key || '');
    return this
}

mongoose.Query.prototype.exec = async function () {
    const key = JSON.stringify(Object.assign({}, this.getQuery(), {collection: this.mongooseCollection.name}));
    // console.log('key', key);
    if (!this.useCache) {
        return exec.apply(this, arguments)
    }

    const cacheValue = await client.hget(this.hashKey, key);

    if (cacheValue) {
        const doc = JSON.parse(cacheValue);
        console.log('from cache')
        return Array.isArray(doc)
            ? doc.map(d => new this.model(d))
            : new this.model(doc)
    }
    console.log('from mongo')
    const result = await exec.apply(this, arguments)
    client.hset(this.hashKey, key, JSON.stringify(result));
    return result;
}

module.exports = {
    clearHash(hashKey) {
        client.del(JSON.stringify(hashKey));
    }
}