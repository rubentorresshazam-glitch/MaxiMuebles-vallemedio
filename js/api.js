// ⚠️ BASE URL YA INCLUYE /api — NUNCA REPETIRLO EN LAS LLAMADAS
const API_URL = 'http://localhost:3000/api';

async function peticion(url, metodo = 'GET', datos = null) {
  const opciones = {
    method: metodo,
    headers: { 'Content-Type': 'application/json' }
  };

  // Enviamos token si hay sesión
  const token = localStorage.getItem('token');
  if (token) {
    opciones.headers['Authorization'] = `Bearer ${token}`;
  }

  // Agregamos cuerpo si hay datos
  if (datos) {
    opciones.body = JSON.stringify(datos);
  }

  try {
    // Armamos la dirección final SIN repetir /api
    const res = await fetch(`${API_URL}${url}`, opciones);
    const cuerpo = await res.json();

    // Devolvemos formato uniforme en todas las respuestas
    return {
      ok: res.ok,
      mensaje: cuerpo.mensaje || '',
      datos: cuerpo.datos || cuerpo
    };
  } catch (err) {
    console.error('❌ Error conexión:', err);
    alert('❌ No se pudo conectar al servidor');
    return { ok: false, mensaje: 'Error de conexión' };
  }
}

// Función reutilizable para agregar al carrito
async function agregarAlCarrito(producto_id, cantidad = 1) {
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  if (!usuario) {
    alert('🔑 Iniciá sesión primero');
    window.location.href = '/mi-cuenta/iniciar-sesion.html';
    return;
  }

  const res = await peticion('/carrito', 'POST', {
    usuario_id: usuario.id,
    producto_id: Number(producto_id),
    cantidad: Number(cantidad)
  });

  if (res.ok) {
    alert(res.mensaje);
    actualizarContadorCarrito();
  } else {
    alert(`❌ ${res.mensaje}`);
  }
}

// Función reutilizable para el contador del encabezado
async function actualizarContadorCarrito() {
  const contador = document.getElementById('headerCartCount');
  if (!contador) return;

  const usuario = JSON.parse(localStorage.getItem('usuario'));
  if (!usuario) {
    contador.textContent = '0';
    contador.style.display = 'none';
    return;
  }

  const res = await peticion(`/carrito?usuario_id=${usuario.id}`);
  if (res.ok && res.datos) {
    const total = Array.isArray(res.datos)
      ? res.datos.reduce((suma, item) => suma + Number(item.cantidad), 0)
      : 0;
    contador.textContent = total;
    contador.style.display = total > 0 ? 'flex' : 'none';
  } else {
    contador.textContent = '0';
    contador.style.display = 'none';
  }
}

function verDetalles(id) {
    window.location.href = `/producto-detalles.html?id=${id}`;
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('formulario-contacto');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const datos = {
      nombre: document.getElementById('nombre').value.trim(),
      correo: document.getElementById('correo').value.trim(),
      telefono: document.getElementById('telefono').value.trim(),
      asunto: document.getElementById('asunto').value,
      mensaje: document.getElementById('mensaje').value.trim()
    };

    try {
      const respuesta = await fetch('/api/enviar-contacto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
      });

      const resultado = await respuesta.json();

      if (resultado.exito) {
        alert(resultado.mensaje);
        form.reset();
      } else {
        alert(resultado.mensaje);
      }
    } catch (error) {
      alert('Error de conexion. Escribinos directamente por WhatsApp.');
      console.error(error);
    }
  });
});