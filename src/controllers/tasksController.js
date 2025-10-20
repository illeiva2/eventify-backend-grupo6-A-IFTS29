import { isValidObjectId } from 'mongoose';
import Task from '../models/Task.js';
import User from '../models/User.js';
import Department from '../models/Department.js';
import Project from '../models/Project.js';

async function resolve(Model, id) {
  if (!id) return null;
  if (isValidObjectId(id)) {
    return await Model.findById(id).exec();
  }
  return null;
}

export async function list(req, res) {
  const tasksRaw = await Task.find().lean().exec();
  const departments = await Department.find().lean().exec();
  const users = await User.find().lean().exec();
  const tasks = tasksRaw.map(t => ({
    ...t,
    id: t._id?.toString(),
    dueDate: t.dueDate ? (new Date(t.dueDate)).toISOString().split('T')[0] : null
  }));
  res.render('tasks/list', { tasks, departments, users });
}

export async function byDepartment(req, res) {
  let { deptId } = req.params;
  if (typeof deptId === 'string') deptId = deptId.trim();
  // handle empty or literal 'undefined' param
  if (!deptId || deptId === 'undefined') {
    return res.render('tasks/list', { tasks: [], currentDept: null });
  }

  // try to resolve deptId to ObjectId or legacyId
  const dept = await resolve(Department, deptId);
  if (dept) {
    const tasksRaw = await Task.find({ departmentId: dept._id }).lean().exec();
    const tasks = tasksRaw.map(t => ({
      ...t,
      id: t._id?.toString(),
      dueDate: t.dueDate ? (new Date(t.dueDate)).toISOString().split('T')[0] : null
    }));
    return res.render('tasks/list', { tasks, currentDept: dept });
  }

  // try fuzzy: slug or name
  const allDepts = await Department.find().lean().exec();
  const fuzzy = allDepts.find(d => d.slug === deptId || d.name === deptId) || null;
  if (fuzzy) {
    const tasksRaw = await Task.find({ departmentId: fuzzy._id }).lean().exec();
    const tasks = tasksRaw.map(t => ({
      ...t,
      id: t._id?.toString(),
      dueDate: t.dueDate ? (new Date(t.dueDate)).toISOString().split('T')[0] : null
    }));
    return res.render('tasks/list', { tasks, currentDept: fuzzy });
  }

  // nothing found — render empty
  return res.render('tasks/list', { tasks: [], currentDept: null });
}

export async function detail(req, res, next) {
  const { id } = req.params;
  const task = await resolve(Task, id);
  if (!task) return next({ status: 404, message: 'Task not found' });
  const project = task.projectId ? await resolve(Project, task.projectId) : null;

  let departmentName = '-';
  if (task.departmentId) {
    const department = await resolve(Department, task.departmentId);
    if (department) departmentName = department.name;
  }

  let assigneeName = '-';
  if (task.assigneeId) {
    const assignee = await resolve(User, task.assigneeId);
    if (assignee) assigneeName = assignee.name;
  }

  const statusMap = {
    pending: 'Pendiente',
    'in-progress': 'En progreso',
    done: 'Completada',
    cancelled: 'Cancelada'
  };
  const statusLabel = statusMap[task.status] || (task.status ? task.status : 'Pendiente');

  res.render('tasks/detail', { task, project, departmentName, assigneeName, statusLabel });
}

export async function newForm(req, res) {
  const users = await User.find().lean().exec();
  const departments = await Department.find().lean().exec();
  res.render('tasks/form', { users, departments, task: null });
}

export async function create(req, res) {
  const { title, description, departmentId, assigneeId, dueDate, projectId } = req.body;
  if (!title || !departmentId || !assigneeId) {
    const users = await User.find().lean().exec();
    const departments = await Department.find().lean().exec();
    return res.status(400).render('tasks/form', { users, departments, task: req.body, error: 'Título, Área y Asignado son obligatorios.' });
  }
  const department = await resolve(Department, departmentId);
  const assignee = await resolve(User, assigneeId);
  const project = projectId ? await resolve(Project, projectId) : null;
  const task = new Task({
    title,
    description,
    departmentId: department ? department._id : undefined,
    assigneeId: assignee ? assignee._id : undefined,
    dueDate: dueDate ? new Date(dueDate) : undefined,
    projectId: project ? project._id : undefined,
    createdAt: new Date()
  });
  await task.save();
  res.redirect('/tasks');
}

export async function editForm(req, res, next) {
  const task = await resolve(Task, req.params.id);
  if (!task) return next({ status: 404, message: 'Task not found' });
  const users = await User.find().lean().exec();
  const departments = await Department.find().lean().exec();
  res.render('tasks/form', { task, users, departments });
}

export async function update(req, res, next) {
  const { title, description, departmentId, assigneeId, status, dueDate } = req.body;
  const task = await resolve(Task, req.params.id);
  if (!task) return next({ status: 404, message: 'Task not found' });
  task.title = title;
  task.description = description;
  const department = await resolve(Department, departmentId);
  const assignee = await resolve(User, assigneeId);
  task.departmentId = department ? department._id : departmentId;
  task.assigneeId = assignee ? assignee._id : assigneeId;
  task.status = status;
  task.dueDate = dueDate ? new Date(dueDate) : null;
  task.updatedAt = new Date();
  await Task.updateOne({ _id: task._id }, task).exec();
  res.redirect('/tasks/' + req.params.id);
}

export async function remove(req, res, next) {
  const task = await resolve(Task, req.params.id);
  if (!task) return next({ status: 404, message: 'Task not found' });
  await Task.deleteOne({ _id: task._id }).exec();
  res.redirect('/tasks');
}

export async function tasksJSON(req, res) {
  const tasksRaw = await Task.find().lean().exec();
  const tasks = tasksRaw.map(t => ({ ...t, id: t._id?.toString() }));
  res.json(tasks);
}

export async function tasksByUserJSON(req, res) {
  const { userId } = req.params;
  const user = await resolve(User, userId);
  const query = {};
  if (user) query.assigneeId = user._id;
  else query.assigneeId = userId; // fallback
  const tasksRaw = await Task.find(query).lean().exec();
  const tasks = tasksRaw.map(t => ({ ...t, id: t._id?.toString() }));
  res.json(tasks);
}
