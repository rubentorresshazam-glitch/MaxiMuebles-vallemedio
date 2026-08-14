function actualizarMenuCuenta() {
    let datos = localStorage.getItem('usuario');
    if (!datos) datos = localStorage.getItem('sesionUsuario');

    const enlace = document.querySelector('.enlace-cuenta');
    if (datos && enlace) {
        const usuario = JSON.parse(datos);
        enlace.innerHTML = `<i class="fa-solid fa-user"></i> ${usuario.nombre}`;
    }
}

// ✅ CONTADOR DEL CARRITO: SIEMPRE VISIBLE, MUESTRA 0 O CANTIDAD
async function actualizarContadorCarrito() {
  const contador = document.getElementById('headerCartCount');
  if (!contador) return;

  const usuarioGuardado = localStorage.getItem('usuario') || localStorage.getItem('sesionUsuario');
  
  // 🟡 Si NO hay sesión → muestra 0 y SE VE
  if (!usuarioGuardado) {
    contador.textContent = '0';
    contador.style.display = 'flex'; // ✅ NO se esconde
    return;
  }

  const usuario = JSON.parse(usuarioGuardado);
  
  try {
    const res = await peticion(`/carrito?usuario_id=${usuario.id}`);
    
    let items = [];
    if (Array.isArray(res.datos)) items = res.datos;
    else if (Array.isArray(res)) items = res;

    // ✅ Si está vacío → muestra 0 y SE VE
    if (items.length === 0) {
      contador.textContent = '0';
      contador.style.display = 'flex'; // ✅ NO se esconde
      return;
    }

    // ✅ Si hay productos → muestra la cantidad
    const total = items.reduce((suma, item) => suma + Number(item.cantidad), 0);
    contador.textContent = total;
    contador.style.display = 'flex'; // ✅ SIEMPRE visible

  } catch (error) {
    console.error('❌ Error al actualizar contador:', error);
    contador.textContent = '0';
    contador.style.display = 'flex'; // ✅ En caso de error, muestra 0 igual
  }
}

// Buscador para el mapa
function buscarEnMapa() {
    const direccion = document.getElementById('buscar-direccion').value.trim();
    if (!direccion) return;
    
    const mapa = document.getElementById('mapa-ubicacion');
    mapa.src = `https://www.google.com/maps?q=${encodeURIComponent(direccion)}&output=embed`;
}

// ✅ AL CARGAR CUALQUIER PÁGINA: ACTUALIZA MENÚ Y CONTADOR
document.addEventListener('DOMContentLoaded', async () => {
  // 1. Actualiza el menú de cuenta
  actualizarMenuCuenta();

  // 2. Actualiza el número del carrito
  await actualizarContadorCarrito();

  // 3. Si hay sesión → muestra menú de perfil completo
  const usuarioGuardado = localStorage.getItem('usuario') || localStorage.getItem('sesionUsuario');
  const enlaceCuenta = document.querySelector('.enlace-cuenta');
  const botonCuenta = document.getElementById('boton-cuenta');

  if (usuarioGuardado && enlaceCuenta && botonCuenta) {
    const usuario = JSON.parse(usuarioGuardado);
    
    enlaceCuenta.innerHTML = `<i class="fa-solid fa-user-check"></i> ${usuario.nombre}`;
    botonCuenta.classList.add('menu-cuenta');

    // Menú desplegable con opciones
    botonCuenta.innerHTML = `
      <button class="btn-cuenta-conectado">
        <i class="fa-solid fa-user-check"></i> ${usuario.nombre}
      </button>
      <div class="submenu-cuenta">
        <a href="/mi-cuenta/mis-pedidos.html"><i class="fa-solid fa-receipt"></i> Mis Pedidos</a>
        <a href="/mi-cuenta/perfil.html"><i class="fa-solid fa-pen-to-square"></i> Mis Datos</a>
        <a href="#" id="btn-cerrar-sesion"><i class="fa-solid fa-right-from-bracket"></i> Cerrar Sesión</a>
      </div>
    `;

    // Botón cerrar sesión
    document.getElementById('btn-cerrar-sesion')?.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('usuario');
      localStorage.removeItem('sesionUsuario');
      location.reload();
    });
  }
});

// ===== BUSCADOR FUNCIONAL DE PRODUCTOS =====
function filtrarProductos() {
  const busqueda = document.getElementById('buscador-productos').value.toLowerCase().trim();

  // 👇 ESTA LÍNEA: si tus tarjetas se llaman distinto, cámbiala abajo
  const productos = document.querySelectorAll('.producto');

  let encontrados = 0;

  productos.forEach(tarjeta => {
    const nombre = (tarjeta.dataset.nombre || tarjeta.textContent || '').toLowerCase();
    const categoria = (tarjeta.dataset.categoria || '').toLowerCase();
    const descripcion = (tarjeta.dataset.descripcion || '').toLowerCase();

    if (nombre.includes(busqueda) || categoria.includes(busqueda) || descripcion.includes(busqueda)) {
      tarjeta.style.display = '';
      encontrados++;
    } else {
      tarjeta.style.display = 'none';
    }
  });

  // Mensaje de resultados
  const caja = document.querySelector('.resultados-busqueda') || document.getElementById('cantidad-resultados');
  if (caja) {
    caja.textContent = busqueda === '' 
      ? `Mostrando ${productos.length} productos`
      : `${encontrados} encontrado(s)`;
  }
}

