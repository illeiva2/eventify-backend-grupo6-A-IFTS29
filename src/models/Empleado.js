export default class Empleado {
  constructor({ id, name, email, roleId, areaId }) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.roleId = roleId;
    this.areaId = areaId;
    this.createdAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }
}