export default class User {
  constructor({ id, name, email, departmentId }) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.departmentId = departmentId;
    this.createdAt = new Date().toISOString();
  }
}
