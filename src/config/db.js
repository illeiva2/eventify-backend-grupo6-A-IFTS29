import { MongoClient } from 'mongodb';
import 'dotenv/config';

const DEFAULT_URI = 'PONER_LA_URI_DE_MONGODB_ACA_ESTA_MAL_NO_LO_HAGAS_ROMINA';
const DEFAULT_DB_NAME = 'Eventify';

let client = null;
let db = null;


async function connectDB(uri = process.env.MONGODB_URI || DEFAULT_URI, dbName = process.env.DB_NAME || DEFAULT_DB_NAME) {
  if (db) return db; 
  try {
    client = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    await client.connect();
    db = client.db(dbName);
    return db;
  } catch (err) {
    if (client) {
      try { await client.close(); } catch (_) {}
      client = null;
      db = null;
    }
    throw err;
  }
}

function getClient() {
  return client;
}

async function closeDB() {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
}

export default connectDB;
export { getClient, closeDB };
