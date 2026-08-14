// --------------------------
// VERIFICACIÓN Y CARGA INICIAL
// --------------------------
window.addEventListener("load", () => {
    // BUSCA EN AMBOS LUGARES, COINCIDA O NO EL NOMBRE
    let datos = localStorage.getItem("usuario");
    if (!datos) datos = localStorage.getItem("sesionUsuario");

    if (!datos) {
        alert("Debés iniciar sesión para acceder a esta página");
        // Ruta absoluta
        window.location.href = "/mi-cuenta/iniciar-sesion.html";
        return;
    }

    const datosSesion = JSON.parse(datos);
    const ahora = new Date().getTime();

    // Validación flexible compatible con tu backend/XAMPP
    if (!datosSesion.nombre || !datosSesion.correo) {
        localStorage.clear();
        alert("Tu sesión no es válida. Iniciá nuevamente.");
        // Ruta absoluta
        window.location.href = "/mi-cuenta/iniciar-sesion.html";
        return;
    }

    // Solo comprobamos vencimiento si existe el campo
    if (datosSesion.activa && datosSesion.expira && ahora > datosSesion.expira) {
        localStorage.removeItem("sesionUsuario");
        localStorage.removeItem("usuario");
        localStorage.removeItem("token");
        alert("Tu sesión venció. Iniciá sesión nuevamente");
        // Ruta absoluta
        window.location.href = "/mi-cuenta/iniciar-sesion.html";
        return;
    }

    // CARGAMOS EN AMBOS FORMATO PARA QUE NUNCA FALLE
    localStorage.setItem("sesionUsuario", JSON.stringify({
        ...datosSesion,
        activa: datosSesion.activa || true,
        expira: datosSesion.expira || Date.now() + 7 * 24 * 60 * 60 * 1000
    }));
    localStorage.setItem("usuario", JSON.stringify(datosSesion));

    // Cargar datos en el formulario
    cargarDatosUsuario(datosSesion);
    // Cargar historial de compras
    cargarHistorialCompras(datosSesion.correo);
    // Actualizar el menú con el nombre
    actualizarEnlaceCuenta();
});

// --------------------------
// CAMBIAR ENTRE SECCIONES
// --------------------------
function cambiarSeccion(nombre) {
    document.querySelectorAll(".pestana-perfil").forEach(p => p.classList.remove("activa"));
    document.querySelectorAll(".seccion-perfil").forEach(s => s.classList.remove("activa"));

    if (nombre === "datos") {
        document.querySelector(".pestana-perfil:nth-child(1)").classList.add("activa");
        document.getElementById("seccion-datos").classList.add("activa");
    } else if (nombre === "compras") {
        document.querySelector(".pestana-perfil:nth-child(2)").classList.add("activa");
        document.getElementById("seccion-compras").classList.add("activa");
    }
}

// --------------------------
// CARGAR DATOS DEL USUARIO
// --------------------------
function cargarDatosUsuario(sesion) {
    document.getElementById("perfil-nombre").value = sesion.nombre || "";
    document.getElementById("perfil-telefono").value = sesion.telefono || "";
    document.getElementById("perfil-correo").value = sesion.correo || "";
}

// --------------------------
// GUARDAR CAMBIOS DEL PERFIL
// --------------------------
document.getElementById("formPerfil").addEventListener("submit", function(e) {
    e.preventDefault();

    // LEEMOS DE CUALQUIERA DE LOS DOS
    let datos = localStorage.getItem("usuario");
    if (!datos) datos = localStorage.getItem("sesionUsuario");
    if (!datos) return;

    const sesion = JSON.parse(datos);

    // Actualizar datos
    const nombreNuevo = document.getElementById("perfil-nombre").value.trim();
    const telNuevo = document.getElementById("perfil-telefono").value.trim();
    const nuevaClave = document.getElementById("perfil-clave").value.trim();

    sesion.nombre = nombreNuevo;
    sesion.telefono = telNuevo;
    if (nuevaClave) sesion.clave = nuevaClave;

    // GUARDAMOS EN AMBOS PARA QUE TODO FUNCIONE
    localStorage.setItem("usuario", JSON.stringify(sesion));
    localStorage.setItem("sesionUsuario", JSON.stringify({
        ...sesion,
        activa: true,
        expira: sesion.expira || Date.now() + 7 * 24 * 60 * 60 * 1000
    }));

    // Actualizar menú
    actualizarEnlaceCuenta();

    // Mensaje
    mostrarMensaje("✅ Datos actualizados correctamente", "exito");
    document.getElementById("perfil-clave").value = "";
});

