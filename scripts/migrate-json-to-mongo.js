import fs from 'fs/promises';
import path from 'path';
import connectDB from '../src/config/db.js';
import Department from '../src/models/Department.js';
import Product from '../src/models/Product.js';
import Client from '../src/models/Client.js';
import Project from '../src/models/Project.js';
import User from '../src/models/User.js';
import Task from '../src/models/Task.js';

const dataDir = path.join(process.cwd(), 'src', 'data');

async function loadJSON(file) {
  const content = await fs.readFile(path.join(dataDir, file), 'utf8');
  return JSON.parse(content);
}

async function insertManyWithMap(Model, docs, mapFn) {
  const map = new Map(); // oldId -> new ObjectId
  for (const doc of docs) {
    const toInsert = mapFn ? mapFn(doc) : { ...doc };
    const created = await Model.create(toInsert);
    map.set(String(doc.id), created._id);
  }
  return map;
}

async function run() {
  await connectDB();

  const [departments, products, clients, projects, users, tasks] = await Promise.all([
    loadJSON('departments.json'),
    loadJSON('products.json'),
    loadJSON('clients.json'),
    loadJSON('projects.json'),
    loadJSON('users.json'),
    loadJSON('tasks.json')
  ]);

  console.log('Starting import (no legacyId will be persisted)...');

  // Clear collections first to avoid duplicates
  await Promise.all([
    Department.deleteMany({}),
    Product.deleteMany({}),
    Client.deleteMany({}),
    Project.deleteMany({}),
    User.deleteMany({}),
    Task.deleteMany({})
  ]);

  // Insert departments
  const deptMap = await insertManyWithMap(Department, departments, (d) => ({ name: d.name, slug: d.slug }));
  console.log(`Imported ${deptMap.size} departments`);

  // Insert products
  const prodMap = await insertManyWithMap(Product, products, (p) => ({
    name: p.name,
    category: p.category,
    price: p.price,
    description: p.description,
    createdAt: p.createdAt ? new Date(p.createdAt) : undefined
  }));
  console.log(`Imported ${prodMap.size} products`);

  // Insert clients
  const clientMap = await insertManyWithMap(Client, clients, (c) => ({
    name: c.name,
    email: c.email,
    phone: c.phone,
    createdAt: c.createdAt ? new Date(c.createdAt) : undefined
  }));
  console.log(`Imported ${clientMap.size} clients`);

  // Insert projects (resolve clientId/productId via maps)
  const projectMap = await insertManyWithMap(Project, projects, (p) => ({
    name: p.name,
    description: p.description,
    status: p.status,
    clientId: p.clientId ? clientMap.get(String(p.clientId)) : undefined,
    productId: p.productId ? prodMap.get(String(p.productId)) : undefined,
    createdAt: p.createdAt ? new Date(p.createdAt) : undefined
  }));
  console.log(`Imported ${projectMap.size} projects`);

  // Insert users (resolve departmentId via map)
  const userMap = await insertManyWithMap(User, users, (u) => ({
    name: u.name,
    email: u.email,
    role: u.role || undefined,
    departmentId: u.departmentId ? deptMap.get(String(u.departmentId)) : undefined,
    createdAt: u.createdAt ? new Date(u.createdAt) : undefined
  }));
  console.log(`Imported ${userMap.size} users`);

  // Insert tasks (resolve project/assignee/department and build assignee/department snapshots)
  for (const t of tasks) {
    const projectId = t.projectId ? projectMap.get(String(t.projectId)) : undefined;
    const assigneeId = t.assigneeId ? userMap.get(String(t.assigneeId)) : undefined;
    const departmentId = t.departmentId ? deptMap.get(String(t.departmentId)) : undefined;

    const assignee = assigneeId ? await User.findById(assigneeId).lean().exec() : null;
    const department = departmentId ? await Department.findById(departmentId).lean().exec() : null;

    await Task.create({
      title: t.title,
      description: t.description,
      status: t.status,
      dueDate: t.dueDate ? new Date(t.dueDate) : undefined,
      projectId,
      assigneeId,
      departmentId,
      assignee: assignee ? { id: assignee._id, name: assignee.name, email: assignee.email } : undefined,
      department: department ? { id: department._id, name: department.name } : undefined,
      createdAt: t.createdAt ? new Date(t.createdAt) : undefined,
      updatedAt: t.updatedAt ? new Date(t.updatedAt) : undefined
    });
  }
  const taskCount = await Task.countDocuments().exec();
  console.log(`Imported ${taskCount} tasks`);

  console.log('Import finished. No legacyId fields were persisted.');
  process.exit(0);
}

run().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
