import { Router } from 'express';
import * as ctrl from '../controllers/projectsController.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = Router();

router.get('/', asyncHandler(ctrl.list));
router.post('/', asyncHandler(ctrl.create));

export default router;
