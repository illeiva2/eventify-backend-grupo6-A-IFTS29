import JsonDB from "../services/jsonDb.js";
import { v4 as uuidv4 } from "uuid";
import Product from "../models/Product.js";
const productsDb = new JsonDB("products.json", []);
const clientsDb = new JsonDB("clients.json", []);

// Agregar
export async function create(req, res) {
  const { name, price, category } = req.body;

  const product = new Product({
    id: uuidv4(),
    name,
    price: Number(price),
    category,
    createdAt: new Date().toISOString(),
  });

  await productsDb.create(product);
  res.redirect("/products");
}
// Listar
export async function list(req, res) {
  const products = await productsDb.getAll();
  const { clientId } = req.query;
  console.log("Client ID from query:", clientId);

  let client = null;
  if (clientId) {
    const clients = await clientsDb.getAll();
    client = clients.find((c) => c.id === clientId) || null;
    console.log("Found client:", client);
  }
  res.render("products/list", { products, client });
}
export async function productsJSON(req, res) {
  const products = await productsDb.getAll();
  res.json(products);
}
// Actualizar
export async function update(req, res) {
  const { id } = req.params;
  const { name, price, category } = req.body;

  const product = await productsDb.getById(id);
  if (!product) {
    return res
      .status(404)
      .json({ success: false, message: "Producto no encontrado" });
  }
  product.name = name;
  product.price = price;
  product.category = category;

  const update = await productsDb.update(id, product);
  if (!update) {
    return res
      .status(500)
      .json({ success: false, message: "Error al actualizar el producto" });
  }
  res.json({
    success: true,
    message: "Producto actualizado correctamente",
    product,
  });
}
// Eliminar
export async function remove(req, res) {
  const { id } = req.params;

  const product = await productsDb.getById(id);
  if (!product) {
    return res
      .status(404)
      .json({ success: false, message: "Producto no encontrado" });
  }
  const deleted = await productsDb.remove(id);
  if (!deleted) {
    return res
      .status(500)
      .json({ success: false, message: "Error al eliminar el producto" });
  }
  res.json({ success: true, message: "Producto eliminado correctamente" });
}
