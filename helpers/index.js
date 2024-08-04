const { MongoClient } = require('mongodb');
const config = require('../config');

const client = new MongoClient(process.env.GANTE_MONGO_ADDR || config.MONGO_ADDR);

module.exports = {
  db: client.db(config.MONGO_DB_NAME)
};
