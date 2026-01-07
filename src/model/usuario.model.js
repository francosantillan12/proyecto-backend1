import mongoose from "mongoose";

const usuariosCollection = "usuarios";

const usuariosSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  rol: {
    type: String,
    default: "user"
  },
  fechaCreacion: {
    type: Date,
    default: Date.now
  }
});

const UsuarioModel = mongoose.model(usuariosCollection, usuariosSchema);

export default UsuarioModel;
