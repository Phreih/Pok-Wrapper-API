/**
 * Middleware para rutas no encontradas (404)
 */
function notFound(req, res, next) {
  res.status(404).json({
    success: false,
    error: `Ruta '${req.originalUrl}' no existe.`,
    hint: "Visita GET / para ver todos los endpoints disponibles.",
  });
}

/**
 * Middleware global de manejo de errores
 */
function errorHandler(err, req, res, next) {
  console.error(`[ERROR] ${req.method} ${req.originalUrl} →`, err.message);

  // Error de timeout de axios
  if (err.code === "ECONNABORTED") {
    return res.status(504).json({
      success: false,
      error: "La solicitud a PokeAPI tardó demasiado. Intenta de nuevo.",
    });
  }

  // Error de red
  if (err.code === "ENOTFOUND" || err.code === "ECONNREFUSED") {
    return res.status(503).json({
      success: false,
      error: "No se pudo conectar con PokeAPI. Verifica tu conexión a internet.",
    });
  }

  // Error genérico
  const status = err.response?.status || 500;
  res.status(status >= 500 ? 500 : status).json({
    success: false,
    error: status >= 500 ? "Error interno del servidor." : err.message,
  });
}

module.exports = { notFound, errorHandler };
