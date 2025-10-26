import fs from "fs";

class ProductManager {
  constructor(rutaArchivo) {
    this.ruta = rutaArchivo; // por ejemplo "./src/data/products.json"
  }

  // Leer todos los productos
  async getProducts() {
    try {
      const data = await fs.promises.readFile(this.ruta, "utf-8");
      return JSON.parse(data);
    } catch (error) {
      return []; // si el archivo no existe o está vacío, devuelve []
    }
  }

  // Agregar un nuevo producto
  async addProduct(producto) {
    try {
      const productos = await this.getProducts();
      const id =
        productos.length > 0
          ? productos[productos.length - 1].id + 1
          : 1;

      const nuevoProducto = { id, ...producto };
      productos.push(nuevoProducto);

      await fs.promises.writeFile(
        this.ruta,
        JSON.stringify(productos, null, 2)
      );

      return nuevoProducto;
    } catch (error) {
      console.error("Error al agregar producto:", error);
      throw error;
    }
  }
}

export default ProductManager;
