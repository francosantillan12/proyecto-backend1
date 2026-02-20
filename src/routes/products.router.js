import passport from "passport";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";

import { Router } from "express";
import {
  getProductos,
  getProductoPorId,
  crearProducto,
  actualizarProducto,
  eliminarProducto
} from "../controllers/products.controller.js";

const router = Router();

// 🔓 Públicas (cualquiera puede ver productos)
router.get("/", getProductos);
router.get("/:pid", getProductoPorId);

// 🔒 Solo ADMIN puede crear
router.post(
  "/",
  passport.authenticate("current", { session: false }),
  authorizeRoles(["admin"]),
  crearProducto
);

// 🔒 Solo ADMIN puede actualizar
router.put(
  "/:pid",
  passport.authenticate("current", { session: false }),
  authorizeRoles(["admin"]),
  actualizarProducto
);

// 🔒 Solo ADMIN puede eliminar
router.delete(
  "/:pid",
  passport.authenticate("current", { session: false }),
  authorizeRoles(["admin"]),
  eliminarProducto
);

export default router;
