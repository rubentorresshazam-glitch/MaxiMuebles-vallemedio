const jwt = require('jsonwebtoken');

// ✅ Misma clave secreta que usás en tu controlador de usuarios
const JWT_SECRET = process.env.JWT_SECRET || 'MaxiMuebles_2026_Secreto';

// ✅ Middleware: VERIFICA EL TOKEN
const auth = (req, res, next) => {
  try {
    // 1️⃣ Obtener el token desde los encabezados
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.json({ ok: false, mensaje: 'Acceso denegado: Falta token' });
    }

    // 2️⃣ Limpiar el token (quita "Bearer " si viene así)
    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : authHeader;

    if (!token) {
      return res.json({ ok: false, mensaje: 'Acceso denegado: Token vacío' });
    }

    // 3️⃣ Verificar y decodificar el token
    const decodificado = jwt.verify(token, JWT_SECRET);

    // 4️⃣ Adjuntar el ID del usuario al request → lo usan todos los controladores
    req.usuarioId = decodificado.id;

    // ✅ Seguimos a la ruta protegida
    next();

  } catch (error) {
    console.error('❌ Error de token:', error.message);
    
    if (error.name === 'TokenExpiredError') {
      return res.json({ ok: false, mensaje: 'Sesión expirada, iniciá sesión nuevamente' });
    }
    
    return res.json({ ok: false, mensaje: 'Token inválido' });
  }
};

module.exports = auth;