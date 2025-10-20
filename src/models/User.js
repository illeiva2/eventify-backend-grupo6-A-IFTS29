import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: String,
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('User', UserSchema);
