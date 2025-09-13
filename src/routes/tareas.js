import { Router } from 'express';
import * as ctrl from '../controllers/tareasController.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = Router();

router.get('/', asyncHandler(ctrl.list));
router.get('/new', asyncHandler(ctrl.newForm));
router.post('/', asyncHandler(ctrl.create));
router.get('/:id', asyncHandler(ctrl.detail));
router.get('/:id/edit', asyncHandler(ctrl.editForm));
router.post('/:id', asyncHandler(ctrl.update));
router.post('/:id/delete', asyncHandler(ctrl.remove));

export default router;