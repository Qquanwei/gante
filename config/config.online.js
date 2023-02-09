const mongo_uname = process.env.GANTE_MONGO_UNAME;
const mongo_pass = process.env.GANTE_MONGO_PASS;

module.exports = {
  MONGO_ADDR: `mongodb://${mongo_uname}:${mongo_pass}@dds-bp10dc1f0e38fad41.mongodb.rds.aliyuncs.com:3717/gante_store?authSource=admin`
};
