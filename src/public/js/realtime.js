// Cliente Socket.io: conexión básica
const socket = io();

socket.on("connect", function () {
  console.log("🟢 Conectado por websockets. ID:", socket.id);
});

console.log("✅ realtime.js cargado correctamente");

socket.on("productosActuales", function (productos) {
  console.log("🟡 Lista recibida:", productos);

  const lista = document.getElementById("lista");
  if (!lista) return;

  if (!productos || productos.length === 0) {
    lista.innerHTML = "<li>No hay productos cargados.</li>";
    return;
  }

  lista.innerHTML = productos
    .map(function (p) {
      return `<li><strong>${p.title || p.titulo || "(sin título)"}</strong> — $${p.price || p.precio} (Stock: ${p.stock ?? "-"})<br><small>ID: ${p.id}</small></li>`;
    })
    .join("");
});


// ---- Crear producto (cliente -> servidor)
(function () {
  var formCrear = document.getElementById("form-crear");
  if (!formCrear) return;

  formCrear.addEventListener("submit", function (e) {
    e.preventDefault();

    var datos = {
      title: formCrear.titulo.value.trim(),
      price: Number(formCrear.precio.value),
      code: formCrear.codigo.value.trim(),
      stock: Number(formCrear.stock.value)
      // Puedo agregar más campos si luego los sumamos al form:
      // description, status, category, thumbnails, etc.
    };

    if (!datos.title || !datos.code || isNaN(datos.price) || isNaN(datos.stock)) {
      console.log("⚠️ Datos inválidos", datos);
      return;
    }

    console.log("📤 Enviando crearProducto:", datos);
    socket.emit("crearProducto", datos);
    formCrear.reset();
  });
})();

// ---- Eliminar producto (cliente -> servidor)
(function () {
  var formEliminar = document.getElementById("form-eliminar");
  if (!formEliminar) return;

  formEliminar.addEventListener("submit", function (e) {
    e.preventDefault();

    // Puede ser numérico (1,2,3) o string según tu JSON
    var idInput = formEliminar.id.value.trim();
    var id = /^\d+$/.test(idInput) ? Number(idInput) : idInput;

    if (!id && id !== 0) {
      console.log("⚠️ ID inválido:", idInput);
      return;
    }

    console.log("📤 Enviando eliminarProducto:", id);
    socket.emit("eliminarProducto", id);
    formEliminar.reset();
  });
})();

