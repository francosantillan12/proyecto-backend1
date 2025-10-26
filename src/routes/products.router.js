import { Router } from "express";
import ProductManager from "../managers/ProductManager.js";

const router = Router();
const manager = new ProductManager("./src/data/products.json");

// GET /api/products
router.get("/", (req, res) => {
  manager
    .getProducts()
    .then((productos) => res.json(productos))
    .catch(() => res.status(500).json({ error: "Error al leer productos" }));
});

// POST /api/products
router.post("/", (req, res) => {
  const datos = req.body;
  manager
    .addProduct(datos)
    .then((productoNuevo) => res.status(201).json(productoNuevo))
    .catch(() => res.status(500).json({ error: "Error al guardar producto" }));
});

export default router;
