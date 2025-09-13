export default class Tarea {
  constructor({ 
    id, 
    title, 
    description, 
    status = 'pending', 
    priority = 'medium', 
    startDate, 
    endDate, 
    assigneeId, 
    areaId, 
    eventId, 
    clientId, 
    estimatedHours = 0, 
    actualHours = 0 
  }) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.status = status;
    this.priority = priority;
    this.startDate = startDate;
    this.endDate = endDate;
    this.assigneeId = assigneeId;
    this.areaId = areaId;
    this.eventId = eventId;
    this.clientId = clientId;
    this.estimatedHours = estimatedHours;
    this.actualHours = actualHours;
    this.createdAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }
}