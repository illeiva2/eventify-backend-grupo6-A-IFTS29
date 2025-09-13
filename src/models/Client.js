export default class Client {
  constructor({ id, name, email, phone }) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.phone = phone;
    this.createdAt = new Date().toISOString();
  }
}
