const { MongoClient } = require('mongodb');
const { Client } = require('pg');
const config = require('../config');

async function withPGTransaction1(client, title, callback) {
  console.log('开始迁移', title);
  await client.query('BEGIN');
  try {
    await callback();
    await client.query('COMMIT');
    console.log(title, '迁移成功');
  } catch(e) {
    console.log(title, '迁移失败， 回滚', e.message);
    await client.query('ROLLBACK');
  }
}

function withPGTransaction(client, title, callback) {
  return callback();
}

async function main() {
  const mongoClient = new MongoClient(config.MONGO_ADDR);
  const pgClient = new Client(config.pg);
  await pgClient.connect();

  console.log('执行');
  await withPGTransaction1(pgClient, 'userName', async() => {
    const src_Table = mongoClient.db().collection('users');
    await Promise.all((await src_Table.find({}).toArray()).map(async (item) => {
      return await pgClient.query('update users set userName=$1 where _id = $2', [item.userName, item._id]);
    }));
  });
  // await withPGTransaction1(pgClient, 'global', async () => {
  //   await withPGTransaction(pgClient, 'user', async () => {
  //     const src_Table = mongoClient.db().collection('users');
  //     const dst_Table = 'users';
  //     const src_fields = ['_id', 'username', 'avatar', 'phone', 'githubUserId', 'password', 'defaultTableId', 'createDate'];
  //     const dst_fields = src_fields;

  //     const queryText = `insert into ${dst_Table}(${src_fields.join(',')}) values(${src_fields.map((_, index) => '$' + (index + 1)).join(',')})`;
  //     await Promise.all((await src_Table.find({}).toArray()).map(async (item) => {
  //       await pgClient.query(queryText, src_fields.map((field) => {
  //         return item[field];
  //       }));
  //     }));
  //   });

  //   await withPGTransaction(pgClient, 'suggest', async () => {
  //     const src_Table = mongoClient.db().collection('suggest');
  //     const dst_Table = 'suggests';
  //     const src_fields = ['content', 'sender', 'uid'];
  //     const dst_fields = ['content', 'sender', 'uid'];

  //     const queryText = `insert into ${dst_Table}(${src_fields.join(',')}) values(${src_fields.map((_, index) => '$' + (index + 1)).join(',')})`;
  //     await Promise.all((await src_Table.find({}).toArray()).map(async (item) => {
  //       await pgClient.query(queryText, src_fields.map((field) => {
  //         return item[field];
  //       }));
  //     }));
  //   });

  //   await withPGTransaction(pgClient, 'session', async () => {
  //     const src_Table = mongoClient.db().collection('session');
  //     const dst_Table = 'sessions';
  //     const src_fields = ['expire', 'token', 'uid'];
  //     const dst_fields = src_fields;

  //     const queryText = `insert into ${dst_Table}(${src_fields.join(',')}) values(${src_fields.map((_, index) => '$' + (index + 1)).join(',')})`;
  //     await Promise.all((await src_Table.find({}).toArray()).map(async (item) => {
  //       await pgClient.query(queryText, src_fields.map((field) => {
  //         return item[field];
  //       }));
  //     }));
  //   });

  //   await withPGTransaction(pgClient, 'list', async () => {
  //     const src_Table = mongoClient.db().collection('list');
  //     const dst_Table = 'snapshots';
  //     const src_fields = ['collection', 'doc_id', 'doc_type', 'version', 'data'];
  //     const dst_fields = src_fields;

  //     const queryText = `insert into ${dst_Table}(${src_fields.join(',')}) values(${src_fields.map((_, index) => '$' + (index + 1)).join(',')})`;
  //     await Promise.all((await src_Table.find({}).toArray()).map(async (item) => {
  //       return await pgClient.query(queryText, src_fields.map((field) => {
  //         switch (field) {
  //         case 'collection':
  //           return 'list';
  //         case 'doc_id':
  //           return item._id;
  //         case 'version':
  //           return 1;
  //         case 'doc_type':
  //           return item._type || 'http://sharejs.org/types/JSONv1';
  //         case 'data':
  //           return JSON.stringify(item);
  //         }
  //       }));
  //     }));
  //   });

  //   await withPGTransaction(pgClient, 'item', async () => {
  //     const src_Table = mongoClient.db().collection('item');
  //     const dst_Table = 'snapshots';
  //     const src_fields = ['collection', 'doc_id', 'doc_type', 'version', 'data'];
  //     const dst_fields = src_fields;

  //     const queryText = `insert into ${dst_Table}(${src_fields.join(',')}) values(${src_fields.map((_, index) => '$' + (index + 1)).join(',')})`;
  //     await Promise.all((await src_Table.find({}).toArray()).map(async (item) => {
  //       return await pgClient.query(queryText, src_fields.map((field) => {
  //         switch (field) {
  //         case 'collection':
  //           return 'item';
  //         case 'doc_id':
  //           return item._id;
  //         case 'version':
  //           return 1;
  //         case 'doc_type':
  //           return item._type || 'http://sharejs.org/types/JSONv1';
  //         case 'data':
  //           return JSON.stringify(item);
  //         }
  //       }));
  //     }));
  //   });

  //   await withPGTransaction(pgClient, 'agenda', async () => {
  //     const src_Table = mongoClient.db().collection('agent');
  //     const dst_Table = 'snapshots';
  //     const src_fields = ['collection', 'doc_id', 'doc_type', 'version', 'data'];
  //     const dst_fields = src_fields;

  //     const queryText = `insert into ${dst_Table}(${src_fields.join(',')}) values(${src_fields.map((_, index) => '$' + (index + 1)).join(',')})`;
  //     await Promise.all((await src_Table.find({}).toArray()).map(async (item) => {
  //       await pgClient.query(queryText, src_fields.map((field) => {
  //         switch (field) {
  //         case 'collection':
  //           return 'agent';
  //         case 'doc_id':
  //           return item._id;
  //         case 'version':
  //           return 1;
  //         case 'doc_type':
  //           return item._type;
  //         case 'data':
  //           return JSON.stringify(item);
  //         }
  //       }));
  //     }));
  //   });
  // });
  console.log('结束');
  await pgClient.end();
}

main();
