import mongoose from 'mongoose';

const TaskSummarySchema = new mongoose.Schema({
  id: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
  title: String,
  status: String
}, { _id: false });

const ProjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  description: String,
  status: { type: String, default: 'planned' },
  tasks: [TaskSummarySchema],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Project', ProjectSchema);
