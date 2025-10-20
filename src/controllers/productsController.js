import Product from '../models/Product.js';
import Client from '../models/Client.js';
import { isValidObjectId } from 'mongoose';

async function resolveById(Model, id) {
  if (!id) return null;
  // only resolve by ObjectId — legacyId was removed during migration
  if (isValidObjectId(id)) {
    return await Model.findById(id).exec();
  }
  return null;
}

export async function create(req, res) {
  const { name, price, category } = req.body;
  const product = new Product({
    name,
    price: price ? Number(price) : undefined,
    category,
    createdAt: new Date()
  });
  await product.save();
  res.redirect('/products');
}

export async function list(req, res) {
  const products = await Product.find().lean().exec();
  const { clientId } = req.query;
  let client = null;
  if (clientId) {
    client = await resolveById(Client, clientId);
  }
  res.render('products/list', { products, client });
}

export async function productsJSON(req, res) {
  const products = await Product.find().lean().exec();
  res.json(products);
}

export async function update(req, res) {
  const { id } = req.params;
  const { name, price, category } = req.body;
  const product = await resolveById(Product, id);
  if (!product) return res.status(404).json({ success: false, message: 'Producto no encontrado' });
  product.name = name;
  product.price = price ? Number(price) : product.price;
  product.category = category;
  await product.save();
  res.json({ success: true, message: 'Producto actualizado correctamente', product });
}

export async function remove(req, res) {
  const { id } = req.params;
  const product = await resolveById(Product, id);
  if (!product) return res.status(404).json({ success: false, message: 'Producto no encontrado' });
  await Product.deleteOne({ _id: product._id }).exec();
  res.json({ success: true, message: 'Producto eliminado correctamente' });
}
