// index.js (en la raíz)
import express from "express";
import productosRouter from "./src/routes/products.router.js";
import carritosRouter from "./src/routes/carts.router.js";

const app = express();
app.use(express.json());

app.use("/api/products", productosRouter);
app.use("/api/carts", carritosRouter);

const PUERTO = 8080;
app.listen(PUERTO, () => {
  console.log(`Servidor en http://localhost:${PUERTO}`);

});
