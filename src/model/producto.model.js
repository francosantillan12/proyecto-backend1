import mongoose from "mongoose";

const productosCollection = "productos";

const productosSchema = new mongoose.Schema({
  titulo: {
    type: String,
    required: true
  },
  descripcion: {
    type: String,
    default: ""
  },
  precio: {
    type: Number,
    required: true
  },
  imagen: {
    type: String,
    default: ""
  },
  codigo: {
    type: String,
    required: true,
    unique: true
  },
  stock: {
    type: Number,
    default: 0
  },
  categoria: {
    type: String,
    default: "" 
  },
  fechaCreacion: {
    type: Date,
    default: Date.now
  }
});

const ProductoModel = mongoose.model(productosCollection, productosSchema);

export default ProductoModel;
