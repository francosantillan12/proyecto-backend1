import mongoose from "mongoose";

const ticketsCollection = "tickets";

const ticketSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true
  },
  purchase_datetime: {
    type: Date,
    default: Date.now
  },
  amount: {
    type: Number,
    required: true
  },
  purchaser: {
    type: String,
    required: true
  },
  // ✅ Detalle de la compra
  products: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "productos",
        required: true
      },
      quantity: {
        type: Number,
        required: true
      },
      // guardamos el precio al momento de comprar (por si cambia después)
      price: {
        type: Number,
        required: true
      },
      // guardamos el título al momento de comprar (opcional pero útil)
      title: {
        type: String,
        default: ""
      }
    }
  ]
});

const TicketModel = mongoose.model(ticketsCollection, ticketSchema);

export default TicketModel;