import { Router } from "express";
import UsuarioModel from "../model/usuario.model.js";
import { createHash } from "../utils.js";

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

export default router;
