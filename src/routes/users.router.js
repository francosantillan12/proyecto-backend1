import { authJwt } from "../middlewares/authJwt.js";
import { soloAdmin } from "../middlewares/soloAdmin.js";

import { Router } from "express";
import mongoose from "mongoose";
import UsuarioModel from "../model/usuario.model.js";

const router = Router();

router.use(authJwt, soloAdmin);

// GET /api/users → listar usuarios (sin password)
router.get("/", function (req, res) {
  UsuarioModel.find().select("-password")
    .then(function (usuarios) {
      res.send({
        status: "ok",
        usuarios: usuarios
      });
    })
    .catch(function (error) {
      console.log("Error GET /api/users:", error);
      res.status(500).send({ error: "Error del servidor" });
    });
});

// GET /api/users/:uid → traer un usuario
router.get("/:uid", function (req, res) {
  const { uid } = req.params;

  if (!mongoose.Types.ObjectId.isValid(uid)) {
    return res.status(400).send({ error: "ID inválido" });
  }

  UsuarioModel.findById(uid).select("-password")
    .then(function (usuario) {
      if (!usuario) {
        return res.status(404).send({ error: "Usuario no encontrado" });
      }

      res.send({
        status: "ok",
        usuario: usuario
      });
    })
    .catch(function (error) {
      console.log("Error GET /api/users/:uid:", error);
      res.status(500).send({ error: "Error del servidor" });
    });
});

// PUT /api/users/:uid → actualizar usuario (sin password)
router.put("/:uid", function (req, res) {
  const { uid } = req.params;

  if (!mongoose.Types.ObjectId.isValid(uid)) {
    return res.status(400).send({ error: "ID inválido" });
  }

  const { first_name, last_name, age, email, role, cart } = req.body;

  const update = {};
  if (first_name !== undefined) update.first_name = first_name;
  if (last_name !== undefined) update.last_name = last_name;
  if (age !== undefined) update.age = age;
  if (email !== undefined) update.email = email;
  if (role !== undefined) update.role = role;
  if (cart !== undefined) update.cart = cart;

  UsuarioModel.findByIdAndUpdate(uid, update, { new: true })
    .select("-password")
    .then(function (usuarioActualizado) {
      if (!usuarioActualizado) {
        return res.status(404).send({ error: "Usuario no encontrado" });
      }

      res.send({
        status: "ok",
        usuario: usuarioActualizado
      });
    })
    .catch(function (error) {
      console.log("Error PUT /api/users/:uid:", error);
      res.status(500).send({ error: "Error del servidor" });
    });
});

// DELETE /api/users/:uid → eliminar usuario
router.delete("/:uid", function (req, res) {
  const { uid } = req.params;

  if (!mongoose.Types.ObjectId.isValid(uid)) {
    return res.status(400).send({ error: "ID inválido" });
  }

  UsuarioModel.findByIdAndDelete(uid)
    .then(function (usuarioEliminado) {
      if (!usuarioEliminado) {
        return res.status(404).send({ error: "Usuario no encontrado" });
      }

      res.send({
        status: "ok",
        message: "Usuario eliminado"
      });
    })
    .catch(function (error) {
      console.log("Error DELETE /api/users/:uid:", error);
      res.status(500).send({ error: "Error del servidor" });
    });
});

export default router;

