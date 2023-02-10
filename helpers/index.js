const { MongoClient } = require('mongodb');
const config = require('../config');

const client = new MongoClient(config.MONGO_ADDR);

module.exports = {
  db: client.db(config.MONGO_DB_NAME)
};
