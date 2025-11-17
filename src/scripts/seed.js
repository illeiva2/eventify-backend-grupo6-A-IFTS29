import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ObjectId } from 'mongodb';
import connectDB, { closeDB } from '../config/db.js';
import User from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');

async function readJson(name) {
  const raw = await fs.readFile(path.join(DATA_DIR, name), 'utf-8');
  // intenta limpiar comentarios arriba del array si los hubiera (si son como yo y ponen comentarios en los json juas)
  const cleaned = raw.replace(/^[\s\S]*?\n(?=\[)/, (m) => (m.includes('//') ? '' : m));
  return JSON.parse(cleaned);
}

function toDateOrUndefined(value) {
  return value ? new Date(value) : undefined;
}

async function main() {
  let db;
  try {
    db = await connectDB(); // este es el connectDB del config/db.js
    console.log('Bandera: conectado a la base de datos');

    const departmentsData = await readJson('departments.json');
    const usersData = await readJson('users.json');
    const productsData = await readJson('products.json');
    const clientsData = await readJson('clients.json');
    const projectsData = await readJson('projects.json');
    const tasksData = await readJson('tasks.json');

    // limpiar colecciones (si no existen, Mongo las crea al insertar)
    const colNames = ['departments', 'users', 'products', 'clients', 'projects', 'tasks'];
    await Promise.all(colNames.map(name => db.collection(name).deleteMany({})));
    console.log('Cleared existing collections');

    // mapeo de legacyId -> nuevo ObjectId
    const mapDept = new Map();
    const mapUser = new Map();
    const mapProduct = new Map();
    const mapClient = new Map();
    const mapProject = new Map();

    // Departments (puse todo en english pq las colecciones tb estan en english)
    const deptDocs = departmentsData.map(d => {
      const _id = new ObjectId();
      mapDept.set(d.id, _id);
      return {
        _id,
        name: d.name,
        slug: d.slug
      };
    });
    if (deptDocs.length) await db.collection('departments').insertMany(deptDocs);
    console.log(`Inserted ${deptDocs.length} departments`);

    // Users - Usar modelo para hashear passwords correctamente
    for (const u of usersData) {
      const _id = new ObjectId();
      mapUser.set(u.id, _id);
      // Password por defecto: email sin @eventify.com
      const defaultPassword = u.email.split('@')[0] || 'password123';
      const user = new User({
        _id,
        name: u.name,
        email: u.email,
        password: u.password || defaultPassword, // Usar password del JSON o default
        role: u.role,
        departmentId: u.departmentId ? mapDept.get(u.departmentId) : undefined
      });
      await user.save(); // Esto hará que se hashee el password
    }
    console.log(`Inserted ${usersData.length} users`);

    // Products (ahr)
    const productDocs = productsData.map(p => {
      const _id = new ObjectId();
      mapProduct.set(p.id, _id);
      return {
        _id,
        name: p.name,
        category: p.category,
        price: p.price,
        description: p.description
      };
    });
    if (productDocs.length) await db.collection('products').insertMany(productDocs);
    console.log(`Inserted ${productDocs.length} products`);

    // Clients (ahreeeeeeeeeeeeeeeeee)
    const clientDocs = clientsData.map(c => {
      const _id = new ObjectId();
      mapClient.set(c.id, _id);
      return {
        _id,
        name: c.name,
        email: c.email,
        phone: c.phone
      };
    });
    if (clientDocs.length) await db.collection('clients').insertMany(clientDocs);
    console.log(`Inserted ${clientDocs.length} clients`);

    // Projects
    const projectDocs = projectsData.map(p => {
      const _id = new ObjectId();
      mapProject.set(p.id, _id);
      return {
        _id,
        name: p.name,
        clientId: p.clientId ? mapClient.get(p.clientId) : undefined,
        productId: p.productId ? mapProduct.get(p.productId) : undefined,
        status: p.status || 'planned',
        createdAt: toDateOrUndefined(p.createdAt)
      };
    });
    if (projectDocs.length) await db.collection('projects').insertMany(projectDocs);
    console.log(`Inserted ${projectDocs.length} projects`);

    // Tasks
    const taskDocs = tasksData.map(t => {
      return {
        _id: new ObjectId(),
        title: t.title,
        description: t.description,
        departmentId: t.departmentId ? mapDept.get(t.departmentId) : undefined,
        assigneeId: t.assigneeId ? mapUser.get(t.assigneeId) : undefined,
        projectId: t.projectId ? mapProject.get(t.projectId) : undefined,
        status: t.status || 'pending',
        dueDate: toDateOrUndefined(t.dueDate),
        createdAt: toDateOrUndefined(t.createdAt),
        updatedAt: toDateOrUndefined(t.updatedAt)
      };
    });
    if (taskDocs.length) await db.collection('tasks').insertMany(taskDocs);
    console.log(`Inserted ${taskDocs.length} tasks`);

    console.log('Seeding finished');
  } catch (err) {
    console.error('Seed failed', err);
    process.exitCode = 1;
  } finally {
    try { await closeDB(); } catch (_) {}
  }
}

main().catch(err => {
  console.error('Seed failed', err);
  process.exit(1);
});