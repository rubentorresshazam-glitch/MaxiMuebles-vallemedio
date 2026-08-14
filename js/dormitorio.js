document.addEventListener('DOMContentLoaded', async () => {
  const CATEGORIA = "Colchones y Sommiers";
  const grilla = document.querySelector('.productos-grid');
  if (!grilla) return;

  grilla.innerHTML = `<p class="mensaje-cargando">Cargando productos...</p>`;

  // Usamos la ruta que YA funciona: /api/productos
  const respuesta = await peticion('/productos');

  if (!respuesta.ok || !respuesta.datos) {
    grilla.innerHTML = `<p class="mensaje-vacio">No se pudieron cargar los productos.</p>`;
    return;
  }

  // Filtramos acá solo los de Dormitorio
  const productos = respuesta.datos.filter(p => 
    p.categoria === CATEGORIA || p.categoria === CATEGORIA.toLowerCase()
  );

  grilla.innerHTML = '';

  if (productos.length === 0) {
    grilla.innerHTML = `<p class="mensaje-vacio">Por el momento no hay productos en esta categoría.</p>`;
    return;
  }

  productos.forEach(prod => {
    const precio = Number(prod.precio);
    const img = prod.imagenes ? prod.imagenes.split(',')[0].trim() : '';

    const tarjeta = document.createElement('div');
    tarjeta.className = 'producto-card';
    tarjeta.innerHTML = `
      <a href="/producto-detalles.html?id=${prod.id}" class="enlace-producto">
        <img src="${img}" alt="${prod.nombre}" class="img-producto">
        <h3>${prod.nombre}</h3>
        <div class="producto-descripcion">${prod.descripcion || ''}</div>
        <p class="producto-stock">Stock: ${prod.stock} unidades.</p>
        <span class="producto-precio">$ ${precio.toLocaleString('es-AR')}</span>
      </a>
      <button class="btn-agregar" data-id="${prod.id}">
        <i class="fa-solid fa-cart-plus"></i> Agregar al carrito
      </button>
    `;
    grilla.appendChild(tarjeta);
  });

  document.querySelectorAll('.btn-agregar').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.target.closest('.btn-agregar').dataset.id;
      agregarAlCarrito(Number(id), 1);
    });
  });
});

// ===== BUSCADOR + FILTROS — Página de Dormitorios =====
function aplicarFiltros() {
  const texto = document.getElementById('buscador-productos').value.toLowerCase().trim();
  const categoria = document.getElementById('filtro-categoria').value;
  const precioRango = document.getElementById('filtro-precio').value;
  const orden = document.getElementById('filtro-orden').value;

  // Encuentra las tarjetas que el servidor cargue solo
  let productos = Array.from(document.querySelectorAll('.productos-grid > div'));

  // 🔍 Buscar por nombre/texto
  productos = productos.filter(tarjeta => {
    const todoTexto = tarjeta.textContent.toLowerCase();
    return texto === '' || todoTexto.includes(texto);
  });

  // 📂 Filtrar por categoría
  productos = productos.filter(tarjeta => {
    const cat = (tarjeta.dataset.categoria || '').toLowerCase();
    return categoria === '' || cat === categoria;
  });

  // 💰 Filtrar por precio
  if (precioRango) {
    const [min, max] = precioRango.split('-').map(Number);
    productos = productos.filter(tarjeta => {
      const precio = Number(tarjeta.dataset.precio || 0);
      return precio >= min && precio <= max;
    });
  }

  // ↕️ Ordenar
  if (orden === 'nombre-az') {
    productos.sort((a, b) => (a.dataset.nombre || '').localeCompare(b.dataset.nombre || ''));
  } else if (orden === 'precio-menor') {
    productos.sort((a, b) => Number(a.dataset.precio || 0) - Number(b.dataset.precio || 0));
  } else if (orden === 'precio-mayor') {
    productos.sort((a, b) => Number(b.dataset.precio || 0) - Number(a.dataset.precio || 0));
  }

  // Mostrar solo los que quedaron
  document.querySelectorAll('.productos-grid > div').forEach(t => t.style.display = 'none');
  productos.forEach(t => t.style.display = '');

  // Mostrar cantidad
  const contador = document.getElementById('cantidad-resultados');
  if (contador) {
    contador.textContent = `${productos.length} producto(s)`;
  }
}