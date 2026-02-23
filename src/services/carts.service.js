import CarritoModel from "../model/carrito.model.js";
import TicketModel from "../model/ticket.model.js";

class CartsService {
  async purchase(cid, user) {

    // 🔐 Solo puede comprar su propio carrito
    if (String(user.cart) !== String(cid)) {
      throw new Error("FORBIDDEN");
    }

    const carrito = await CarritoModel.findById(cid).populate("products.product");

    if (!carrito) {
      throw new Error("CART_NOT_FOUND");
    }

    const productosComprados = [];
    const productosSinStock = [];
    let totalCompra = 0;

    for (const item of carrito.products) {
      const producto = item.product;
      const cantidad = item.quantity;

      if (!producto) continue;

      if (producto.stock >= cantidad) {
        producto.stock = producto.stock - cantidad;
        await producto.save();

        productosComprados.push({
          product: producto._id,
          quantity: cantidad
        });

        totalCompra += (producto.precio || 0) * cantidad;

      } else {
        productosSinStock.push({
          product: producto._id,
          quantity: cantidad
        });
      }
    }

    if (productosComprados.length === 0) {
      return {
        status: "error",
        error: "No se pudo concretar la compra (sin stock disponible)",
        productosSinStock
      };
    }

    const code = `TCK-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    const ticket = await TicketModel.create({
      code,
      amount: totalCompra,
      purchaser: user.email
    });

    carrito.products = productosSinStock;
    await carrito.save();

    return {
      status: "success",
      message: "Compra realizada",
      ticket,
      productosSinStock
    };
  }
}

export default CartsService;