
import { Router } from "express";
import CarritoModel from "../model/carrito.model.js";
import ProductoModel from "../model/producto.model.js";
import passport from "passport";



const router = Router();


// Protege TODAS las rutas de carts con JWT (cookieToken)
router.use(passport.authenticate("current", { session: false }));
// POST /api/carts → crea un carrito vacío en Mongo
router.post("/", async (req, res) => {
  try {
    const nuevoCarrito = await CarritoModel.create({ products: [] });
    res.status(201).json(nuevoCarrito);
  } catch (error) {
    console.error("Error al crear carrito:", error);
    res.status(500).json({ error: "No se pudo crear el carrito" });
  }
});

// obtener un carrito por ID con populate
router.get("/:cid", async (req, res) => {
  try {
    const { cid } = req.params;

    const carrito = await CarritoModel.findById(cid).populate("products.product");

    if (!carrito) {
      return res.status(404).json({ error: "Carrito no encontrado" });
    }

    res.json(carrito);
  } catch (error) {
    console.error("Error al obtener el carrito:", error);
    res.status(500).json({ error: "No se pudo obtener el carrito", detalle: error.message });
  }
});

// agregar un producto al carrito
router.post("/:cid/products/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;

    // 🔐 Solo puede modificar su propio carrito
    if (String(req.user.cart) !== String(cid)) {
      return res
        .status(403)
        .json({ error: "No podés modificar este carrito" });
    }

    // 1. Verificar que el carrito exista
    const carrito = await CarritoModel.findById(cid);

    if (!carrito) {
      return res.status(404).json({ error: "Carrito no encontrado" });
    }

    // 2. Verificar que el producto exista
    const producto = await ProductoModel.findById(pid);

    if (!producto) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    // 3. Ver si el producto ya está en el carrito
    const indiceProducto = carrito.products.findIndex(
      (item) => item.product.toString() === pid
    );

    if (indiceProducto !== -1) {
      // Si ya existe, incrementamos la cantidad
      carrito.products[indiceProducto].quantity += 1;
    } else {
      // Si no existe, lo agregamos con cantidad 1
      carrito.products.push({
        product: pid,
        quantity: 1,
      });
    }

    // 4. Guardar el carrito actualizado
    const carritoActualizado = await carrito.save();

    return res.json(carritoActualizado);

  } catch (error) {
    console.error("Error al agregar producto al carrito:", error);
    return res
      .status(500)
      .json({ error: "No se pudo agregar el producto al carrito" });
  }
});


// eliminar un producto puntual del carrito
router.delete("/:cid/products/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;

    // 1. Buscar el carrito
    const carrito = await CarritoModel.findById(cid);

    if (!carrito) {
      return res.status(404).json({ error: "Carrito no encontrado" });
    }

    // 2. Buscar el producto dentro del carrito
    const indiceProducto = carrito.products.findIndex(
      (item) => item.product.toString() === pid
    );

    if (indiceProducto === -1) {
      return res
        .status(404)
        .json({ error: "Ese producto no está en el carrito" });
    }

    // 3. Sacar el producto del array
    carrito.products.splice(indiceProducto, 1);

    // 4. Guardar el carrito actualizado
    const carritoActualizado = await carrito.save();

    res.json({
      mensaje: "Producto eliminado del carrito",
      carrito: carritoActualizado
    });
  } catch (error) {
    console.error("Error al eliminar producto del carrito:", error);
    res
      .status(500)
      .json({ error: "No se pudo eliminar el producto del carrito" });
  }
});

// actualizar la cantidad de un producto
router.put("/:cid/products/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const { quantity } = req.body;

    // Validar cantidad
    if (quantity === undefined || quantity < 1) {
      return res.status(400).json({
        error: "Debes enviar una cantidad válida (quantity > 0)"
      });
    }

    // Buscar el carrito
    const carrito = await CarritoModel.findById(cid);

    if (!carrito) {
      return res.status(404).json({ error: "Carrito no encontrado" });
    }

    // Buscar el producto dentro del carrito
    const indiceProducto = carrito.products.findIndex(
      (item) => item.product.toString() === pid
    );

    if (indiceProducto === -1) {
      return res
        .status(404)
        .json({ error: "Ese producto no está en el carrito" });
    }

    // Actualizar cantidad
    carrito.products[indiceProducto].quantity = quantity;

    // Guardar
    const carritoActualizado = await carrito.save();

    res.json({
      mensaje: "Cantidad actualizada",
      carrito: carritoActualizado
    });
  } catch (error) {
    console.error("Error al actualizar la cantidad:", error);
    res.status(500).json({
      error: "No se pudo actualizar la cantidad del producto"
    });
  }
});

//  reemplazar TODO el array de productos
router.put("/:cid", async (req, res) => {
  try {
    const { cid } = req.params;
    const { products } = req.body;

    // Validación básica
    if (!Array.isArray(products)) {
      return res.status(400).json({
        error: "Debes enviar un array de productos en 'products'"
      });
    }

    // Buscar carrito
    const carrito = await CarritoModel.findById(cid);

    if (!carrito) {
      return res.status(404).json({ error: "Carrito no encontrado" });
    }

    // Reemplazar el array completo
    carrito.products = products;

    // Guardar
    const carritoActualizado = await carrito.save();

    res.json({
      mensaje: "Carrito reemplazado correctamente",
      carrito: carritoActualizado
    });

  } catch (error) {
    console.error("Error al reemplazar el carrito:", error);
    res.status(500).json({ error: "No se pudo reemplazar el carrito" });
  }
});

// vaciar carrito completo
router.delete("/:cid", async (req, res) => {
  try {
    const { cid } = req.params;

    const carrito = await CarritoModel.findById(cid);

    if (!carrito) {
      return res.status(404).json({ error: "Carrito no encontrado" });
    }

    // Vaciar el array
    carrito.products = [];

    const carritoActualizado = await carrito.save();

    res.json({
      mensaje: "Carrito vaciado correctamente",
      carrito: carritoActualizado
    });

  } catch (error) {
    console.error("Error al vaciar el carrito:", error);
    res.status(500).json({ error: "No se pudo vaciar el carrito" });
  }
});



export default router;


