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
router.post("/register", function (req, res, next) {
  passport.authenticate("registro", { session: false }, function (err, user) {
    if (err) return next(err);

    if (!user) {
      return res.status(400).send({
        error: "No se pudo completar la operación. El usuario ya existe o los datos son inválidos.",
      });
    }

    return res.status(201).send({
      status: "ok",
      message: "Usuario registrado",
      usuario: {
        id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        age: user.age,
        role: user.role,
        cart: user.cart,
      },
    });
  })(req, res, next);
});



// LOGIN con Passport + JWT en cookie (sin session)
router.post("/login", function (req, res, next) {
  passport.authenticate("login", { session: false }, function (err, user) {
    if (err) return next(err);

    if (!user) {
      return res.status(401).send({ error: "Credenciales inválidas" });
    }

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

    if (user.cart) return emitirTokenYResponder(user);

    CarritoModel.create({ products: [] })
      .then(function (carrito) {
        return UsuarioModel.findByIdAndUpdate(
          user._id,
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
  })(req, res, next);
});


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