// --------------------------
// HISTORIAL DE COMPRAS
// --------------------------
function cargarHistorialCompras(correoUsuario) {
    const listaDiv = document.getElementById("lista-compras-usuario");
    listaDiv.innerHTML = "";

    const todasLasCompras = JSON.parse(localStorage.getItem("historialCompras")) || [];
    const comprasUsuario = todasLasCompras.filter(c => c.cliente?.email === correoUsuario);

    if (comprasUsuario.length === 0) {
        listaDiv.innerHTML = `<p class="mensaje-vacio">Aún no has realizado ninguna compra.</p>`;
        return;
    }

    comprasUsuario.forEach(compra => {
        const item = document.createElement("div");
        item.className = "item-compra-usuario";
        item.innerHTML = `
            <div class="info-compra">
                <p><strong>Operación:</strong> ${compra.numeroOperacion}</p>
                <p><strong>Fecha:</strong> ${compra.fecha} - ${compra.hora}</p>
                <p><strong>Total:</strong> $ ${compra.total.toLocaleString("es-AR")}</p>
                <p><strong>Estado:</strong> <span class="estado-pagado">Pagado</span></p>
                <p><strong>Factura N°:</strong> ${compra.numeroFactura || "Pendiente"}</p>
            </div>
            <button onclick="verDetalleCompra('${compra.numeroOperacion}')" class="btn-ver-compra">
                Ver detalle
            </button>
        `;
        listaDiv.appendChild(item);
    });
}

// --------------------------
// VER DETALLE DE COMPRA
// --------------------------
function verDetalleCompra(nroOperacion) {
    const todas = JSON.parse(localStorage.getItem("historialCompras")) || [];
    const compra = todas.find(c => c.numeroOperacion === nroOperacion);
    if (!compra) return;

    let detalle = `
        <div class="modal-detalle">
            <div class="modal-contenido">
                <span class="cerrar-modal" onclick="cerrarModal()">&times;</span>
                <h3>Detalle de la Compra ${compra.numeroOperacion}</h3>
                <p><strong>Fecha:</strong> ${compra.fecha} ${compra.hora}</p>
                <p><strong>Método de pago:</strong> ${compra.metodoPago}</p>
                <h4>Productos:</h4>
                <ul>
                    ${compra.productos.map(p => `<li>${p.nombre} × ${p.cantidad} = $ ${(p.precio * p.cantidad).toLocaleString("es-AR")}</li>`).join("")}
                </ul>
                <p><strong>Envío:</strong> ${compra.envio === 0 ? "GRATIS" : `$ ${compra.envio.toLocaleString("es-AR")}`}</p>
                <p class="total-final"><strong>TOTAL:</strong> $ ${compra.total.toLocaleString("es-AR")}</p>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML("beforeend", detalle);
}

function cerrarModal() {
    document.querySelector(".modal-detalle")?.remove();
}

// --------------------------
// CERRAR SESIÓN
// --------------------------
function cerrarSesion() {
    if (confirm("¿Seguro que querés cerrar tu sesión?")) {
        localStorage.removeItem("sesionUsuario");
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");
        // Ruta absoluta
        window.location.href = "/index.html";
    }
}

// --------------------------
// MOSTRAR MENSAJES
// --------------------------
function mostrarMensaje(texto, tipo) {
    const mensaje = document.getElementById("mensaje-perfil");
    mensaje.textContent = texto;
    mensaje.className = `mensaje ${tipo}`;
    mensaje.classList.remove("oculto");
    setTimeout(() => mensaje.classList.add("oculto"), 3000);
}

// --------------------------
// ACTUALIZAR NOMBRE EN EL MENÚ
// --------------------------
function actualizarEnlaceCuenta() {
    let datos = localStorage.getItem('usuario') || localStorage.getItem('sesionUsuario');
    const enlace = document.querySelector('.enlace-cuenta');
    if (datos && enlace) {
        const u = JSON.parse(datos);
        enlace.innerHTML = `<i class="fa-solid fa-user"></i> ${u.nombre}`;
    }
}
document.addEventListener('DOMContentLoaded', actualizarEnlaceCuenta);