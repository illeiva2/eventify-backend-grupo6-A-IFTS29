import JsonDB from '../services/jsonDb.js';
const productsDb = new JsonDB('products.json', []);
const clientsDb = new JsonDB('clients.json', []);

export async function list(req, res) {
  const products = await productsDb.getAll();
  const { clientId } = req.query;
  console.log('Client ID from query:', clientId);

  let client = null;
  if (clientId) {
    const clients = await clientsDb.getAll();
    client = clients.find(c => c.id === clientId) || null;
    console.log('Found client:', client);
  }
  res.render('products/list', { products, client });
}
export async function productsJSON(req, res) {
  const products = await productsDb.getAll();
  res.json(products);
}
