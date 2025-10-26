import fs from "fs";

class ProductManager {
  constructor(rutaArchivo) {
    this.ruta = rutaArchivo; // por ejemplo "./src/data/products.json"
  }

  // Leer todos los productos
  getProducts() {
    return fs.promises
      .readFile(this.ruta, "utf-8")
      .then((data) => JSON.parse(data))
      .catch(() => []); // si el archivo no existe o está vacío, devuelve []
  }

  // Agregar un nuevo producto
  addProduct(producto) {
    return this.getProducts()
      .then((productos) => {
        const id = productos.length > 0 ? productos[productos.length - 1].id + 1 : 1;
        const nuevoProducto = { id, ...producto };
        productos.push(nuevoProducto);
        return fs.promises
          .writeFile(this.ruta, JSON.stringify(productos, null, 2))
          .then(() => nuevoProducto);
      });
  }
}

export default ProductManager;
