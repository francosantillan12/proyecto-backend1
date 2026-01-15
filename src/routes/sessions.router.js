import { Router } from "express";
import passport from "passport";
import CarritoModel from "../model/carrito.model.js";
import UsuarioModel from "../model/usuario.model.js";

const router = Router();

// Ruta de error de Passport
router.get("/error", function (req, res) {
  res.status(400).send({
    error:
      "No se pudo completar la operación. El usuario ya existe o los datos son inválidos.",
  });
});

// REGISTER con Passport
router.post(
  "/register",
  passport.authenticate("registro", {
    failureRedirect: "/api/sessions/error",
  }),
  function (req, res) {
    const usuario = req.user;

    res.status(201).send({
      status: "ok",
      message: "Usuario registrado",
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
      },
    });
  }
);

// LOGIN con Passport + carrito persistente por usuario
router.post(
  "/login",
  passport.authenticate("login", {
    failureRedirect: "/api/sessions/error",
  }),
  function (req, res) {
    const usuario = req.user;

    // 1) Si ya tiene carrito asignado, lo usamos
    if (usuario.carritoId) {
      req.session.usuario = {
        id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        carritoId: usuario.carritoId,
      };

      return res.send({
        status: "ok",
        message: "Login correcto",
        usuario: req.session.usuario,
      });
    }

    // 2) Si NO tiene carrito, lo creamos y lo guardamos en el usuario
    CarritoModel.create({ products: [] })
      .then(function (carrito) {
        return UsuarioModel.findByIdAndUpdate(
          usuario._id,
          { carritoId: carrito._id },
          { new: true }
        ).then(function (usuarioActualizado) {
          req.session.usuario = {
            id: usuarioActualizado._id,
            nombre: usuarioActualizado.nombre,
            email: usuarioActualizado.email,
            rol: usuarioActualizado.rol,
            carritoId: usuarioActualizado.carritoId,
          };

          return res.send({
            status: "ok",
            message: "Login correcto",
            usuario: req.session.usuario,
          });
        });
      })
      .catch(function (error) {
        console.log("Error creando/asignando carrito:", error);
        return res
          .status(500)
          .send({ error: "No se pudo crear/asignar el carrito del usuario" });
      });
  }
);

// CURRENT
router.get("/current", function (req, res) {
  // Si hay sesión, devolvemos lo más útil (incluye carritoId)
  if (req.session && req.session.usuario) {
    return res.send({ usuario: req.session.usuario });
  }

  if (!req.user) {
    return res.status(401).send({ error: "No hay sesión activa" });
  }

  res.send({
    usuario: {
      id: req.user._id,
      nombre: req.user.nombre,
      email: req.user.email,
      rol: req.user.rol,
      carritoId: req.user.carritoId || null,
    },
  });
});

// LOGOUT
router.post("/logout", function (req, res) {
  if (req.logout) {
    req.logout(function () {
      req.session.destroy(function (err) {
        if (err) {
          return res.status(500).send({ error: "Error al cerrar sesión" });
        }
        res.send({ status: "ok", message: "Logout correcto" });
      });
    });
  } else {
    req.session.destroy(function (err) {
      if (err) {
        return res.status(500).send({ error: "Error al cerrar sesión" });
      }
      res.send({ status: "ok", message: "Logout correcto" });
    });
  }
});

export default router;









/*
import { Router } from "express";
import UsuarioModel from "../model/usuario.model.js";
import { createHash, isValidPassword } from "../utils.js";

const router = Router();

router.post("/register", function (req, res) {
  const { nombre, email, password } = req.body;

  if (!nombre || !email || !password) {
    return res.status(400).send({ error: "Faltan datos" });
  }

  UsuarioModel.findOne({ email: email })
    .then(function (usuario) {
      if (usuario) {
        return res.status(409).send({ error: "El email ya está registrado" });
      }

      const nuevoUsuario = {
        nombre: nombre,
        email: email,
        password: createHash(password),
        rol: "user"
      };

      return UsuarioModel.create(nuevoUsuario);
    })
    .then(function (usuarioCreado) {
      // si ya respondimos con 409 arriba, usuarioCreado puede venir undefined
      if (!usuarioCreado) return;

      res.status(201).send({
        status: "ok",
        message: "Usuario registrado",
        usuario: {
          id: usuarioCreado._id,
          nombre: usuarioCreado.nombre,
          email: usuarioCreado.email,
          rol: usuarioCreado.rol
        }
      });
    })
    .catch(function (error) {
      console.log("Error register:", error);
      res.status(500).send({ error: "Error del servidor" });
    });
});

router.post("/login", function (req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send({ error: "Faltan datos" });
  }

  UsuarioModel.findOne({ email: email })
    .then(function (usuario) {
      if (!usuario) {
        return res.status(401).send({ error: "Credenciales inválidas" });
      }

      const okPassword = isValidPassword(password, usuario.password);
      if (!okPassword) {
        return res.status(401).send({ error: "Credenciales inválidas" });
      }

      req.session.usuario = {
        id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol
      };

      res.send({
        status: "ok",
        message: "Login correcto",
        usuario: req.session.usuario
      });
    })
    .catch(function (error) {
      console.log("Error login:", error);
      res.status(500).send({ error: "Error del servidor" });
    });
});

router.get("/current", function (req, res) {
  if (!req.session || !req.session.usuario) {
    return res.status(401).send({ error: "No hay sesión activa" });
  }

  res.send({ usuario: req.session.usuario });
});

router.post("/logout", function (req, res) {
  req.session.destroy(function (err) {
    if (err) {
      return res.status(500).send({ error: "Error al cerrar sesión" });
    }
    res.send({ status: "ok", message: "Logout correcto" });
  });
});



export default router;
*/