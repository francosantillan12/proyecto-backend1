import dotenv from "dotenv";
dotenv.config();

import passport from "passport";
import local from "passport-local";
import UserModel from "../model/usuario.model.js";
import CarritoModel from "../model/carrito.model.js";
import { createHash, isValidPassword } from "../utils.js";
import passportJWT from "passport-jwt";

const LocalStrategy = local.Strategy;

export const inicializarPassport = function () {
  // REGISTER
  passport.use(
    "registro",
    new LocalStrategy(
      { usernameField: "email", passReqToCallback: true },
      function (req, email, password, done) {
        const first_name = req.body.first_name;
        const last_name = req.body.last_name;
        const age = Number(req.body.age);

        if (!first_name || !last_name || !email || !password || !age) {
          return done(null, false);
        }

        UserModel.findOne({ email: email })
          .then(function (usuario) {
            if (usuario) return done(null, false);

            // crear carrito y guardarlo en el usuario
            return CarritoModel.create({ products: [] });
          })
          .then(function (carrito) {
            if (!carrito) return;

            const nuevoUsuario = {
              first_name: first_name,
              last_name: last_name,
              age: age,
              email: email,
              password: createHash(password),
              cart: carrito._id,
              role: "user",
            };

            return UserModel.create(nuevoUsuario);
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
        if (!email || !password) return done(null, false);

        UserModel.findOne({ email: email })
          .then(function (usuario) {
            if (!usuario) return done(null, false);

            const ok = isValidPassword(password, usuario.password);
            if (!ok) return done(null, false);

            done(null, usuario);
          })
          .catch(function (error) {
            done(error);
          });
      }
    )
  );

  // serialize / deserialize
  passport.serializeUser(function (usuario, done) {
    done(null, usuario._id);
  });

  passport.deserializeUser(function (id, done) {
    UserModel.findById(id)
      .then(function (usuario) {
        done(null, usuario);
      })
      .catch(function (error) {
        done(error);
      });
  });

  const JwtStrategy = passportJWT.Strategy;
  const ExtractJwt = passportJWT.ExtractJwt;

  const cookieExtractor = function (req) {
  if (req && req.cookies) {
    return req.cookies.cookieToken;
  }
  return null;
  };

  passport.use(
  "current",
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
      secretOrKey: process.env.JWT_SECRET,
    },
    function (payload, done) {
      try {
        return done(null, payload);
      } catch (error) {
        return done(error);
      }
    }
  )
  );

};
