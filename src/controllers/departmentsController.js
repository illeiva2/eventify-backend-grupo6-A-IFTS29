import JsonDB from '../services/jsonDb.js';
const departmentsDb = new JsonDB('departments.json', []);

export async function list(req, res) {
  const departments = await departmentsDb.getAll();
  res.render('departments/list', { departments });
}
