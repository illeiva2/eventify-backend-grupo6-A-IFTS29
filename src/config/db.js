import mongoose from 'mongoose';
import 'dotenv/config';

const DEFAULT_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
const DEFAULT_DB_NAME = process.env.DB_NAME || 'Eventify';

let connecting = null;

async function connectDB(uri = process.env.MONGODB_URI || DEFAULT_URI, dbName = process.env.DB_NAME || DEFAULT_DB_NAME) {
  if (mongoose.connection && mongoose.connection.readyState === 1) {
    return mongoose.connection.db;
  }

  if (connecting) return connecting;

  connecting = (async () => {
    try {
      mongoose.set('strictQuery', false);
      await mongoose.connect(uri, {
        dbName,
      });
      return mongoose.connection.db;
    } catch (err) {
      try { await mongoose.disconnect(); } catch (_) {}
      throw err;
    } finally {
      connecting = null;
    }
  })();

  return connecting;
}

async function closeDB() {
  if (mongoose.connection && mongoose.connection.readyState === 1) {
    await mongoose.disconnect();
  }
}

export default connectDB;
export { closeDB, mongoose };