import { createServer } from "http";
import { Server } from "socket.io";
import app from "./src/app.js";
import ProductManager from "./src/managers/ProductManager.js";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

// --- __dirname para ES Modules ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Servidor HTTP + Socket.io ---
const httpServer = createServer(app);
const io = new Server(httpServer);
app.set("io", io);

// --- Eventos WebSocket ---
io.on("connection", (socket) => {
  console.log("Cliente conectado:", socket.id);

  const gestor = new ProductManager(path.join(__dirname, "src", "data", "products.json"));

  // Enviar lista inicial
  gestor.getProducts()
    .then((lista) => socket.emit("productosActuales", lista))
    .catch(() => socket.emit("productosActuales", []));

  // Crear producto
  socket.on("crearProducto", (datos) => {
    const nuevo = {
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
      .then(() => gestor.getProducts())
      .then((lista) => io.emit("productosActuales", lista))
      .catch((err) => {
        console.error("WS crearProducto error:", err);
        socket.emit("errorOperacion", { mensaje: "No se pudo crear el producto" });
      });
  });

  // Eliminar producto
  socket.on("eliminarProducto", (id) => {
    const rutaJSON = path.join(__dirname, "src", "data", "products.json");

    gestor.getProducts()
      .then((lista) => {
        const antes = lista.length;
        let nueva = lista.filter((p) => p.id !== id);
        if (nueva.length === antes) nueva = lista.filter((p) => String(p.id) !== String(id));
        if (nueva.length === antes) {
          socket.emit("errorOperacion", { mensaje: "Producto no encontrado" });
          return null;
        }

        return fs.promises.writeFile(rutaJSON, JSON.stringify(nueva, null, 2), "utf-8")
          .then(() => gestor.getProducts())
          .then((listaActual) => io.emit("productosActuales", listaActual));
      })
      .catch((err) => {
        console.error("WS eliminarProducto error:", err);
        socket.emit("errorOperacion", { mensaje: "No se pudo eliminar el producto" });
      });
  });
});

const PUERTO = 8080;
httpServer.listen(PUERTO, () => {
  console.log(`Servidor en http://localhost:${PUERTO}`);
});
