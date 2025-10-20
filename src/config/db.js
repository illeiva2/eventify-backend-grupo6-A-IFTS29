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
    console.log(`MongoDB connected: ${uri}`);
    return mongoose.connection;
  } catch (err) {
    console.error('MongoDB connection error:', err.message || err);
    throw err;
  }
}

export default connectDB;
