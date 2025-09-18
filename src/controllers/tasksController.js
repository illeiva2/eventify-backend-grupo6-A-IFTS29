import { v4 as uuid } from 'uuid';
import JsonDB from '../services/jsonDb.js';
import Task from '../models/Task.js';
const tasksDb = new JsonDB('tasks.json', []);
const usersDb = new JsonDB('users.json', []);
const departmentsDb = new JsonDB('departments.json', []);
const projectsDb = new JsonDB('projects.json', []);

export async function list(req, res) {
  const tasks = await tasksDb.getAll();
  const departments = await departmentsDb.getAll();
  const users = await usersDb.getAll();
  res.render('tasks/list', { tasks, departments, users });
}

export async function byDepartment(req, res) {
  const { deptId } = req.params;
  const tasks = await tasksDb.filter(t => t.departmentId === deptId);
  const dept = await departmentsDb.getById(deptId);
  res.render('tasks/list', { tasks, currentDept: dept });
}

export async function detail(req, res, next) {
  const task = await tasksDb.getById(req.params.id);
  if (!task) return next({ status: 404, message: 'Task not found' });
  const project = task.projectId ? await projectsDb.getById(task.projectId) : null;
  let department = null;
  let departmentName = '-';
  const deptId = task.departmentId && typeof task.departmentId === 'string' ? task.departmentId.trim() : null;
  if (deptId) {
    department = await departmentsDb.getById(deptId);
    if (!department) {
      // try fuzzy: find by slug or name
      const allDepts = await departmentsDb.getAll();
      department = allDepts.find(d => d.slug === deptId || d.name === deptId) || null;
    }
    if (department) departmentName = department.name;
  }

  let assignee = null;
  let assigneeName = '-';
  const assigneeId = task.assigneeId && typeof task.assigneeId === 'string' ? task.assigneeId.trim() : null;
  if (assigneeId) {
    assignee = await usersDb.getById(assigneeId);
    if (!assignee) {
      const allUsers = await usersDb.getAll();
      assignee = allUsers.find(u => u.id === assigneeId || u.name === assigneeId || u.email === assigneeId) || null;
    }
    if (assignee) assigneeName = assignee.name;
  }

  const statusMap = {
    pending: 'Pendiente',
    'in-progress': 'En progreso',
    done: 'Completada',
    cancelled: 'Cancelada'
  };
  const statusLabel = statusMap[task.status] || (task.status ? task.status : 'Pendiente');

  if (departmentName && typeof departmentName === 'string') departmentName = departmentName.trim();
  if (assigneeName && typeof assigneeName === 'string') assigneeName = assigneeName.trim();

  res.render('tasks/detail', { task, project, departmentName, assigneeName, statusLabel });
}

export async function newForm(req, res) {
  const users = await usersDb.getAll();
  const departments = await departmentsDb.getAll();
  res.render('tasks/form', { users, departments, task: null });
}

export async function create(req, res) {
  const { title, description, departmentId, assigneeId, dueDate, projectId } = req.body;
  if (!title || !departmentId || !assigneeId) {
    const users = await usersDb.getAll();
    const departments = await departmentsDb.getAll();
    return res.status(400).render('tasks/form', { users, departments, task: req.body, error: 'Título, Área y Asignado son obligatorios.' });
  }

  const cleanDept = departmentId === '' ? null : departmentId;
  const cleanAssignee = assigneeId === '' ? null : assigneeId;
  const cleanDue = dueDate === '' ? null : dueDate;

  const task = new Task({ id: uuid(), title, description, departmentId: cleanDept, assigneeId: cleanAssignee, dueDate: cleanDue, projectId });
  await tasksDb.create(task);
  res.redirect('/tasks');
}

export async function editForm(req, res, next) {
  const task = await tasksDb.getById(req.params.id);
  if (!task) return next({ status: 404, message: 'Task not found' });
  const users = await usersDb.getAll();
  const departments = await departmentsDb.getAll();
  res.render('tasks/form', { task, users, departments });
}

export async function update(req, res, next) {
  const { title, description, departmentId, assigneeId, status, dueDate } = req.body;
  const updated = await tasksDb.update(req.params.id, { title, description, departmentId, assigneeId, status, dueDate, updatedAt: new Date().toISOString() });
  if (!updated) return next({ status: 404, message: 'Task not found' });
  res.redirect('/tasks/' + req.params.id);
}

export async function remove(req, res, next) {
  const ok = await tasksDb.remove(req.params.id);
  if (!ok) return next({ status: 404, message: 'Task not found' });
  res.redirect('/tasks');
}

export async function tasksJSON(req, res) {
  const tasks = await tasksDb.getAll();
  res.json(tasks);
}

export async function tasksByUserJSON(req, res) {
  const { userId } = req.params;
  const tasks = await tasksDb.filter(t => t.assigneeId === userId);
  res.json(tasks);
}
