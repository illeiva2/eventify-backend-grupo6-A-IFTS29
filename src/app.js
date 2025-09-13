import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from './middleware/logger.js';
import notFound from './middleware/notFound.js';
import errorHandler from './middleware/errorHandler.js';
import indexRouter from './routes/index.js';
import tasksRouter from './routes/tasks.js';
import clientsRouter from './routes/clients.js';
import productsRouter from './routes/products.js';
import projectsRouter from './routes/projects.js';
import departmentsRouter from './routes/departments.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');


app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// middleware
app.use(logger);

// Routers
app.use('/', indexRouter);
app.use('/tasks', tasksRouter);
app.use('/clients', clientsRouter);
app.use('/products', productsRouter);
app.use('/projects', projectsRouter);
app.use('/departments', departmentsRouter);

// 404 + error handlers
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Eventify Task Manager running at http://localhost:${PORT}`);
});
