// index.js (en la raíz)
import fs from "fs";
import ProductManager from "./src/managers/ProductManager.js";
import express from "express";
import productosRouter from "./src/routes/products.router.js";
import carritosRouter from "./src/routes/carts.router.js";
import { engine } from "express-handlebars";
import path from "path";
import { fileURLToPath } from "url";

// 🔌 Socket.io
import { createServer } from "http";
import { Server } from "socket.io";

// --- __dirname para ES Modules ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// --- 🔹 Test temporal ---
app.get("/ping", (req, res) => {
  res.send("pong");
});

// --- Configuración de Handlebars ---
app.engine(
  "handlebars",
  engine({
    layoutsDir: path.join(__dirname, "views", "layouts"),
    defaultLayout: "main",
  })
);
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

// --- Ruta HOME para probar Handlebars ---
app.get("/", (req, res) => {
  res.render("home", {
    layout: "main",
    tituloPagina: "Inicio",
    mensaje: "¡Funciona Handlebars!",
  });
});

app.get("/realtimeproducts", (req, res) => {
  res.render("realtimeproducts", { layout: false, tituloPagina: "Productos en tiempo real" });
});


app.use("/public", express.static(path.join(__dirname, "src", "public")));



// --- Rutas API existentes ---
app.use("/api/products", productosRouter);
app.use("/api/carts", carritosRouter);

// --- Servidor HTTP + Socket.io ---
const httpServer = createServer(app);
const io = new Server(httpServer);
app.set("io", io);

io.on("connection", (socket) => {
  console.log("Cliente conectado:", socket.id);

  const gestor = new ProductManager(path.join(__dirname, "src", "data", "products.json"));

  gestor.getProducts()
    .then(function(lista){ socket.emit("productosActuales", lista); })
    .catch(function(){ socket.emit("productosActuales", []); });

    // Crear producto (WS -> server)
    socket.on("crearProducto", function (datos) {
      // saneo mínimo para tu ProductManager actual
      var nuevo = {
        title: String(datos.title || "").trim(),
        price: Number(datos.price) || 0,
        code: String(datos.code || "").trim(),
        stock: Number(datos.stock) || 0,
        description: datos.description || "",
        status: true,
        category: datos.category || "sin-categoria",
        thumbnails: Array.isArray(datos.thumbnails) ? datos.thumbnails : []
      };
  
      if (!nuevo.title || !nuevo.code) {
        return socket.emit("errorOperacion", { mensaje: "title y code son obligatorios" });
      }
  
      gestor.addProduct(nuevo)
        .then(function () {
          return gestor.getProducts();
        })
        .then(function (lista) {
          // actualizamos a TODOS los clientes conectados
          io.emit("productosActuales", lista);
        })
        .catch(function (err) {
          console.error("WS crearProducto error:", err);
          socket.emit("errorOperacion", { mensaje: "No se pudo crear el producto" });
        });
    });
    // Eliminar producto (WS -> server)
  socket.on("eliminarProducto", function (id) {
    const rutaJSON = path.join(__dirname, "src", "data", "products.json");

    gestor.getProducts()
      .then(function (lista) {
        const antes = lista.length;

        // comparo por id numérico y por string para cubrir ambos casos
        let nueva = lista.filter(function (p) { return p.id !== id; });
        if (nueva.length === antes) {
          nueva = lista.filter(function (p) { return String(p.id) !== String(id); });
        }

        if (nueva.length === antes) {
          socket.emit("errorOperacion", { mensaje: "Producto no encontrado" });
          return null; // corto la cadena
        }

        return fs.promises.writeFile(rutaJSON, JSON.stringify(nueva, null, 2), "utf-8")
          .then(function () { return gestor.getProducts(); })
          .then(function (listaActual) {
            io.emit("productosActuales", listaActual);
            return true;
          });
      })
      .catch(function (err) {
        console.error("WS eliminarProducto error:", err);
        socket.emit("errorOperacion", { mensaje: "No se pudo eliminar el producto" });
      });
  });

    
});


const PUERTO = 8080;
httpServer.listen(PUERTO, () => {
  console.log(`Servidor en http://localhost:${PUERTO}`);
});
