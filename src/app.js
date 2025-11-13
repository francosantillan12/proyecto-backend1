import express from "express";
import { engine } from "express-handlebars";
import path from "path";
import { fileURLToPath } from "url";

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
app.get("/", function (req, res) {
  res.render("home", {
    layout: "main",
    tituloPagina: "Inicio",
    mensaje: "¡Funciona Handlebars!",
  });
});

app.get("/realtimeproducts", function (req, res) {
  res.render("realtimeproducts", { layout: false, tituloPagina: "Productos en tiempo real" });
});

// Rutas API existentes
app.use("/api/products", productosRouter);
app.use("/api/carts", carritosRouter);

// Ruta de test
app.get("/ping", function (req, res) {
  res.send("pong");
});

export default app;
