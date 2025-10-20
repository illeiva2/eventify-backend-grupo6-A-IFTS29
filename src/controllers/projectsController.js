import Project from '../models/Project.js';
import Client from '../models/Client.js';
import Product from '../models/Product.js';
import { isValidObjectId } from 'mongoose';

async function resolveById(Model, id) {
  if (!id) return null;
  if (isValidObjectId(id)) {
    const found = await Model.findById(id).exec();
    if (found) return found;
  }
  return null;
}

export async function list(req, res) {
  const projects = await Project.find().lean().exec();
  // populate names
  const projectsWithNames = await Promise.all(projects.map(async (p) => {
    const client = await resolveById(Client, p.clientId || p.clientId);
    const product = await resolveById(Product, p.productId || p.productId);
    return {
      ...p,
      clientName: client ? client.name : 'Cliente no encontrado',
      productName: product ? product.name : 'Producto no encontrado'
    };
  }));
  res.render('projects/list', { projects: projectsWithNames });
}

export async function create(req, res) {
  const { clientId, productId, name } = req.body;
  const client = await resolveById(Client, clientId);
  const product = await resolveById(Product, productId);
  const project = new Project({
    name,
    clientId: client ? client._id : undefined,
    productId: product ? product._id : undefined,
    createdAt: new Date()
  });
  await project.save();
  res.redirect('/projects');
}

export async function projectsJSON(req, res) {
  const projects = await Project.find().lean().exec();
  res.json(projects);
}
