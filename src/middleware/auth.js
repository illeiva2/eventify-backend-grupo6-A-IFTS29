import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'tu_secret_key_super_segura_cambiar_en_produccion';

// Middleware para verificar el token JWT
export const authenticate = async (req, res, next) => {
  try {
    // Intentar obtener token de header Authorization o de cookie
    let token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token && req.cookies) {
      token = req.cookies.token;
    }
    
    if (!token) {
      // Si es petición HTML, redirigir a login
      if (req.headers.accept?.includes('text/html')) {
        return res.redirect('/auth/login');
      }
      return res.status(401).json({ 
        success: false, 
        message: 'No se proporcionó token de autenticación' 
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Usuario no encontrado' 
      });
    }

    req.user = user;
    if (res && res.locals) {
      res.locals.currentUser = user;
    }
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token inválido' 
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token expirado' 
      });
    }
    return res.status(500).json({ 
      success: false, 
      message: 'Error en la autenticación' 
    });
  }
};

export { JWT_SECRET };

