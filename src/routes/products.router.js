import { Router } from "express";
import ProductManager from "../managers/ProductManager.js";

const router = Router();
const manager = new ProductManager("./src/data/products.json");

// GET /api/products
router.get("/", async (req, res) => {
  try {
    const productos = await manager.getProducts();
    res.json(productos);
  } catch (error) {
    res.status(500).json({ error: "Error al leer los productos" });
  }
});

// POST /api/products
router.post("/", async (req, res) => {
  try {
    const datos = req.body;

    // Validación mínima para evitar guardar productos vacíos
    if (
      !datos.title ||
      !datos.description ||
      !datos.code ||
      !datos.price ||
      !datos.stock ||
      !datos.category
    ) {
      return res
        .status(400)
        .json({ error: "Faltan campos obligatorios en el producto" });
    }

    const productoNuevo = await manager.addProduct(datos);
    res.status(201).json(productoNuevo);
  } catch (error) {
    res.status(500).json({ error: "Error al guardar el producto" });
  }
});

export default router;

