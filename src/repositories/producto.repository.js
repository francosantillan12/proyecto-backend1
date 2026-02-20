import ProductoDAO from "../dao/mongo/producto.dao.js";

class ProductoRepository {
  constructor() {
    this.dao = new ProductoDAO();
  }

  getProductos(filtro = {}, opciones = {}) {
    return this.dao.getAll(filtro, opciones);
  }

  countProductos(filtro = {}) {
    return this.dao.count(filtro);
  }

  getProductoPorId(id) {
    return this.dao.getById(id);
  }

  crearProducto(datosProducto) {
    return this.dao.create(datosProducto);
  }

  actualizarProducto(id, datos) {
    return this.dao.update(id, datos);
  }

  eliminarProducto(id) {
    return this.dao.delete(id);
  }
}

export default ProductoRepository;
