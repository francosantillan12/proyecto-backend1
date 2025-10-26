import { Router } from "express";
import CartManager from "../managers/CartManager.js";

const router = Router();
const manager = new CartManager("./src/data/carts.json");

// POST /api/carts  → crea un nuevo carrito { id, products: [] }
router.post("/", async (req, res) => {
  try {
    const carrito = await manager.createCart();
    res.status(201).json(carrito);
  } catch (error) {
    console.error("Error al crear carrito:", error);
    res.status(500).json({ error: "Error al crear el carrito" });
  }
});

export default router;
