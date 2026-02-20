import ProductoRepository from "../repositories/producto.repository.js";

const productoRepository = new ProductoRepository();

// GET /api/products
export async function getProductos(req, res) {
  try {
    const { limit, page, query, sort } = req.query;

    const limitNumber = parseInt(limit) || 10;
    const pageNumber = parseInt(page) || 1;

    const filtro = {};

    if (query) {
      if (query === "disponibles") {
        filtro.stock = { $gt: 0 };
      } else {
        filtro.categoria = query;
      }
    }

    let sortOption = {};
    if (sort === "asc") sortOption = { precio: 1 };
    else if (sort === "desc") sortOption = { precio: -1 };

    // Repository
    const totalDocs = await productoRepository.countProductos(filtro);
    const totalPages = Math.ceil(totalDocs / limitNumber) || 1;
    const skip = (pageNumber - 1) * limitNumber;

    const productos = await productoRepository.getProductos(filtro, {
      sort: sortOption,
      skip: skip,
      limit: limitNumber
    });

    const hasPrevPage = pageNumber > 1;
    const hasNextPage = pageNumber < totalPages;

    const prevPage = hasPrevPage ? pageNumber - 1 : null;
    const nextPage = hasNextPage ? pageNumber + 1 : null;

    const baseUrl = `${req.protocol}://${req.get("host")}${req.baseUrl}`;

    const extraQueryParams = [
      `limit=${limitNumber}`,
      query ? `query=${query}` : null,
      sort ? `sort=${sort}` : null
    ]
      .filter(Boolean)
      .join("&");

    const prevLink = hasPrevPage
      ? `${baseUrl}?page=${prevPage}&${extraQueryParams}`
      : null;

    const nextLink = hasNextPage
      ? `${baseUrl}?page=${nextPage}&${extraQueryParams}`
      : null;

    return res.json({
      status: "success",
      payload: productos,
      totalPages,
      prevPage,
      nextPage,
      page: pageNumber,
      hasPrevPage,
      hasNextPage,
      prevLink,
      nextLink
    });

  } catch (error) {
    console.error("Error al leer los productos:", error);
    return res.status(500).json({
      status: "error",
      error: "Error al leer los productos"
    });
  }
}

// GET /api/products/:pid
export async function getProductoPorId(req, res) {
  try {
    const idProducto = req.params.pid;

    const producto = await productoRepository.getProductoPorId(idProducto);

    if (!producto) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    return res.json(producto);
  } catch (error) {
    console.error("Error al leer el producto:", error);
    return res.status(500).json({ error: "Error al leer el producto" });
  }
}

// POST /api/products
export async function crearProducto(req, res) {
  try {
    const datos = req.body;

    if (
      !datos.title ||
      !datos.description ||
      !datos.code ||
      datos.price === undefined ||
      datos.stock === undefined ||
      !datos.category
    ) {
      return res.status(400).json({ error: "Faltan campos obligatorios en el producto" });
    }

    const datosProducto = {
      titulo: datos.title,
      descripcion: datos.description,
      precio: datos.price,
      imagen: datos.imagen || "",
      codigo: datos.code,
      stock: datos.stock,
      categoria: datos.category
    };

    const productoNuevo = await productoRepository.crearProducto(datosProducto);

    return res.status(201).json(productoNuevo);
  } catch (error) {
    console.error("Error al guardar el producto:", error);
    return res.status(500).json({ error: "Error al guardar el producto" });
  }
}

// PUT /api/products/:pid
export async function actualizarProducto(req, res) {
  try {
    const idProducto = req.params.pid;
    const datosActualizados = req.body;

    const productoActualizado = await productoRepository.actualizarProducto(idProducto, datosActualizados);

    if (!productoActualizado) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    return res.json(productoActualizado);
  } catch (error) {
    console.error("Error al actualizar el producto:", error);
    return res.status(500).json({ error: "Error al actualizar el producto" });
  }
}

// DELETE /api/products/:pid
export async function eliminarProducto(req, res) {
  try {
    const idProducto = req.params.pid;

    const productoEliminado = await productoRepository.eliminarProducto(idProducto);

    if (!productoEliminado) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    return res.json({
      mensaje: "Producto eliminado correctamente",
      producto: productoEliminado
    });
  } catch (error) {
    console.error("Error al eliminar el producto:", error);
    return res.status(500).json({ error: "Error al eliminar el producto" });
  }
}
