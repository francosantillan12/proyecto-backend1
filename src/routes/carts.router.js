import { Router } from "express";
import CartManager from "../managers/CartManager.js";

const router = Router();
const manager = new CartManager("./src/data/carts.json");

// POST /api/carts → crea { id, products: [] }
router.post("/", (req, res) => {
  manager
    .createCart()
    .then((carrito) => res.status(201).json(carrito))
    .catch(() => res.status(500).json({ error: "Error al crear carrito" }));
});

export default router;
