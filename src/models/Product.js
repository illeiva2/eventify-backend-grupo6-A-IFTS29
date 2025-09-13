export default class Product {
  constructor({ id, name, category, price }) {
    this.id = id;
    this.name = name;
    this.category = category;
    this.price = price;
    this.createdAt = new Date().toISOString();
  }
}
