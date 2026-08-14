// ===== PÁGINA DE CONFIRMACIÓN DE PAGO =====

window.addEventListener("DOMContentLoaded", () => {
    // 🔹 RECUPERAR EL CARRITO QUE VINO DEL CHECKOUT
    const guardado = localStorage.getItem("carrito_pago");
    let carrito = [];
    let totalCompra = 0;

    if (guardado) {
        const datos = JSON.parse(guardado);
        carrito = datos.carrito || [];
        totalCompra = datos.totalCompra || 0;

        console.log("✅ Carrito recuperado:", carrito);

        // Mostrar productos
        mostrarProductos(carrito);

        // Mostrar total formateado
        document.getElementById("mp-total").textContent = `$ ${totalCompra.toLocaleString("es-AR", { minimumFractionDigits: 2 })}`;

        // ✅ LIMPIAR: borramos el carrito guardado
        localStorage.removeItem("carrito_pago");
    }

    // 🔹 RECIBIR DATOS DE MERCADO PAGO DESDE LA URL
    const params = new URLSearchParams(window.location.search);
    const pagoId = params.get("payment_id") || params.get("preference_id") || "—";
    document.getElementById("mp-orden-id").textContent = pagoId;

    // Mostrar fecha y hora actual
    const fecha = new Date().toLocaleString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
    document.getElementById("mp-fecha").textContent = fecha;
});

// ===== MOSTRAR LISTA DE PRODUCTOS =====
function mostrarProductos(carrito) {
    const contenedor = document.getElementById("lista_productos");
    if (!contenedor || !carrito.length) return;

    contenedor.innerHTML = "";
    carrito.forEach(item => {
        const nombre = item.nombre || "Producto";
        const cantidad = item.cantidad || 1;
        const precio = Number(item.precio) || 0;
        const subtotal = precio * cantidad;

        contenedor.innerHTML += `
            <div class="producto-confirmacion">
                <span>${nombre}</span>
                <span>${cantidad} × $ ${precio.toLocaleString("es-AR")} = $ ${subtotal.toLocaleString("es-AR")}</span>
            </div>
        `;
    });
}

// ===== MOSTRAR / OCULTAR CAMPO DE CORREO =====
function mostrarCampoCorreo() {
    const seleccion = document.querySelector('input[name="enviar_factura"]:checked');
    if (!seleccion) return;

    const valor = seleccion.value;
    const campoCorreo = document.getElementById("campo-correo");

    if (valor === "si") {
        campoCorreo.classList.add("mostrar");
    } else {
        campoCorreo.classList.remove("mostrar");
        // Limpiar el correo cuando oculta el campo
        document.getElementById("correo_cliente").value = "";
    }
}

// ===== FUNCIÓN DEL BOTÓN "ACEPTAR" — VALIDA Y ENVÍA =====
async function solicitarFactura() {
    const correo = document.getElementById("correo_cliente").value.trim();
    const pagoId = document.getElementById("mp-orden-id").textContent;

    // ✅ VALIDAR QUE NO ESTÉ VACÍO
    if (!correo) {
        alert("⚠️ Por favor escribí tu correo electrónico.");
        document.getElementById("correo_cliente").focus();
        return;
    }

    // ✅ VALIDAR QUE TENGA FORMATO DE CORREO
    if (!correo.includes("@") || correo.length < 5) {
        alert("⚠️ Por favor ingresá un correo electrónico válido.\nEjemplo: nombre@correo.com");
        document.getElementById("correo_cliente").focus();
        return;
    }

    try {
        // ✅ ENVIAR AL SERVIDOR: correo + número de operación
        const respuesta = await peticion("/enviar-factura", "POST", {
            correo: correo,
            pago_id: pagoId
        });

        // ✅ RESPUESTA EXITOSA
        if (respuesta.ok) {
            alert(`✅ ¡Listo! Tu factura fue enviada a:\n📧 ${correo}`);

            // Limpiar todo para que quede prolijo
            document.getElementById("form-factura").reset();
            document.getElementById("campo-correo").classList.remove("mostrar");
            document.querySelector('input[name="enviar_factura"][value="no"]').checked = true;
        } else {
            alert(respuesta.mensaje || "⚠️ No se pudo enviar. Intentá más tarde.");
        }
    } catch (error) {
        console.error("❌ Error al enviar factura:", error);
        alert("⚠️ Ocurrió un problema de conexión. Intentá nuevamente.");
    }
}

