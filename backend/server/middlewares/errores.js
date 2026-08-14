// ✅ Manejo de errores 404 — Ruta no encontrada
exports.noEncontrado = (req, res, next) => {
  const error = new Error(`Ruta no encontrada: ${req.originalUrl}`);
  res.statusCode = 404;
  next(error);
};

// ✅ Manejo de errores generales — Formato unificado
exports.manejadorErrores = (err, req, res, next) => {
  const codigoEstado = res.statusCode === 200 ? 500 : res.statusCode;
  
  console.error('❌ ERROR:', err.message);
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack); // Muestra detalles solo en desarrollo
  }

  res.status(codigoEstado).json({
    ok: false,
    mensaje: err.message || 'Error interno del servidor',
    // En producción NO devolver el stack para seguridad
    ...(process.env.NODE_ENV === 'development' && { pila: err.stack })
  });
};