import { v4 as uuid } from 'uuid';
import JsonDB from '../services/jsonDb.js';
import Tarea from '../models/Tarea.js';

const tareasDb = new JsonDB('tareas.json', []);
const empleadosDb = new JsonDB('empleados.json', []);
const areasDb = new JsonDB('areas.json', []);
const eventosDb = new JsonDB('eventos.json', []);
const clientsDb = new JsonDB('clients.json', []);

export async function list(req, res) {
  let tareas = await tareasDb.getAll();
  const empleados = await empleadosDb.getAll();
  const areas = await areasDb.getAll();
  const eventos = await eventosDb.getAll();
  const clients = await clientsDb.getAll();

  // Apply filters
  const { status, priority, assigneeId, eventId, clientId, startDate, endDate } = req.query;
  
  if (status) {
    tareas = tareas.filter(t => t.status === status);
  }
  if (priority) {
    tareas = tareas.filter(t => t.priority === priority);
  }
  if (assigneeId) {
    tareas = tareas.filter(t => t.assigneeId === assigneeId);
  }
  if (eventId) {
    tareas = tareas.filter(t => t.eventId === eventId);
  }
  if (clientId) {
    tareas = tareas.filter(t => t.clientId === clientId);
  }
  if (startDate) {
    tareas = tareas.filter(t => t.startDate >= startDate);
  }
  if (endDate) {
    tareas = tareas.filter(t => t.endDate <= endDate);
  }

  // Enrich tareas with related data
  const tareasEnriched = tareas.map(tarea => {
    const empleado = empleados.find(e => e.id === tarea.assigneeId);
    const area = areas.find(a => a.id === tarea.areaId);
    const evento = eventos.find(e => e.id === tarea.eventId);
    const client = clients.find(c => c.id === tarea.clientId);
    
    return {
      ...tarea,
      empleadoName: empleado ? empleado.name : 'N/A',
      areaName: area ? area.name : 'N/A',
      eventoName: evento ? evento.name : 'N/A',
      clientName: client ? client.name : 'N/A'
    };
  });

  res.render('tareas/list', { 
    tareas: tareasEnriched, 
    empleados, 
    areas, 
    eventos, 
    clients,
    filters: req.query 
  });
}

export async function detail(req, res, next) {
  const tarea = await tareasDb.getById(req.params.id);
  if (!tarea) return next({ status: 404, message: 'Tarea not found' });
  
  const empleados = await empleadosDb.getAll();
  const areas = await areasDb.getAll();
  const eventos = await eventosDb.getAll();
  const clients = await clientsDb.getAll();
  
  const empleado = empleados.find(e => e.id === tarea.assigneeId);
  const area = areas.find(a => a.id === tarea.areaId);
  const evento = eventos.find(e => e.id === tarea.eventId);
  const client = clients.find(c => c.id === tarea.clientId);
  
  res.render('tareas/detail', { 
    tarea, 
    empleado: empleado || null,
    area: area || null,
    evento: evento || null,
    client: client || null
  });
}

export async function newForm(req, res) {
  const empleados = await empleadosDb.getAll();
  const areas = await areasDb.getAll();
  const eventos = await eventosDb.getAll();
  const clients = await clientsDb.getAll();
  res.render('tareas/form', { empleados, areas, eventos, clients, tarea: null });
}

export async function create(req, res) {
  const { 
    title, 
    description, 
    status, 
    priority, 
    startDate, 
    endDate, 
    assigneeId, 
    areaId, 
    eventId, 
    clientId, 
    estimatedHours 
  } = req.body;
  
  if (!title || !assigneeId || !areaId) {
    const empleados = await empleadosDb.getAll();
    const areas = await areasDb.getAll();
    const eventos = await eventosDb.getAll();
    const clients = await clientsDb.getAll();
    return res.status(400).render('tareas/form', { 
      empleados, 
      areas, 
      eventos, 
      clients, 
      tarea: req.body, 
      error: 'Título, empleado asignado y área son obligatorios.' 
    });
  }

  const tarea = new Tarea({ 
    id: uuid(), 
    title, 
    description, 
    status: status || 'pending', 
    priority: priority || 'medium', 
    startDate, 
    endDate, 
    assigneeId, 
    areaId, 
    eventId: eventId || null, 
    clientId: clientId || null, 
    estimatedHours: parseInt(estimatedHours) || 0 
  });
  
  await tareasDb.create(tarea);
  res.redirect('/tareas');
}

export async function editForm(req, res, next) {
  const tarea = await tareasDb.getById(req.params.id);
  if (!tarea) return next({ status: 404, message: 'Tarea not found' });
  
  const empleados = await empleadosDb.getAll();
  const areas = await areasDb.getAll();
  const eventos = await eventosDb.getAll();
  const clients = await clientsDb.getAll();
  res.render('tareas/form', { tarea, empleados, areas, eventos, clients });
}

export async function update(req, res, next) {
  const { 
    title, 
    description, 
    status, 
    priority, 
    startDate, 
    endDate, 
    assigneeId, 
    areaId, 
    eventId, 
    clientId, 
    estimatedHours, 
    actualHours 
  } = req.body;
  
  const updated = await tareasDb.update(req.params.id, { 
    title, 
    description, 
    status, 
    priority, 
    startDate, 
    endDate, 
    assigneeId, 
    areaId, 
    eventId: eventId || null, 
    clientId: clientId || null, 
    estimatedHours: parseInt(estimatedHours) || 0, 
    actualHours: parseInt(actualHours) || 0, 
    updatedAt: new Date().toISOString() 
  });
  
  if (!updated) return next({ status: 404, message: 'Tarea not found' });
  res.redirect('/tareas/' + req.params.id);
}

export async function remove(req, res, next) {
  const ok = await tareasDb.remove(req.params.id);
  if (!ok) return next({ status: 404, message: 'Tarea not found' });
  res.redirect('/tareas');
}