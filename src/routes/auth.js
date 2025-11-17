import { Router } from 'express';
import { loginForm, login, registerForm, register, getProfile, logout } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Rutas para mostrar formularios (GET)
router.get('/login', loginForm);
router.get('/register', registerForm);

// Rutas para procesar formularios (POST)
router.post('/login', login);
router.post('/register', register);

// Rutas protegidas
router.get('/profile', authenticate, getProfile);
router.post('/logout', logout);
router.get('/logout', logout);

export default router;

