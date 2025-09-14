import { Router } from 'express';
import * as ctrl from '../controllers/departmentsController.js';
import asyncHandler from '../utils/asyncHandler.js';
import * as tasksCtrl from '../controllers/tasksController.js';

const router = Router();

router.get('/', asyncHandler(ctrl.list));
router.get('/json', asyncHandler(ctrl.departmentsJSON));
router.get('/:deptId/tasks', asyncHandler(tasksCtrl.byDepartment));

export default router;
