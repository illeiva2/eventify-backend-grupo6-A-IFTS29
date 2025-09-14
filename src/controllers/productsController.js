import JsonDB from '../services/jsonDb.js';
const productsDb = new JsonDB('products.json', []);

export async function list(req, res) {
  const products = await productsDb.getAll();
  const { clientId } = req.query;
  res.render('products/list', { products, clientId });
}
export async function productsJSON(req, res) {
  const products = await productsDb.getAll();
  res.json(products);
}
