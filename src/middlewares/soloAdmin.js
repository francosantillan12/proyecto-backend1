export const soloAdmin = function (req, res, next) {
    if (!req.user) return res.status(401).send({ error: "No autorizado" });
    if (req.user.role !== "admin") return res.status(403).send({ error: "Solo admin" });
    return next();
  };
  