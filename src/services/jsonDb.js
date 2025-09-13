import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');

async function ensureFile(filePath, fallbackData) {
  try {
    await fs.access(filePath);
  } catch {
    await fs.writeFile(filePath, JSON.stringify(fallbackData, null, 2), 'utf-8');
  }
}

export default class JsonDB {
  constructor(filename, defaultData = []) {
    this.file = path.join(DATA_DIR, filename);
    this.defaultData = defaultData;
  }

  async _read() {
    await ensureFile(this.file, this.defaultData);
    const raw = await fs.readFile(this.file, 'utf-8');
    return JSON.parse(raw || '[]');
  }

  async _write(data) {
    await fs.writeFile(this.file, JSON.stringify(data, null, 2), 'utf-8');
    return data;
  }

  async getAll() {
    return this._read();
  }

  async getById(id) {
    const all = await this._read();
    return all.find(x => x.id === id) || null;
  }

  async create(entity) {
    const all = await this._read();
    all.push(entity);
    await this._write(all);
    return entity;
  }

  async update(id, partial) {
    const all = await this._read();
    const idx = all.findIndex(x => x.id === id);
    if (idx === -1) return null;
    const updated = { ...all[idx], ...partial };
    all[idx] = updated;
    await this._write(all);
    return updated;
  }

  async remove(id) {
    const all = await this._read();
    const idx = all.findIndex(x => x.id === id);
    if (idx === -1) return false;
    all.splice(idx, 1);
    await this._write(all);
    return true;
  }

  async filter(fn) {
    const all = await this._read();
    return all.filter(fn);
  }
}
