import mongoose from 'mongoose';

const ProjectSummarySchema = new mongoose.Schema({
  id: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  name: String
}, { _id: false });

const ClientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: String,
  phone: String,
  projects: [ProjectSummarySchema],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Client', ClientSchema);
