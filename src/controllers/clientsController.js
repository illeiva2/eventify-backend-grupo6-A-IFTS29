import { v4 as uuid } from 'uuid';
import JsonDB from '../services/jsonDb.js';
import Client from '../models/Client.js';
const clientsDb = new JsonDB('clients.json', []);

export async function newForm(req, res) {
  res.render('clients/new');
}

export async function create(req, res) {
  const { name, email, phone } = req.body;
  const client = new Client({ id: uuid(), name, email, phone });
  await clientsDb.create(client);
  res.redirect(`/products?clientId=${client.id}`);
}

export async function list(req, res) {
  const clients = await clientsDb.getAll();
  res.render('clients/list', { clients });
}

export async function clientsJSON(req, res) {
  const clients = await clientsDb.getAll();
  res.json(clients);
}