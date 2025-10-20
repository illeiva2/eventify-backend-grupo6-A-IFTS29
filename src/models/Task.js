import mongoose from 'mongoose';

const AssigneeSchema = new mongoose.Schema({
  id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: String,
  email: String
}, { _id: false });

const DepartmentRefSchema = new mongoose.Schema({
  id: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  name: String
}, { _id: false });

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  status: { type: String, enum: ['pending', 'in-progress', 'done', 'cancelled'], default: 'pending' },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  assigneeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  assignee: AssigneeSchema,
  department: DepartmentRefSchema,
  dueDate: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

TaskSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('Task', TaskSchema);
