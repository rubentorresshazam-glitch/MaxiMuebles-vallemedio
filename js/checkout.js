let mp;
let totalCompra = 0;
let carrito = [];
const CLAVE_PUBLICA_MP = "APP_USR-8dbfc25a-2ce6-4d62-a5d3-6b72841f1a46";

window.addEventListener("load", async () => {
  if (window.MercadoPago) {
    mp = new MercadoPago(CLAVE_PUBLICA_MP, { locale: "es-AR" });
  }
  cambiarPantalla("paso-envio");
  await cargarResumenCarrito();
});

function cambiarPantalla(id) {
  document.querySelectorAll(".checkout-screen").forEach(p => p.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

function irPaso(n) {
  const pasos = ["paso-envio", "paso-empresa", "paso-pago", "paso-resumen"];
  cambiarPantalla(pasos[n - 1]);
  if (n === 4) cargarResumenFinal();
}

// ✅ CARGA EL CARRITO
async function cargarResumenCarrito() {
  totalCompra = 0;
  carrito = [];

  const usuario = JSON.parse(localStorage.getItem("usuario"));
  if (!usuario) {
    alert("🔑 Tenés que iniciar sesión para comprar");
    window.location.href = "/mi-cuenta/iniciar-sesion.html";
    return;
  }

  try {
    const res = await peticion(`/carrito?usuario_id=${usuario.id}`);
    console.log("📦 Carrito en checkout:", res);

    if (Array.isArray(res.datos)) carrito = res.datos;
    else if (Array.isArray(res)) carrito = res;

    if (!carrito.length) {
      alert("Tu carrito está vacío");
      window.location.href = "/mi-cuenta/carrito.html";
      return;
    }

    const lista = document.getElementById("lista_productos");
    lista.innerHTML = "";
    carrito.forEach(item => {
      const subt = Number(item.precio || 0) * Number(item.cantidad || 1);
      totalCompra += subt;
      lista.innerHTML += `<p>${item.nombre || 'Producto'} × ${item.cantidad} = <strong>$ ${subt.toLocaleString("es-AR")}</strong></p>`;
    });

    const envio = totalCompra > 50000 ? 0 : 4990;
    totalCompra += envio;
    document.getElementById("res_subtotal").textContent = `$ ${(totalCompra - envio).toLocaleString("es-AR")}`;
    document.getElementById("res_envio").textContent = envio ? `$ ${envio.toLocaleString("es-AR")}` : "GRATIS";
    document.getElementById("res_total").textContent = `$ ${totalCompra.toLocaleString("es-AR")}`;

  } catch (e) {
    console.error("❌ Error cargando carrito:", e);
    alert("No se pudo cargar tu carrito");
  }
}

function cargarResumenFinal() {
  document.getElementById("res_nombre").textContent = document.getElementById("nombre").value || "-";
  document.getElementById("res_dni").textContent = document.getElementById("dni").value || "-";
  document.getElementById("res_tipo_factura").textContent = document.querySelector("#tipo-factura option:checked")?.text || "-";
  document.getElementById("res_telefono").textContent = document.getElementById("telefono").value || "-";
  const calle = document.getElementById("calle").value;
  const loc = document.getElementById("localidad").value;
  const prov = document.querySelector("#provincia option:checked")?.text || "-";
  document.getElementById("res_domicilio").textContent = `${calle}, ${loc}, ${prov}`;
  document.getElementById("res_metodo_pago").textContent = "Pagar con Mercado Pago";
}

// ✅ PAGO — GUARDAMOS EL CARRITO ANTES DE IR A MERCADO PAGO
async function procesarPago() {
  alert("✅ Preparando el pago... en unos segundos irás a Mercado Pago");

  // 🔹 LÍNEA NUEVA: Guardamos el carrito para que llegue a confirmación
  localStorage.setItem("carrito_pago", JSON.stringify({ carrito, totalCompra }));

  const resp = await peticion("/pagar", "POST", {
    carrito: carrito
  });

  console.log("RESPUESTA FINAL:", resp);

  if (resp.ok && resp.datos && resp.datos.link_pago) {
    alert("✅ ¡Listo! A continuación serás redirigido a Mercado Pago para finalizar tu compra");
    window.location.href = resp.datos.link_pago;
  } else {
    alert(resp.mensaje || "No se pudo generar el enlace de pago");
  }
}