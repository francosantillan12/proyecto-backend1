import mongoose from "mongoose";

const usersCollection = "users";

const usersSchema = new mongoose.Schema({
  first_name: {
    type: String,
    required: true
  },
  last_name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  age: {
    type: Number,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  cart: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "carritos", // ⚠️ tiene que coincidir con el nombre del mongoose.model(...) de tu CarritoModel
    default: null
  },
  role: {
    type: String,
    default: "user"
  }
});

const UserModel = mongoose.model(usersCollection, usersSchema);

export default UserModel;

