import { Router } from "express";
import ProductoModel from "../model/producto.model.js";

const router = Router();

router.get("/", function (req, res) {
  res.render("home", {
    layout: "main",
    tituloPagina: "Inicio",
    mensaje: "¡Funciona Handlebars!",
  });
});

router.get("/realtimeproducts", function (req, res) {
  res.render("realtimeproducts", {
    layout: false,
    tituloPagina: "Productos en tiempo real",
  });
});

// Vista de productos con paginación
router.get("/products", async (req, res) => {
  try {
    const { page, limit } = req.query;

    const limitNumber = parseInt(limit) || 2; // mostramos 2 productos por página (después lo podés cambiar)
    const pageNumber = parseInt(page) || 1;

    const filtro = {}; // más adelante, si querés, acá podemos usar query=categoria

    const totalDocs = await ProductoModel.countDocuments(filtro);
    const totalPages = Math.ceil(totalDocs / limitNumber) || 1;
    const skip = (pageNumber - 1) * limitNumber;

    const productosDB = await ProductoModel.find(filtro)
      .skip(skip)
      .limit(limitNumber);

    const productos = productosDB.map((p) => p.toObject());

    const hasPrevPage = pageNumber > 1;
    const hasNextPage = pageNumber < totalPages;

    const prevPage = hasPrevPage ? pageNumber - 1 : null;
    const nextPage = hasNextPage ? pageNumber + 1 : null;

    const prevLink = hasPrevPage
      ? `/products?page=${prevPage}&limit=${limitNumber}`
      : null;

    const nextLink = hasNextPage
      ? `/products?page=${nextPage}&limit=${limitNumber}`
      : null;

    res.render("products", {
      layout: "main",
      tituloPagina: "Listado de productos",
      productos,
      page: pageNumber,
      totalPages,
      hasPrevPage,
      hasNextPage,
      prevLink,
      nextLink
    });
  } catch (error) {
    console.error("Error al renderizar /products:", error);
    res.status(500).send("Error al cargar la vista de productos");
  }
});


export default router;
