export default class Evento {
  constructor({ id, name, location, date, budget, clientId, status = 'planning' }) {
    this.id = id;
    this.name = name;
    this.location = location;
    this.date = date;
    this.budget = budget;
    this.clientId = clientId;
    this.status = status;
    this.createdAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }
}