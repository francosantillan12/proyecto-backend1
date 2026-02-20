import UserDTO from "../dto/user.dto.js";
import { Router } from "express";
import passport from "passport";
import CarritoModel from "../model/carrito.model.js";
import UsuarioModel from "../model/usuario.model.js";
import jwt from "jsonwebtoken";

import crypto from "crypto";
import { transporter } from "../utils/mailer.js";
import { createHash, isValidPassword } from "../utils.js";

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

// POST /api/sessions/forgot-password
router.post("/forgot-password", async function (req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).send({ error: "Falta el email" });
    }

    const usuario = await UsuarioModel.findOne({ email: email });
    
    // Por seguridad, respondemos OK aunque no exista
    if (!usuario) {
      return res.send({ status: "ok", message: "Si el email existe, se enviará un enlace." });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expira = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    usuario.resetToken = token;
    usuario.resetTokenExp = expira;
    await usuario.save();

    const link = `${process.env.BASE_URL}/reset-password/${token}`;

    await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: usuario.email,
      subject: "Restablecer contraseña",
      html: `
        <h2>Restablecer contraseña</h2>
        <p>Hacé click en el botón para restablecer tu contraseña (expira en 1 hora).</p>
        <a href="${link}" style="display:inline-block;padding:10px 14px;background:#222;color:#fff;text-decoration:none;border-radius:6px;">
          Restablecer contraseña
        </a>
        <p>Si no pediste esto, ignorá el correo.</p>
      `
    });

    return res.send({ status: "ok", message: "Si el email existe, se enviará un enlace." });
  } catch (error) {
    console.log("Error forgot-password:", error);
    return res.status(500).send({ error: "Error enviando el correo" });
  }
});

// POST /api/sessions/reset-password/:token
router.post("/reset-password/:token", async function (req, res) {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).send({ error: "Falta newPassword" });
    }

    const usuario = await UsuarioModel.findOne({
      resetToken: token,
      resetTokenExp: { $gt: new Date() } // que no haya expirado
    });

    if (!usuario) {
      return res.status(400).send({ error: "Token inválido o expirado" });
    }

    // ❌ No permitir misma contraseña anterior
    const esLaMisma = isValidPassword(newPassword, usuario.password);
    if (esLaMisma) {
      return res.status(400).send({ error: "No podés usar la misma contraseña anterior" });
    }

    usuario.password = createHash(newPassword);
    usuario.resetToken = null;
    usuario.resetTokenExp = null;

    await usuario.save();

    return res.send({ status: "ok", message: "Contraseña actualizada correctamente" });
  } catch (error) {
    console.log("Error reset-password:", error);
    return res.status(500).send({ error: "Error al actualizar la contraseña" });
  }
});

// CURRENT ()
router.get(
  "/current",
  passport.authenticate("current", { session: false }),
  function (req, res) {
    return res.send({ usuario: new UserDTO(req.user) });
  }
);


// LOGOUT (borra cookie JWT)
router.post("/logout", function (req, res) {
  res.clearCookie("cookieToken");
  return res.send({ status: "ok", message: "Logout correcto" });
});

export default router;
