import { v4 as uuid } from 'uuid';
import JsonDB from '../services/jsonDb.js';
import Project from '../models/Project.js';


const projectsDb = new JsonDB('projects.json', []);
const clientsDb = new JsonDB('clients.json', []);
const productsDb = new JsonDB('products.json', []);

export async function list(req, res) {
  const projects = await projectsDb.getAll();
  const clients = await clientsDb.getAll();
  const products = await productsDb.getAll();

  // Mostramos los nombres en lugar de los IDs
  const projectsWithNames = projects.map(p => {
    const client = clients.find(c => c.id === p.clientId);
    const product = products.find(pr => pr.id === p.productId);
    return {
      ...p,
      clientName: client ? client.name : 'Cliente no encontrado',
      productName: product ? product.name : 'Producto no encontrado'
    };

  })

  res.render('projects/list', { projects: projectsWithNames });
}

export async function create(req, res) {
  const { clientId, productId, name } = req.body;
  const project = new Project({ id: uuid(), clientId, productId, name });
  await projectsDb.create(project);
  res.redirect('/projects');
}
export async function projectsJSON(req, res) {
  const projects = await projectsDb.getAll();
  res.json(projects);
}
