import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../middleware/auth.js';
import asyncHandler from '../utils/asyncHandler.js';

const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
};

// Mostrar formulario de login
export const loginForm = asyncHandler(async (req, res) => {
  res.render('auth/login');
});

// Mostrar formulario de registro
export const registerForm = asyncHandler(async (req, res) => {
  res.render('auth/register');
});

// Login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    // Si es petición HTML (form), renderizar con error
    if (req.headers['content-type']?.includes('application/x-www-form-urlencoded')) {
      return res.render('auth/login', { error: 'Por favor proporciona email y contraseña' });
    }
    // Si es API, devolver JSON
    return res.status(400).json({ 
      success: false, 
      message: 'Por favor proporciona email y contraseña' 
    });
  }

  const user = await User.findOne({ email });
  
  if (!user) {
    if (req.headers['content-type']?.includes('application/x-www-form-urlencoded')) {
      return res.render('auth/login', { error: 'Credenciales inválidas' });
    }
    return res.status(401).json({ 
      success: false, 
      message: 'Credenciales inválidas' 
    });
  }

  const isMatch = await user.comparePassword(password);
  
  if (!isMatch) {
    if (req.headers['content-type']?.includes('application/x-www-form-urlencoded')) {
      return res.render('auth/login', { error: 'Credenciales inválidas' });
    }
    return res.status(401).json({ 
      success: false, 
      message: 'Credenciales inválidas' 
    });
  }

  const token = generateToken(user._id);

  // Si es petición HTML (form), guardar token en cookie y redirigir
  if (req.headers['content-type']?.includes('application/x-www-form-urlencoded')) {
    res.cookie('token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 }); // 7 días
    return res.redirect('/');
  }

  // Si es API, devolver JSON
  res.json({
    success: true,
    message: 'Inicio de sesión exitoso',
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      departmentId: user.departmentId
    }
  });
});

// Registro
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, confirmPassword, role, departmentId } = req.body;
  const isFormRequest = req.headers['content-type']?.includes('application/x-www-form-urlencoded');
  const finalRole = role || 'user';

  if (!name || !email || !password) {
    if (isFormRequest || req.accepts('html')) {
      return res.render('auth/register', { error: 'Por favor proporciona nombre, email y contraseña' });
    }
    return res.status(400).json({ 
      success: false, 
      message: 'Por favor proporciona nombre, email y contraseña' 
    });
  }

  if (!confirmPassword) {
    const message = 'Por favor confirmá tu contraseña';
    if (isFormRequest || req.accepts('html')) {
      return res.render('auth/register', { error: message });
    }
    return res.status(400).json({ success: false, message });
  }

  if (password !== confirmPassword) {
    const message = 'Las contraseñas no coinciden';
    if (isFormRequest || req.accepts('html')) {
      return res.render('auth/register', { error: message });
    }
    return res.status(400).json({ success: false, message });
  }

  // Verificar si el usuario ya existe
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    if (isFormRequest || req.accepts('html')) {
      return res.render('auth/register', { error: 'El email ya está registrado' });
    }
    return res.status(400).json({ 
      success: false, 
      message: 'El email ya está registrado' 
    });
  }

  // Crear nuevo usuario
  let user;
  try {
    user = new User({
      name,
      email,
      password,
      role: finalRole,
      departmentId
    });
    await user.save();
  } catch (error) {
    console.error('Error registrando usuario:', error);
    const friendlyMessage = error.code === 11000
      ? 'El email ya está registrado'
      : 'No pudimos completar el registro. Intentalo nuevamente en unos minutos.';

    if (isFormRequest || req.accepts('html')) {
      return res.status(400).render('auth/register', { error: friendlyMessage });
    }
    return res.status(400).json({ success: false, message: friendlyMessage });
  }

  const token = generateToken(user._id);

  // Si es petición HTML (form), guardar token en cookie y redirigir
  if (isFormRequest) {
    res.cookie('token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 }); // 7 días
    return res.redirect('/');
  }

  // Si es API, devolver JSON
  res.status(201).json({
    success: true,
    message: 'Usuario registrado exitosamente',
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      departmentId: user.departmentId
    }
  });
});

// Obtener perfil del usuario autenticado
export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password').populate('departmentId');
  
  // Si es petición HTML, renderizar vista
  if (req.headers.accept?.includes('text/html')) {
    return res.render('auth/profile', { user });
  }
  
  // Si es API, devolver JSON
  res.json({
    success: true,
    user
  });
});

// Logout
export const logout = asyncHandler(async (req, res) => {
  res.clearCookie('token');
  if (req.headers.accept?.includes('text/html')) {
    return res.redirect('/auth/login');
  }
  res.json({ success: true, message: 'Sesión cerrada exitosamente' });
});

