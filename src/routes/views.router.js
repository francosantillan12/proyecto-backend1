import { Router } from "express";

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

export default router;
