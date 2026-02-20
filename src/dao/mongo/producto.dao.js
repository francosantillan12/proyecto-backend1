import ProductoModel from "../../model/producto.model.js";

class ProductoDAO {
  async getAll(filtro = {}, opciones = {}) {
    const { sort = {}, skip = 0, limit = 0 } = opciones;

    return await ProductoModel.find(filtro)
      .sort(sort)
      .skip(skip)
      .limit(limit);
  }

  async count(filtro = {}) {
    return await ProductoModel.countDocuments(filtro);
  }

  async getById(id) {
    return await ProductoModel.findById(id);
  }

  async create(datos) {
    return await ProductoModel.create(datos);
  }

  async update(id, datos) {
    return await ProductoModel.findByIdAndUpdate(id, datos, { new: true });
  }

  async delete(id) {
    return await ProductoModel.findByIdAndDelete(id);
  }
}

export default ProductoDAO;
