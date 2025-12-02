import { Router } from "express";
import {
  getProductos,
  getProductoPorId,
  crearProducto,
  actualizarProducto,
  eliminarProducto
} from "../controllers/products.controller.js";

const router = Router();

// Rutas de productos (API REST)
router.get("/", getProductos);
router.get("/:pid", getProductoPorId);
router.post("/", crearProducto);
router.put("/:pid", actualizarProducto);
router.delete("/:pid", eliminarProducto);

export default router;
