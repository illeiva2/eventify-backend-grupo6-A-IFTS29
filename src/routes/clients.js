import { Router } from 'express';
import * as ctrl from '../controllers/clientsController.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = Router();

router.get('/', asyncHandler(ctrl.list));
router.get('/json', asyncHandler(ctrl.clientsJSON));
router.get('/new', asyncHandler(ctrl.newForm));
router.post('/', asyncHandler(ctrl.create));
router.delete('/:id', asyncHandler(ctrl.remove));


export default router;
