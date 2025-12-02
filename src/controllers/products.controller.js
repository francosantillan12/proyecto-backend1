import ProductoModel from "../model/producto.model.js";

// GET /api/products
export async function getProductos(req, res) {
  try {
    // Leer query params
    const { limit, page, query, sort } = req.query;

    //  Valores por defecto
    const limitNumber = parseInt(limit) || 10; // si no mandan limit, usa 10
    const pageNumber = parseInt(page) || 1;    // si no mandan page, usa 1

    //  Armar filtro según "query"
    const filtro = {};

    if (query) {
      if (query === "disponibles") {
        // Productos con stock > 0
        filtro.stock = { $gt: 0 };
      } else {
        // Cualquier otro valor de query lo tomamos como categoría
        filtro.categoria = query;
      }
    }

    //  Armar opción de ordenamiento según sort
    // sort=asc  -> precio ascendente
    // sort=desc -> precio descendente
    let sortOption = {};

    if (sort === "asc") {
      sortOption = { precio: 1 };
    } else if (sort === "desc") {
      sortOption = { precio: -1 };
    }

    //  Contar la cantidad total de documentos que cumplen el filtro
    const totalDocs = await ProductoModel.countDocuments(filtro);

    //  Calcular total de páginas
    const totalPages = Math.ceil(totalDocs / limitNumber) || 1;

    //  Calcular cuántos documentos saltear
    const skip = (pageNumber - 1) * limitNumber;

    //  Buscar productos con paginación, filtro y sort
    const productos = await ProductoModel.find(filtro)
      .sort(sortOption)   // acá entra el ordenamiento
      .skip(skip)
      .limit(limitNumber);

    //  Calcular info de paginación
    const hasPrevPage = pageNumber > 1;
    const hasNextPage = pageNumber < totalPages;

    const prevPage = hasPrevPage ? pageNumber - 1 : null;
    const nextPage = hasNextPage ? pageNumber + 1 : null;

    // 10. Base de la URL actual, para armar prevLink y nextLink
    const baseUrl = `${req.protocol}://${req.get("host")}${req.baseUrl}`;

    const extraQueryParams = [
      `limit=${limitNumber}`,
      query ? `query=${query}` : null,
      sort ? `sort=${sort}` : null
    ]
      .filter(Boolean)  // saca los null
      .join("&");

    const prevLink = hasPrevPage
      ? `${baseUrl}?page=${prevPage}&${extraQueryParams}`
      : null;

    const nextLink = hasNextPage
      ? `${baseUrl}?page=${nextPage}&${extraQueryParams}`
      : null;

    
    res.json({
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
    res.status(500).json({ status: "error", error: "Error al leer los productos" });
  }
}



// GET /api/products/:pid
export async function getProductoPorId(req, res) {
  try {
    const idProducto = req.params.pid;

    const producto = await ProductoModel.findById(idProducto);

    if (!producto) {
      return res
        .status(404)
        .json({ error: "Producto no encontrado" });
    }

    res.json(producto);
  } catch (error) {
    console.error("Error al leer el producto:", error);
    res.status(500).json({ error: "Error al leer el producto" });
  }
}

// POST /api/products
export async function crearProducto(req, res) {
  try {
    const datos = req.body;

    // Validación mínima
    if (
      !datos.title ||
      !datos.description ||
      !datos.code ||
      datos.price === undefined ||
      datos.stock === undefined ||
      !datos.category
    ) {
      return res
        .status(400)
        .json({ error: "Faltan campos obligatorios en el producto" });
    }

    // Mapeo body -> modelo
    const datosProducto = {
      titulo: datos.title,
      descripcion: datos.description,
      precio: datos.price,
      imagen: datos.imagen || "",
      codigo: datos.code,
      stock: datos.stock,
      categoria: datos.category   // 👈 se guarda en el modelo
    };

    const productoNuevo = await ProductoModel.create(datosProducto);

    res.status(201).json(productoNuevo);
  } catch (error) {
    console.error("Error al guardar el producto:", error);
    res.status(500).json({ error: "Error al guardar el producto" });
  }
}

// PUT /api/products/:pid
export async function actualizarProducto(req, res) {
  try {
    const idProducto = req.params.pid;
    const datosActualizados = req.body;

    const productoActualizado = await ProductoModel.findByIdAndUpdate(
      idProducto,
      datosActualizados,
      { new: true }
    );

    if (!productoActualizado) {
      return res
        .status(404)
        .json({ error: "Producto no encontrado" });
    }

    res.json(productoActualizado);
  } catch (error) {
    console.error("Error al actualizar el producto:", error);
    res.status(500).json({ error: "Error al actualizar el producto" });
  }
}

// DELETE /api/products/:pid
export async function eliminarProducto(req, res) {
  try {
    const idProducto = req.params.pid;

    const productoEliminado = await ProductoModel.findByIdAndDelete(idProducto);

    if (!productoEliminado) {
      return res
        .status(404)
        .json({ error: "Producto no encontrado" });
    }

    res.json({
      mensaje: "Producto eliminado correctamente",
      producto: productoEliminado
    });
  } catch (error) {
    console.error("Error al eliminar el producto:", error);
    res.status(500).json({ error: "Error al eliminar el producto" });
  }
}
