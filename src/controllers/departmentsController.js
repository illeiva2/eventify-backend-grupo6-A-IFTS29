import Department from '../models/Department.js';

export async function list(req, res) {
  const departmentsRaw = await Department.find().lean().exec();
  const departments = departmentsRaw.map(d => ({ ...d, id: d._id?.toString() }));
  res.render('departments/list', { departments });
}

export async function departmentsJSON(req, res) {
  const departmentsRaw = await Department.find().lean().exec();
  const departments = departmentsRaw.map(d => ({ ...d, id: d._id?.toString() }));
  res.json(departments);
}
