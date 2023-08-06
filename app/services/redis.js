// redisSingleton.js
const Redis = require("ioredis");

class RedisSingleton {
  constructor() {
    if (!RedisSingleton.instance) {
      this.client = new Redis({
        host: "redis-server",
        port: 6379,
      });

      // Optionally, you can add event handlers or perform other setup tasks here.

      RedisSingleton.instance = this;
    }

    return RedisSingleton.instance;
  }
}

module.exports = new RedisSingleton();
