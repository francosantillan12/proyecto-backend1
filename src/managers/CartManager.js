import fs from "fs";

class CartManager {
  constructor(rutaArchivo) {
    this.ruta = rutaArchivo; // "./src/data/carts.json"
  }

  // Leer todos los carritos
  async getCarts() {
    try {
      const data = await fs.promises.readFile(this.ruta, "utf-8");
      return JSON.parse(data);
    } catch (error) {
      return []; // si el archivo no existe o está vacío, devuelve []
    }
  }

  // Crear un nuevo carrito
  async createCart() {
    try {
      const carritos = await this.getCarts();

      const nuevoId =
        carritos.length > 0
          ? carritos[carritos.length - 1].id + 1
          : 1;

      const carrito = { id: nuevoId, products: [] };
      carritos.push(carrito);

      await fs.promises.writeFile(
        this.ruta,
        JSON.stringify(carritos, null, 2)
      );

      return carrito;
    } catch (error) {
      console.error("Error al crear carrito:", error);
      throw error;
    }
  }
}

export default CartManager;

