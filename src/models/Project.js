export default class Project {
  constructor({ id, clientId, productId, name, status = 'planned' }) {
    this.id = id;
    this.clientId = clientId;
    this.productId = productId;
    this.name = name;
    this.status = status;
    this.createdAt = new Date().toISOString();
  }
}
