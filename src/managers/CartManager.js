import fs from "fs";

class CartManager {
  constructor(rutaArchivo) {
    this.ruta = rutaArchivo; // "./src/data/carts.json"
  }

  getCarts() {
    return fs.promises
      .readFile(this.ruta, "utf-8")
      .then((data) => JSON.parse(data))
      .catch(() => []);
  }

  createCart() {
    return this.getCarts()
      .then((carritos) => {
        const nuevoId = carritos.length > 0 ? carritos[carritos.length - 1].id + 1 : 1;
        const carrito = { id: nuevoId, products: [] };
        carritos.push(carrito);
        return fs.promises
          .writeFile(this.ruta, JSON.stringify(carritos, null, 2))
          .then(() => carrito);
      });
  }
}

export default CartManager;
