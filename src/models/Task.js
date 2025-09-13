export default class Task {
  constructor({ id, title, description, departmentId, assigneeId, status = 'pending', dueDate, projectId }) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.departmentId = departmentId;
    this.assigneeId = assigneeId;
    this.status = status;
    this.dueDate = dueDate;
    this.projectId = projectId || null;
    this.createdAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }
}
