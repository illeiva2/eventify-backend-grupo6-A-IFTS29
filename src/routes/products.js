import { Router } from 'express';
import * as ctrl from '../controllers/productsController.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = Router();

router.get('/', asyncHandler(ctrl.list));
router.get('/json', asyncHandler(ctrl.productsJSON));

export default router;
