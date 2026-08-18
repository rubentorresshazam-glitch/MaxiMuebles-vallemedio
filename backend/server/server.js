require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');


// ✅ CONEXIONES
const db = require('./config/database');
const { MercadoPagoConfig, Preference } = require('mercadopago');
const mpClient = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN 
});


// ======================================
// 🔐 CONFIGURACIÓN CERTIFICADO ARCA/AFIP
// ======================================
let certificado, clavePrivada;

if (process.env.CERTIFICADO_ARCA && process.env.CLAVE_PRIVADA_ARCA) {
  certificado = process.env.CERTIFICADO_ARCA.replace(/\\n/g, '\n');
  clavePrivada = process.env.CLAVE_PRIVADA_ARCA.replace(/\\n/g, '\n');
  console.log("✅ Certificados cargados desde variables de entorno");
} else {
  const rutaCert = path.join(__dirname, 'certificados', 'maximuebles.cer');
  const rutaClave = path.join(__dirname, 'certificados', 'clave-privada.key');
  certificado = fs.readFileSync(rutaCert, 'utf8');
  clavePrivada = fs.readFileSync(rutaClave, 'utf8');
  console.log("✅ Certificados cargados desde archivos locales");
}

const configARCA = {
  cuit: "30715002724",
  nombreEmpresa: "MAXIMUEBLES S.R.L.",
  puntoVenta: 1,
  certificado: certificado,
  clavePrivada: clavePrivada,
  urlWSAA: "https://wsaahomo.afip.gov.ar/wsaa/services/LoginTicket",
  urlWSFE: "https://wsfe1.afip.gov.ar/ws/services/FConsulta"
};

module.exports = { configARCA };


// ✅ RUTAS — TODAS CORREGIDAS
const rutasUsuarios = require('./routes/usuarios.routes');
const rutasProductos = require('./routes/productos.routes');
const rutasCarrito = require('./routes/carrito.routes');
const rutasPedidos = require('./routes/pedidos.routes');

// ⚠️ LÍNEA 77 CORREGIDA — SIN { router }
const rutasFacturacion = require('./routes/facturacion.routes.js');

const rutasContacto = require('./routes/contacto.routes');

const app = express();
const PUERTO = process.env.PORT || 10000;


app.use(cors({ origin: "*" }));
app.options('*', cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../..')));


// ✅ RUTA DE PRUEBA
app.get('/api/prueba', (req, res) => res.json({ ok: true, mensaje: '✅ SERVIDOR Y BASE CONECTADOS' }));


// ======================================
// 📋 RUTAS DEL SERVIDOR — SIN DUPLICADOS
// ======================================
app.use('/api/auth', rutasUsuarios);
app.use('/api/productos', rutasProductos);
app.use('/api/carrito', rutasCarrito);
app.use('/api/pedidos', rutasPedidos);
app.use('/api', rutasFacturacion);
app.use('/api', rutasContacto);


// ======================================
// 💳 MERCADO PAGO — PAGO
// ======================================
app.post('/api/pagar', async (req, res) => {
  try {
    const { carrito, usuario_id, direccion_entrega, tipoFactura, correoCliente } = req.body;

    if (!carrito || carrito.length === 0) {
      return res.json({ ok: false, mensaje: 'El carrito está vacío' });
    }

    const items = carrito.map(i => ({
      title: i.nombre || 'Producto',
      quantity: Number(i.cantidad),
      unit_price: Number(i.precio)
    }));

    let total = 0;
    items.forEach(i => {
      total += i.unit_price * i.quantity;
    });

    const pref = await new Preference(mpClient).create({
      body: {
        items: items,
        currency_id: "ARS",
        external_reference: "pedido-" + Date.now(),
        auto_return: "approved",
        back_urls: {
          success: "https://maximuebles-vallemedio.onrender.com/mi-cuenta/confirmacion.html",
          failure: "https://maximuebles-vallemedio.onrender.com/mi-cuenta/carrito.html",
          pending: "https://maximuebles-vallemedio.onrender.com/mi-cuenta/confirmacion.html"
        }
      }
    });

    const mpId = pref.body.id;
    const userId = usuario_id || 1;
    const dir = direccion_entrega || 'Sin dirección';

    await db.query(
      "INSERT INTO pedidos (usuario_id, total, direccion_entrega, estado, mp_pago_id, tipo_factura, correo_cliente) VALUES (?, ?, ?, 'pendiente', ?, ?, ?)",
      [userId, total, dir, mpId, tipoFactura || 'CF', correoCliente || '']
    );

    res.json({ 
      ok: true, 
      link_pago: pref.body.init_point
    });

  } catch (e) {
    console.error("❌ ERROR DE PAGO:", e.message);
    res.json({ ok: false, mensaje: e.message });
  }
});


// ======================================
// ⚠️ MANEJADOR DE ERRORES
// ======================================
const { noEncontrado, manejadorErrores } = require('./middlewares/errores');
app.use(noEncontrado);
app.use(manejadorErrores);


// ======================================
// 🚀 INICIAR SERVIDOR
// ======================================
app.listen(PUERTO, () => {
  console.log(`✅ Servidor corriendo en el puerto ${PUERTO}`);
  console.log(`🔐 Certificado ARCA cargado: ${configARCA.cuit} - ${configARCA.nombreEmpresa}`);
});