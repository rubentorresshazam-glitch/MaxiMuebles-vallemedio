const params = new URLSearchParams(window.location.search);
const id = Number(params.get('id'));
let productoActual = null;

function limpiarTexto(texto) {
    if (!texto) return '';
    return texto.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
}

if (id) {
    fetch(`/api/producto?id=${id}`)
    .then(res => res.json())
    .then(resp => {
        if (resp.ok && resp.datos) {
            productoActual = resp.datos;

            document.getElementById('nombre-producto').textContent = productoActual.nombre || 'Producto';
            document.getElementById('precio-actual').textContent = productoActual.precio ? `$ ${Number(productoActual.precio).toLocaleString('es-AR')}` : '';
            document.getElementById('descripcion-larga-texto').textContent = limpiarTexto(productoActual.descripcion);

            if (productoActual.imagenes) {
                const img = Array.isArray(productoActual.imagenes) ? productoActual.imagenes[0] : productoActual.imagenes;
                document.getElementById('img-principal').src = img;
            }
        }
    })
    .catch(err => console.error('Error:', err));
}

// Botones de cantidad
document.getElementById('btn-menos').addEventListener('click', () => {
    const input = document.getElementById('cantidad');
    const val = parseInt(input.value);
    if (val > 1) input.value = val - 1;
});
document.getElementById('btn-mas').addEventListener('click', () => {
    const input = document.getElementById('cantidad');
    const val = parseInt(input.value);
    if (val < 10) input.value = val + 1;
});

// ✅ BOTÓN AGREGAR: CONEXIÓN DIRECTA Y SEGURA
document.getElementById('btn-agregar').addEventListener('click', () => {
    if (!productoActual) {
        alert('Esperá un momento que termine de cargar');
        return;
    }

    const cantidad = parseInt(document.getElementById('cantidad').value) || 1;

    const producto = {
        id: productoActual.id || id,
        nombre: productoActual.nombre || 'Producto',
        precio: parseFloat(productoActual.precio) || 0,
        imagen: Array.isArray(productoActual.imagenes) ? productoActual.imagenes[0] : (productoActual.imagenes || ''),
        cantidad: cantidad
    };

    // Llamamos directamente a la función de carrito
    agregarAlCarrito(producto);

    // Confirmación visual
    const btn = document.getElementById('btn-agregar');
    btn.innerHTML = '<i class="fa-solid fa-check"></i> ¡Agregado!';
    btn.style.background = '#1a8a36';

    setTimeout(() => {
        btn.innerHTML = '<i class="fa-solid fa-cart-plus"></i> Agregar al carrito';
        btn.style.background = '';
    }, 1800);
});

// Botón favorito
document.getElementById('btn-favorito').addEventListener('click', function() {
    this.classList.toggle('activo');
    const icono = this.querySelector('i');
    icono.classList.toggle('fa-regular');
    icono.classList.toggle('fa-solid');
});