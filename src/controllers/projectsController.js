import { v4 as uuid } from 'uuid';
import JsonDB from '../services/jsonDb.js';
import Project from '../models/Project.js';

const projectsDb = new JsonDB('projects.json', []);

export async function list(req, res) {
  const projects = await projectsDb.getAll();
  res.render('projects/list', { projects });
}

export async function create(req, res) {
  const { clientId, productId, name } = req.body;
  const project = new Project({ id: uuid(), clientId, productId, name });
  await projectsDb.create(project);
  res.redirect('/projects');
}
