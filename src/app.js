import express from "express";
import { engine } from "express-handlebars";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import mongoose from "mongoose";
import passport from "passport";
import cookieParser from "cookie-parser";
import { inicializarPassport } from "./config/passport.config.js";

// Rutas
import viewsRouter from "./routes/views.router.js";
import productosRouter from "./routes/products.router.js";
import carritosRouter from "./routes/carts.router.js";
import sessionsRouter from "./routes/sessions.router.js";
import usersRouter from "./routes/users.router.js";

dotenv.config();

mongoose
  .connect(process.env.MONGO_URL)
  .then(function () {
    console.log("✅ Conectado a MongoDB Atlas");
  })
  .catch(function (error) {
    console.log("❌ Error al conectar a MongoDB:", error);
  });

// __dirname para ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Instancia de Express
const app = express();

// Middlewares base
app.use(express.json());
app.use(cookieParser());

// Passport (JWT)
inicializarPassport();
app.use(passport.initialize());

// 👉 Disponibilizar usuario en TODAS las vistas (desde JWT si existe)
app.use(function (req, res, next) {
  // si hay token en cookie, intentamos autenticar y cargar req.user
  passport.authenticate("current", { session: false }, function (err, user) {
    if (user) {
      res.locals.usuario = {
        ...user,
        nombre: user.first_name,
        carritoId: user.cart
      };
    } else {
      res.locals.usuario = null;
    }
    
    return next();
  })(req, res, next);
});

// Handlebars
app.engine(
  "handlebars",
  engine({
    layoutsDir: path.join(__dirname, "..", "views", "layouts"),
    defaultLayout: "main",
  })
);
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "..", "views"));

// Archivos estáticos
app.use("/public", express.static(path.join(__dirname, "public")));

// Middlewares base
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // 👈 ESTE ES EL QUE FALTABA
app.use(cookieParser());

// Rutas
app.use("/", viewsRouter);
app.use("/api/products", productosRouter);
app.use("/api/carts", carritosRouter);
app.use("/api/sessions", sessionsRouter);
app.use("/api/users", usersRouter);

// Ruta de test
app.get("/ping", function (req, res) {
  res.send("pong");
});

export default app;
