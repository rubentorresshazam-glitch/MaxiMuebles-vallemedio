document.addEventListener('DOMContentLoaded', async () => {
  cambiarPestana("registro");
});

function cambiarPestana(tipo) {
  document.querySelectorAll('.pestana').forEach(p => p.classList.remove('activa'));
  document.querySelectorAll('.sesion-caja').forEach(c => c.classList.remove('activa'));
  if (tipo === 'login') {
    document.querySelector('.pestana:nth-child(1)').classList.add('activa');
    document.getElementById('form-login').classList.add('activa');
  } else {
    document.querySelector('.pestana:nth-child(2)').classList.add('activa');
    document.getElementById('formRegistro').classList.add('activa');
  }
}

function mostrarClave(campoId, iconoId) {
  const campo = document.getElementById(campoId);
  const icono = document.getElementById(iconoId);
  campo.type = campo.type === "password" ? "text" : "password";
  icono.classList.toggle("fa-eye");
  icono.classList.toggle("fa-eye-slash");
}

function mostrarMensaje(elemento, texto, tipo) {
  elemento.textContent = texto;
  elemento.className = `mensaje ${tipo}`;
  elemento.classList.remove('oculto');
}

// --------------------------
// REGISTRO
// --------------------------
const formReg = document.getElementById('formRegistro');
if (formReg) {
  formReg.addEventListener('submit', async function(e) {
    e.preventDefault();

    console.log('👉 Enviando datos del formulario...');

    const nombre = document.getElementById('nombreRegistro').value.trim();
    const correo = document.getElementById('correoRegistro').value.trim().toLowerCase();
    const telefono = document.getElementById('telefonoRegistro').value.trim();
    const clave = document.getElementById('claveRegistro').value;
    const mensaje = document.getElementById('mensajeRegistro');

    if (clave.length < 6) {
      mostrarMensaje(mensaje, "La contraseña debe tener al menos 6 caracteres.", "error");
      return;
    }

    const res = await peticion('/auth/registro', 'POST', { nombre, correo, telefono, clave });
    console.log('📨 Respuesta del servidor:', res);

    if (!res.ok) {
      mostrarMensaje(mensaje, res.mensaje || "No se pudo crear la cuenta.", "error");
      return;
    }

    mostrarMensaje(mensaje, "✅ Cuenta creada correctamente. Ahora iniciá sesión.", "exito");
    formReg.reset();
    setTimeout(() => window.location.href = "/mi-cuenta/iniciar-sesion.html", 2000);
  });
}

// --------------------------
// LOGIN
// --------------------------
const formLog = document.getElementById('formInicioSesion');
if (formLog) {
  formLog.addEventListener('submit', async function(e) {
    e.preventDefault();

    const correo = document.getElementById('correoLogin').value.trim().toLowerCase();
    const clave = document.getElementById('claveLogin').value;
    const mensaje = document.getElementById('mensajeLogin');

    const res = await peticion('/auth/login', 'POST', { correo, clave });
    console.log('📨 Respuesta login:', res);

    if (!res.ok) {
      mostrarMensaje(mensaje, res.mensaje || "❌ Correo o contraseña incorrectos.", "error");
      return;
    }

    localStorage.setItem('token', res.datos.token);
    localStorage.setItem('usuario', JSON.stringify(res.datos.usuario));
    mostrarMensaje(mensaje, "✅ Bienvenido/a! Redirigiendo...", "exito");
    setTimeout(() => window.location.href = "/index.html", 1500);
  });
}

// Cuando iniciás sesión, pasa los productos temporales a tu cuenta
async function pasarCarritoAlUsuario(usuarioId) {
  const temp = JSON.parse(localStorage.getItem('carrito_temporal')) || [];
  for (const prod of temp) {
    await peticion('/carrito', 'POST', {
      usuario_id: usuarioId,
      producto_id: prod.id,
      cantidad: prod.cantidad
    });
  }
  localStorage.removeItem('carrito_temporal');
  if (typeof actualizarContadorCarrito === 'function') actualizarContadorCarrito();
}