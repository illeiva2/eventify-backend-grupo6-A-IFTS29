import { v4 as uuid } from 'uuid';
import JsonDB from '../services/jsonDb.js';
import Evento from '../models/Evento.js';

const eventosDb = new JsonDB('eventos.json', []);
const clientsDb = new JsonDB('clients.json', []);

export async function list(req, res) {
  const eventos = await eventosDb.getAll();
  const clients = await clientsDb.getAll();
  
  // Enrich eventos with client names
  const eventosEnriched = eventos.map(evento => {
    const client = clients.find(c => c.id === evento.clientId);
    return {
      ...evento,
      clientName: client ? client.name : 'N/A'
    };
  });
  
  res.render('eventos/list', { eventos: eventosEnriched, clients });
}

export async function detail(req, res, next) {
  const evento = await eventosDb.getById(req.params.id);
  if (!evento) return next({ status: 404, message: 'Evento not found' });
  
  const clients = await clientsDb.getAll();
  const client = clients.find(c => c.id === evento.clientId);
  
  res.render('eventos/detail', { 
    evento, 
    client: client || null 
  });
}

export async function newForm(req, res) {
  const clients = await clientsDb.getAll();
  res.render('eventos/form', { clients, evento: null });
}

export async function create(req, res) {
  const { name, location, date, budget, clientId, status } = req.body;
  if (!name || !location || !date || !budget || !clientId) {
    const clients = await clientsDb.getAll();
    return res.status(400).render('eventos/form', { 
      clients, 
      evento: req.body, 
      error: 'Nombre, ubicación, fecha, presupuesto y cliente son obligatorios.' 
    });
  }

  const evento = new Evento({ 
    id: uuid(), 
    name, 
    location, 
    date, 
    budget: parseFloat(budget), 
    clientId, 
    status: status || 'planning' 
  });
  await eventosDb.create(evento);
  res.redirect('/eventos');
}

export async function editForm(req, res, next) {
  const evento = await eventosDb.getById(req.params.id);
  if (!evento) return next({ status: 404, message: 'Evento not found' });
  
  const clients = await clientsDb.getAll();
  res.render('eventos/form', { evento, clients });
}

export async function update(req, res, next) {
  const { name, location, date, budget, clientId, status } = req.body;
  const updated = await eventosDb.update(req.params.id, { 
    name, 
    location, 
    date, 
    budget: parseFloat(budget), 
    clientId, 
    status, 
    updatedAt: new Date().toISOString() 
  });
  if (!updated) return next({ status: 404, message: 'Evento not found' });
  res.redirect('/eventos/' + req.params.id);
}

export async function remove(req, res, next) {
  const ok = await eventosDb.remove(req.params.id);
  if (!ok) return next({ status: 404, message: 'Evento not found' });
  res.redirect('/eventos');
}