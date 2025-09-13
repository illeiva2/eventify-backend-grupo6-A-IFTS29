import { v4 as uuid } from 'uuid';
import JsonDB from '../services/jsonDb.js';
import Empleado from '../models/Empleado.js';

const empleadosDb = new JsonDB('empleados.json', []);
const rolesDb = new JsonDB('roles.json', []);
const areasDb = new JsonDB('areas.json', []);

export async function list(req, res) {
  const empleados = await empleadosDb.getAll();
  const roles = await rolesDb.getAll();
  const areas = await areasDb.getAll();
  
  // Enrich empleados with role and area names
  const empleadosEnriched = empleados.map(empleado => {
    const role = roles.find(r => r.id === empleado.roleId);
    const area = areas.find(a => a.id === empleado.areaId);
    return {
      ...empleado,
      roleName: role ? role.name : 'N/A',
      areaName: area ? area.name : 'N/A'
    };
  });
  
  res.render('empleados/list', { empleados: empleadosEnriched, roles, areas });
}

export async function detail(req, res, next) {
  const empleado = await empleadosDb.getById(req.params.id);
  if (!empleado) return next({ status: 404, message: 'Empleado not found' });
  
  const roles = await rolesDb.getAll();
  const areas = await areasDb.getAll();
  const role = roles.find(r => r.id === empleado.roleId);
  const area = areas.find(a => a.id === empleado.areaId);
  
  res.render('empleados/detail', { 
    empleado, 
    role: role || null, 
    area: area || null 
  });
}

export async function newForm(req, res) {
  const roles = await rolesDb.getAll();
  const areas = await areasDb.getAll();
  res.render('empleados/form', { roles, areas, empleado: null });
}

export async function create(req, res) {
  const { name, email, roleId, areaId } = req.body;
  if (!name || !email || !roleId || !areaId) {
    const roles = await rolesDb.getAll();
    const areas = await areasDb.getAll();
    return res.status(400).render('empleados/form', { 
      roles, 
      areas, 
      empleado: req.body, 
      error: 'Todos los campos son obligatorios.' 
    });
  }

  const empleado = new Empleado({ id: uuid(), name, email, roleId, areaId });
  await empleadosDb.create(empleado);
  res.redirect('/empleados');
}

export async function editForm(req, res, next) {
  const empleado = await empleadosDb.getById(req.params.id);
  if (!empleado) return next({ status: 404, message: 'Empleado not found' });
  
  const roles = await rolesDb.getAll();
  const areas = await areasDb.getAll();
  res.render('empleados/form', { empleado, roles, areas });
}

export async function update(req, res, next) {
  const { name, email, roleId, areaId } = req.body;
  const updated = await empleadosDb.update(req.params.id, { 
    name, 
    email, 
    roleId, 
    areaId, 
    updatedAt: new Date().toISOString() 
  });
  if (!updated) return next({ status: 404, message: 'Empleado not found' });
  res.redirect('/empleados/' + req.params.id);
}

export async function remove(req, res, next) {
  const ok = await empleadosDb.remove(req.params.id);
  if (!ok) return next({ status: 404, message: 'Empleado not found' });
  res.redirect('/empleados');
}