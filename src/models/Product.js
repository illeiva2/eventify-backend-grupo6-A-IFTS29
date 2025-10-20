import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: String,
  price: Number,
  description: String,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Product', ProductSchema);
