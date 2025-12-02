import { createServer } from "http";
import { Server } from "socket.io";
import app from "./src/app.js";
import ProductoModel from "./src/model/producto.model.js";

// --- Servidor HTTP + Socket.io ---
const httpServer = createServer(app);
const io = new Server(httpServer);
app.set("io", io);

// --- Eventos WebSocket ---
io.on("connection", (socket) => {
  console.log("Cliente conectado:", socket.id);

  // Enviar lista inicial desde Mongo
  ProductoModel.find()
    .lean()
    .then((lista) => socket.emit("productosActuales", lista))
    .catch((err) => {
      console.error("WS productosActuales error:", err);
      socket.emit("productosActuales", []);
    });

// Crear producto en Mongo
socket.on("crearProducto", (datos) => {
  const titulo = String(datos.title || "").trim();
  const precio = Number(datos.price) || 0;
  const stock = Number(datos.stock) || 0;
  const descripcion = datos.description || "";
  const categoria = (datos.category || "sin-categoria").trim();

  // si no mandan código, lo generamos automáticamente
  const codigo =
    (datos.code && String(datos.code).trim()) ||
    `SKU-${Date.now()}`;

  if (!titulo) {
    return socket.emit("errorOperacion", {
      mensaje: "El título es obligatorio",
    });
  }

  const nuevo = {
    titulo,
    precio,
    codigo,
    stock,
    descripcion,
    categoria,
    imagen: "",
  };

  ProductoModel.create(nuevo)
    .then(() => ProductoModel.find().lean())
    .then((lista) => io.emit("productosActuales", lista))
    .catch((err) => {
      console.error("WS crearProducto error:", err);
      socket.emit("errorOperacion", {
        mensaje: "No se pudo crear el producto",
      });
    });
});


  // Eliminar producto en Mongo
  socket.on("eliminarProducto", (id) => {
    ProductoModel.findByIdAndDelete(id)
      .then((resultado) => {
        if (!resultado) {
          socket.emit("errorOperacion", { mensaje: "Producto no encontrado" });
          return null;
        }
        return ProductoModel.find().lean();
      })
      .then((lista) => {
        if (lista) {
          io.emit("productosActuales", lista);
        }
      })
      .catch((err) => {
        console.error("WS eliminarProducto error:", err);
        socket.emit("errorOperacion", {
          mensaje: "No se pudo eliminar el producto",
        });
      });
  });
});


const PUERTO = 8080;
httpServer.listen(PUERTO, () => {
  console.log(`Servidor en http://localhost:${PUERTO}`);
});
