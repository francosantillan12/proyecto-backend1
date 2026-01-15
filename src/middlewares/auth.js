export const auth = function (req, res, next) {
    // Passport (recomendado)
    if (req.user) return next();
  
    // Sesión manual (compatibilidad)
    if (req.session && req.session.usuario) return next();
  
    return res.status(401).send({ error: "No autorizado. Iniciá sesión." });
  };
  