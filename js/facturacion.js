// Al cargar la página
window.addEventListener("load", () => {
    cargarListaCompras();
});

// Cargar todas las compras guardadas
function cargarListaCompras() {
    const listaDiv = document.getElementById("lista-compras");
    listaDiv.innerHTML = "";

    // Recuperar todas las compras guardadas
    let todasLasCompras = JSON.parse(localStorage.getItem("historialCompras")) || [];
    const ultima = JSON.parse(localStorage.getItem("ultimaFactura"));
    if (ultima && !todasLasCompras.some(c => c.numeroOperacion === ultima.numeroOperacion)) {
        todasLasCompras.unshift(ultima);
        localStorage.setItem("historialCompras", JSON.stringify(todasLasCompras));
    }

    // Aplicar filtros
    const textoBusqueda = document.getElementById("buscar").value.toLowerCase().trim();
    const fechaFiltro = document.getElementById("fecha-filtro").value;

    const comprasFiltradas = todasLasCompras.filter(compra => {
        const coincideTexto = 
            compra.numeroOperacion.toLowerCase().includes(textoBusqueda) ||
            (compra.numeroFactura && compra.numeroFactura.toLowerCase().includes(textoBusqueda)) ||
            compra.cliente.nombre.toLowerCase().includes(textoBusqueda);
        
        const coincideFecha = !fechaFiltro || compra.fecha === fechaFiltro;
        return coincideTexto && coincideFecha;
    });

    if (comprasFiltradas.length === 0) {
        listaDiv.innerHTML = "<p class='mensaje-vacio'>No se encontraron compras con esos filtros.</p>";
        return;
    }

    // Mostrar lista
    comprasFiltradas.forEach(compra => {
        const item = document.createElement("div");
        item.className = "item-compra";
        item.innerHTML = `
            <div class="info-compra">
                <p><strong>Operación:</strong> ${compra.numeroOperacion}</p>
                <p><strong>Fecha:</strong> ${compra.fecha} - ${compra.hora}</p>
                <p><strong>Cliente:</strong> ${compra.cliente.nombre}</p>
                <p><strong>Total:</strong> $ ${compra.total.toLocaleString("es-AR")}</p>
                <p><strong>Factura N°:</strong> ${compra.numeroFactura || "Pendiente"}</p>
            </div>
            <button onclick="verDetalleFactura('${compra.numeroOperacion}')" class="btn-ver">Ver y facturar</button>
        `;
        listaDiv.appendChild(item);
    });
}

// Ver detalle completo de una compra
function verDetalleFactura(nroOperacion) {
    const todas = JSON.parse(localStorage.getItem("historialCompras")) || [];
    const compra = todas.find(c => c.numeroOperacion === nroOperacion);
    if (!compra) return;

    const contenido = document.getElementById("contenido-detalle");
    contenido.innerHTML = `
        <div class="fila-detalle">
            <div class="columna">
                <h4>Datos de la operación</h4>
                <p><strong>N° Operación:</strong> ${compra.numeroOperacion}</p>
                <p><strong>Fecha:</strong> ${compra.fecha}</p>
                <p><strong>Hora:</strong> ${compra.hora}</p>
                <p><strong>Factura N°:</strong> ${compra.numeroFactura || "Sin generar"}</p>
            </div>
            <div class="columna">
                <h4>Datos del cliente</h4>
                <p><strong>Nombre:</strong> ${compra.cliente.nombre}</p>
                <p><strong>Documento:</strong> ${compra.cliente.documento}</p>
                <p><strong>Dirección:</strong> ${compra.cliente.direccion}, ${compra.cliente.localidad}, ${compra.cliente.provincia}</p>
                <p><strong>Email:</strong> ${compra.cliente.email || "Sin correo"}</p>
            </div>
        </div>
        <h4>Detalle de productos</h4>
        <table class="tabla-detalle">
            <thead>
                <tr><th>Cant.</th><th>Descripción</th><th>P. Unitario</th><th>Subtotal</th></tr>
            </thead>
            <tbody>
                ${compra.productos.map(p => `
                    <tr>
                        <td>${p.cantidad}</td>
                        <td>${p.nombre}</td>
                        <td>$ ${p.precio.toLocaleString("es-AR")}</td>
                        <td>$ ${(p.precio * p.cantidad).toLocaleString("es-AR")}</td>
                    </tr>
                `).join("")}
            </tbody>
            <tfoot>
                <tr><td colspan="3">Subtotal:</td><td>$ ${compra.subtotal.toLocaleString("es-AR")}</td></tr>
                <tr><td colspan="3">Envío:</td><td>${compra.envio === 0 ? "GRATIS" : `$ ${compra.envio.toLocaleString("es-AR")}`}</td></tr>
                <tr><td colspan="3"><strong>TOTAL:</strong></td><td><strong>$ ${compra.total.toLocaleString("es-AR")}</strong></td></tr>
            </tfoot>
        </table>
    `;

    // Guardar la compra seleccionada para usar en las acciones
    localStorage.setItem("facturaActual", JSON.stringify(compra));
    document.getElementById("panel-detalle").classList.remove("oculto");
    window.scrollTo({ top: 0, behavior: "smooth" });
}

// Imprimir factura
function imprimirFactura() {
    const datos = JSON.parse(localStorage.getItem("facturaActual"));
    if (!datos) return alert("No hay factura seleccionada");
    localStorage.setItem("datosFactura", JSON.stringify(datos));
    window.open("factura-imprimir.html", "_blank");
}

// Enviar factura por correo
async function enviarFacturaCorreo() {
    const datos = JSON.parse(localStorage.getItem("facturaActual"));
    if (!datos) return alert("No hay factura seleccionada");
    if (!datos.cliente.email) return alert("El cliente no tiene correo registrado");

    alert("Enviando factura por correo...");
    // Acá conectás con tu servicio de correo
    console.log("Enviando a:", datos.cliente.email);
    // await emailjs.send(...)
    alert("✅ Factura enviada correctamente");
}

// Transmitir factura a ARCA/AFIP
async function transmitirARCA() {
    const datos = JSON.parse(localStorage.getItem("facturaActual"));
    if (!datos) return alert("No hay factura seleccionada");

    if (!datos.numeroFactura) {
        datos.numeroFactura = `A-00010-${Math.floor(100000 + Math.random() * 900000)}`;
        actualizarFactura(datos);
    }

    alert("Transmitiendo factura a ARCA...");
    // Acá irá la conexión oficial con WSFE
    console.log("Transmitiendo factura:", datos.numeroFactura);
    alert("✅ Factura registrada en ARCA correctamente");
}

// Actualizar datos de una factura en el historial
function actualizarFactura(datosActualizados) {
    const historial = JSON.parse(localStorage.getItem("historialCompras")) || [];
    const indice = historial.findIndex(c => c.numeroOperacion === datosActualizados.numeroOperacion);
    if (indice !== -1) historial[indice] = datosActualizados;
    localStorage.setItem("historialCompras", JSON.stringify(historial));
    localStorage.setItem("facturaActual", JSON.stringify(datosActualizados));
    cargarListaCompras();
}

function limpiarFiltros() {
    document.getElementById("buscar").value = "";
    document.getElementById("fecha-filtro").value = "";
    cargarListaCompras();
}

function cerrarDetalle() {
    document.getElementById("panel-detalle").classList.add("oculto");
}