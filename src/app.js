import express from "express";
import { engine } from "express-handlebars";
import path from "path";
import { fileURLToPath } from "url";
import viewsRouter from "./routes/views.router.js";
import dotenv from "dotenv";
import mongoose from "mongoose";


dotenv.config();

mongoose
  .connect(process.env.MONGO_URL)
  .then(function () {
    console.log("✅ Conectado a MongoDB Atlas");
  })
  .catch(function (error) {
    console.log("❌ Error al conectar a MongoDB:", error);
  });

// Rutas API
import productosRouter from "./routes/products.router.js";
import carritosRouter from "./routes/carts.router.js";

// __dirname para ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Instancia de Express
const app = express();
app.use(express.json());

// Handlebars
app.engine("handlebars", engine({
  layoutsDir: path.join(__dirname, "..", "views", "layouts"),
  defaultLayout: "main",
}));
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "..", "views"));

// Archivos estáticos para el cliente
app.use("/public", express.static(path.join(__dirname, "public")));

// Rutas de vistas
app.use("/", viewsRouter);


// Rutas API existentes
app.use("/api/products", productosRouter);
app.use("/api/carts", carritosRouter);

// Ruta de test
app.get("/ping", function (req, res) {
  res.send("pong");
});

export default app;
