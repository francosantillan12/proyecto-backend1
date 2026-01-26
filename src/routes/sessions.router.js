import { Router } from "express";
import passport from "passport";
import CarritoModel from "../model/carrito.model.js";
import UsuarioModel from "../model/usuario.model.js";
import jwt from "jsonwebtoken";

const router = Router();

// Ruta de error de Passport (registro)
router.get("/error", function (req, res) {
  res.status(400).send({
    error:
      "No se pudo completar la operación. El usuario ya existe o los datos son inválidos.",
  });
});

// Error de LOGIN
router.get("/error-login", function (req, res) {
  return res.status(401).send({ error: "Credenciales inválidas" });
});

// REGISTER con Passport (sin session)
router.post(
  "/register",
  passport.authenticate("registro", {
    failureRedirect: "/api/sessions/error",
    session: false,
  }),
  function (req, res) {
    const usuario = req.user;

    res.status(201).send({
      status: "ok",
      message: "Usuario registrado",
      usuario: {
        id: usuario._id,
        first_name: usuario.first_name,
        last_name: usuario.last_name,
        email: usuario.email,
        age: usuario.age,
        role: usuario.role,
        cart: usuario.cart,
      },
    });
  }
);

// LOGIN con Passport + JWT en cookie (sin session)
router.post(
  "/login",
  passport.authenticate("login", {
    failureRedirect: "/api/sessions/error-login",
    session: false,
  }),
  function (req, res) {
    const usuario = req.user;

    const emitirTokenYResponder = function (usuarioFinal) {
      const token = jwt.sign(
        {
          id: usuarioFinal._id,
          first_name: usuarioFinal.first_name,
          last_name: usuarioFinal.last_name,
          email: usuarioFinal.email,
          age: usuarioFinal.age,
          role: usuarioFinal.role,
          cart: usuarioFinal.cart,
        },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      res.cookie("cookieToken", token, {
        httpOnly: true,
        maxAge: 60 * 60 * 1000,
        sameSite: "lax",
      });

      return res.send({
        status: "ok",
        message: "Login correcto",
        usuario: {
          id: usuarioFinal._id,
          first_name: usuarioFinal.first_name,
          last_name: usuarioFinal.last_name,
          email: usuarioFinal.email,
          age: usuarioFinal.age,
          role: usuarioFinal.role,
          cart: usuarioFinal.cart,
        },
      });
    };

    // Si ya tiene cart asignado, respondemos
    if (usuario.cart) {
      return emitirTokenYResponder(usuario);
    }

    // Si NO tiene cart, lo creamos y lo guardamos en el usuario
    CarritoModel.create({ products: [] })
      .then(function (carrito) {
        return UsuarioModel.findByIdAndUpdate(
          usuario._id,
          { cart: carrito._id },
          { new: true }
        );
      })
      .then(function (usuarioActualizado) {
        return emitirTokenYResponder(usuarioActualizado);
      })
      .catch(function (error) {
        console.log("Error creando/asignando carrito:", error);
        return res
          .status(500)
          .send({ error: "No se pudo crear/asignar el carrito del usuario" });
      });
  }
);

// CURRENT (valida JWT desde cookie)
router.get(
  "/current",
  passport.authenticate("current", { session: false }),
  function (req, res) {
    return res.send({ usuario: req.user });
  }
);

// LOGOUT (borra cookie JWT)
router.post("/logout", function (req, res) {
  res.clearCookie("cookieToken");
  return res.send({ status: "ok", message: "Logout correcto" });
});

export default router;
