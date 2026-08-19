// js/menu-cuenta.js
document.addEventListener('DOMContentLoaded', () => {
    // 🔹 Menú desplegable de Mi Cuenta
    const botonCuenta = document.getElementById('boton-cuenta');
    const menuDesplegable = document.getElementById('menu-cuenta-desplegable');

    if (botonCuenta && menuDesplegable) {
        // Abrir / Cerrar al hacer clic
        botonCuenta.addEventListener('click', (e) => {
            e.stopPropagation();
            menuDesplegable.classList.toggle('activo');
        });

        // Cerrar al hacer clic fuera del menú
        document.addEventListener('click', () => {
            menuDesplegable.classList.remove('activo');
        });

        // Evitar que se cierre al hacer clic dentro del menú
        menuDesplegable.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    // 🔹 Cerrar sesión
    const btnCerrarSesion = document.getElementById('cerrar-sesion');
    if (btnCerrarSesion) {
        btnCerrarSesion.addEventListener('click', () => {
            localStorage.removeItem('usuario');
            window.location.href = '/index.html';
        });
    }
});