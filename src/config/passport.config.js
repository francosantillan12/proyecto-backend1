import passport from "passport";
import local from "passport-local";
import UsuarioModel from "../model/usuario.model.js";
import { createHash, isValidPassword } from "../utils.js";

const LocalStrategy = local.Strategy;

export const inicializarPassport = function () {
  //  REGISTRO
  passport.use(
    "registro",
    new LocalStrategy(
      { usernameField: "email", passReqToCallback: true },
      function (req, email, password, done) {
        const nombre = req.body.nombre;

        if (!nombre || !email || !password) {
          return done(null, false, { message: "Faltan datos" });
        }

        UsuarioModel.findOne({ email: email })
          .then(function (usuario) {
            if (usuario) {
              return done(null, false, { message: "El email ya está registrado" });
            }

            const nuevoUsuario = {
              nombre: nombre,
              email: email,
              password: createHash(password),
              rol: "user",
            };

            return UsuarioModel.create(nuevoUsuario);
          })
          .then(function (usuarioCreado) {
            if (!usuarioCreado) return;
            done(null, usuarioCreado);
          })
          .catch(function (error) {
            done(error);
          });
      }
    )
  );

  // LOGIN
  passport.use(
    "login",
    new LocalStrategy(
      { usernameField: "email", passReqToCallback: true },
      function (req, email, password, done) {
        if (!email || !password) {
          return done(null, false);
        }

        UsuarioModel.findOne({ email: email })
          .then(function (usuario) {
            if (!usuario) {
              return done(null, false);
            }

            const ok = isValidPassword(password, usuario.password);
            if (!ok) {
              return done(null, false);
            }

            done(null, usuario);
          })
          .catch(function (error) {
            done(error);
          });
      }
    )
  );

  // SESIONES (serialize / deserialize)
  passport.serializeUser(function (usuario, done) {
    done(null, usuario._id);
  });

  passport.deserializeUser(function (id, done) {
    UsuarioModel.findById(id)
      .then(function (usuario) {
        done(null, usuario);
      })
      .catch(function (error) {
        done(error);
      });
  });
};
