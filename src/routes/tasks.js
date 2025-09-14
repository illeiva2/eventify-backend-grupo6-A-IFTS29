import { Router } from 'express';
import * as ctrl from '../controllers/tasksController.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = Router();

router.get('/', asyncHandler(ctrl.list));
router.get('/new', asyncHandler(ctrl.newForm));
router.get('/json', asyncHandler(ctrl.tasksJSON));
router.post('/', asyncHandler(ctrl.create));
router.get('/:id', asyncHandler(ctrl.detail));
router.get('/:id/edit', asyncHandler(ctrl.editForm));
router.post('/:id', asyncHandler(ctrl.update));
router.post('/:id/delete', asyncHandler(ctrl.remove));
router.get('/user/:userId/json', asyncHandler(ctrl.tasksByUserJSON));


export default router;
