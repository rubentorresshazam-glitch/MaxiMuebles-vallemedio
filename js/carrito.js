document.addEventListener('DOMContentLoaded', async () => {
  console.log("🛒 Página del carrito cargada");
  await cargarResumenCarrito();
});

async function agregarAlCarrito(producto) {
  const usuarioGuardado = localStorage.getItem('usuario');
  if (usuarioGuardado) {
    const usuario = JSON.parse(usuarioGuardado);
    try {
      await peticion('/carrito', 'POST', {
        usuario_id: usuario.id,
        producto_id: producto.id,
        cantidad: producto.cantidad
      });
      if (typeof actualizarContadorCarrito === 'function') {
        await actualizarContadorCarrito();
      }
      console.log('✅ Producto agregado a tu cuenta');
      return true;
    } catch (error) {
      console.error('❌ Error al agregar:', error);
      alert('No se pudo agregar el producto');
      return false;
    }
  } else {
    alert('Iniciá sesión para agregar productos al carrito');
    return false;
  }
}

async function cargarResumenCarrito() {
  const grilla = document.getElementById("lista-productos");
  const vacio = document.getElementById("carrito-vacio");
  const contenido = document.getElementById("carrito-contenido");
  const subtotalElem = document.getElementById("subtotal");
  const totalElem = document.getElementById("total");

  if (!grilla) return;
  grilla.innerHTML = `<p style="padding:20px;text-align:center;">Cargando carrito...</p>`;

  const usuarioGuardado = localStorage.getItem('usuario');
  if (!usuarioGuardado) {
    vacio.style.display = "block";
    contenido.style.display = "none";
    grilla.innerHTML = `<p style="padding:20px;text-align:center;">Iniciá sesión primero</p>`;
    return;
  }

  const usuario = JSON.parse(usuarioGuardado);

  try {
    const res = await peticion(`/carrito?usuario_id=${usuario.id}`);
    console.log("📦 Productos recibidos:", res);

    let items = [];
    if (Array.isArray(res.datos)) items = res.datos;
    else if (Array.isArray(res)) items = res;

    if (items.length === 0) {
      vacio.style.display = "block";
      contenido.style.display = "none";
      return;
    }

    vacio.style.display = "none";
    contenido.style.display = "block";
    grilla.innerHTML = "";
    let total = 0;

    items.forEach(item => {
      const nombreProducto = item.nombre || item.producto || 'Producto sin nombre';
      const precio = Number(item.precio);
      const cant = Number(item.cantidad);
      const subt = precio * cant;
      total += subt;

      grilla.innerHTML += `
        <div class="fila-producto">
          <div class="col-producto"><strong>${nombreProducto}</strong></div>
          <div class="col-precio">$ ${precio.toLocaleString('es-AR')}</div>
          <div class="col-cantidad">
            <button class="btn-menos" data-id="${item.id}" data-cant="${cant}">-</button>
            <span>${cant}</span>
            <button class="btn-mas" data-id="${item.id}" data-cant="${cant}">+</button>
          </div>
          <div class="col-subtotal">$ ${subt.toLocaleString('es-AR')}</div>
          <div class="col-accion">
            <button class="btn-quitar" data-id="${item.id}">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </div>
      `;
    });

    subtotalElem.textContent = `$ ${total.toLocaleString('es-AR')}`;
    totalElem.textContent = `$ ${total.toLocaleString('es-AR')}`;

    document.querySelectorAll('.btn-menos').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.target.dataset.id;
        let cant = parseInt(e.target.dataset.cant) - 1;
        if (cant < 1) cant = 1;
        await peticion(`/carrito/${id}`, 'PUT', { cantidad: cant, usuario_id: usuario.id });
        await cargarResumenCarrito();
        await actualizarContadorCarrito();
      });
    });

    document.querySelectorAll('.btn-mas').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.target.dataset.id;
        let cant = parseInt(e.target.dataset.cant) + 1;
        await peticion(`/carrito/${id}`, 'PUT', { cantidad: cant, usuario_id: usuario.id });
        await cargarResumenCarrito();
        await actualizarContadorCarrito();
      });
    });

    document.querySelectorAll('.btn-quitar').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.target.closest('.btn-quitar').dataset.id;
        await peticion(`/carrito/${id}`, 'DELETE', { usuario_id: usuario.id });
        await cargarResumenCarrito();
        await actualizarContadorCarrito();
      });
    });

  } catch (error) {
    console.error("❌ Error:", error);
    grilla.innerHTML = `<p style="padding:20px;text-align:center;color:red;">Error al cargar</p>`;
  }
}

async function actualizarContadorCarrito() {
  const contador = document.getElementById('headerCartCount');
  if (!contador) return;
  const usuarioGuardado = localStorage.getItem('usuario');
  if (!usuarioGuardado) { contador.textContent = '0'; return; }
  try {
    const usuario = JSON.parse(usuarioGuardado);
    const res = await peticion(`/carrito?usuario_id=${usuario.id}`);
    let items = [];
    if (Array.isArray(res.datos)) items = res.datos;
    else if (Array.isArray(res)) items = res;
    const total = items.reduce((s, i) => s + Number(i.cantidad), 0);
    contador.textContent = total;
  } catch { contador.textContent = '0'; }
}

document.addEventListener('DOMContentLoaded', async () => {
  await actualizarContadorCarrito();
});