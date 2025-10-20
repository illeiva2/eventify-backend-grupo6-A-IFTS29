import mongoose from 'mongoose';

const DEFAULT_URI = 'mongodb://127.0.0.1:27017/eventify';

async function connectDB(uri = process.env.MONGODB_URI || DEFAULT_URI) {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    return mongoose.connection;
  } catch (err) {
    throw err;
  }
}

export default connectDB;