// 📋 Leemos el ID del pedido desde la dirección URL
const parametros = new URLSearchParams(window.location.search);
const pedidoId = parametros.get('id') || parametros.get('external_reference')?.replace('pedido-', '');

// ✅ Cuando carga la página: buscamos y mostramos los datos del pedido
document.addEventListener('DOMContentLoaded', async () => {
    if (!pedidoId) {
        console.warn("⚠️ No se recibió número de pedido");
        const elem = document.getElementById('mp-orden-id');
        if (elem) elem.textContent = "Sin datos";
        return;
    }

    console.log("✅ Pedido N°:", pedidoId);
    const ordenElem = document.getElementById('mp-orden-id');
    const fechaElem = document.getElementById('mp-fecha');
    
    if (ordenElem) ordenElem.textContent = pedidoId;
    if (fechaElem) fechaElem.textContent = new Date().toLocaleString('es-AR');

    // 📄 Cargar datos del pedido desde tu servidor
    try {
        const respuesta = await fetch(`/api/pedido/${pedidoId}`);
        const pedido = await respuesta.json();

        if (pedido && pedido.total) {
            const totalElem = document.getElementById('mp-total');
            if (totalElem) totalElem.textContent = `$${Number(pedido.total).toLocaleString('es-AR')}`;
            
            // Guardamos datos para la factura
            window.datosPedido = pedido;
        }
    } catch (error) {
        console.error("❌ Error cargando datos:", error);
    }
});

// 🔍 Mostrar / Ocultar campo de correo
function mostrarCampoCorreo() {
    const seleccion = document.querySelector('input[name="enviar_factura"]:checked');
    if (!seleccion) return;
    
    const valor = seleccion.value;
    const campoCorreo = document.getElementById('campo-correo');
    if (campoCorreo) {
        campoCorreo.style.display = valor === 'si' ? 'block' : 'none';
    }
}

// 🧾 Generar y enviar factura al correo del cliente
async function solicitarFactura() {
    const correoElem = document.getElementById('correo_cliente');
    if (!correoElem) return;

    const correo = correoElem.value.trim();

    if (!correo) {
        alert("⚠️ Por favor escribí tu correo electrónico");
        return;
    }

    if (!pedidoId) {
        alert("⚠️ No se encontró el número de pedido");
        return;
    }

    if (!correo.includes('@')) {
        alert("⚠️ Escribí un correo electrónico válido");
        return;
    }

    try {
        const boton = document.querySelector('.btn-enviar-factura');
        if (boton) {
            boton.innerHTML = "<i class='fa-solid fa-spinner fa-spin'></i> Enviando...";
            boton.disabled = true;
        }

        // ✅ Enviamos al servidor para que genere la factura y la envíe
        const respuesta = await fetch(`/api/facturar-pedido/${pedidoId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ correoCliente: correo })
        });

        const resultado = await respuesta.json();

        if (resultado.ok) {
            alert(`✅ ¡Factura generada con éxito!\n\n📧 Enviada a: ${correo}\n🧾 N° de Factura: ${resultado.factura?.numeroFactura || 'Pendiente'}`);
        } else {
            alert("⚠️ Hubo un problema: " + (resultado.error || "Intenta más tarde"));
        }

    } catch (error) {
        alert("❌ Error de conexión. Intenta nuevamente.");
        console.error(error);
    } finally {
        const boton = document.querySelector('.btn-enviar-factura');
        if (boton) {
            boton.innerHTML = "<i class='fa-solid fa-check'></i> Enviar Factura";
            boton.disabled = false;
        }
    }
}