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


export async function remove(req, res) {
  const { id } = req.params;
  const client = await clientsDb.getById(id); 
  const deleted = await clientsDb.remove(id);
  if (deleted && client) {
    res.json({ success: true, message: 'Cliente eliminado correctamente', name:client.name });
  } else {
    res.status(404).json({ success: false, message: 'Cliente no encontrado' });
  }
}

// update
export async function update(req, res){
  const {id} = req.params;
  const {name, email, phone} = req.body;

  const client = await clientsDb.getById(id);
  if (!client){
    return res.status(404).json({success: false, message: 'Cliente no encontrado'});

  }
  // Actualizamos los campos
  client.name = name;
  client.email = email;
  client.phone = phone;


  await clientsDb.update(id, client);
  res.json({success: true, message: 'Cliente actualizado con éxito', client})
}