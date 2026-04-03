const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


const pool = mysql.createPool({
    host: 'b1xmex2llgxskp78829g-mysql.services.clever-cloud.com',
    user: 'uctthwr3xtttbxlq',
    password: 'W4n6Xzaag17ZKOIm33nb',
    database: 'b1xmex2llgxskp78829g',
    port: 3306,
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0
});




app.get('/api/productos', (req, res) => {
    pool.query('SELECT * FROM productos', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});


app.post('/api/productos', (req, res) => {
    const { nombre, precio, stock, descripcion, imagen } = req.body;
    const imgFinal = imagen || `https://picsum.photos/300/200?random=${Math.random()}`;
    const sql = 'INSERT INTO productos (nombre, precio, stock, descripcion, imagen) VALUES (?, ?, ?, ?, ?)';
    pool.query(sql, [nombre, precio, stock, descripcion, imgFinal], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: result.insertId, status: 'success' });
    });
});


app.put('/api/productos/:id', (req, res) => {
    const { nombre, precio, stock, descripcion, imagen } = req.body;
    const sql = 'UPDATE productos SET nombre=?, precio=?, stock=?, descripcion=?, imagen=? WHERE id=?';
    pool.query(sql, [nombre, precio, stock, descripcion, imagen, req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ status: 'updated' });
    });
});


app.delete('/api/productos/:id', (req, res) => {
    pool.query('DELETE FROM productos WHERE id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ status: 'deleted' });
    });
});


app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TechStore Cloud - CRUD Completo</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600&display=swap" rel="stylesheet">
    <style>
        *{box-sizing:border-box}
        body{margin:0;font-family:'Inter',sans-serif;background:#0f172a;color:#e2e8f0}
        header{padding:20px;text-align:center;font-size:1.8rem;font-weight:600; background: #1e293b; border-bottom: 2px solid #38bdf8}
        nav{display:flex;justify-content:center;gap:10px;margin: 20px 0}
        nav button{background:#1e293b;color:white;border:none;padding:10px 16px;border-radius:10px;cursor:pointer;transition:.2s; border: 1px solid #334155}
        nav button:hover{background:#38bdf8;color:black}
        .section{display:none;max-width:1200px;margin:auto;padding:20px}
        .active{display:block}
        .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px}
        .card{background:#020617;border-radius:16px;padding:15px;box-shadow:0 10px 20px rgba(0,0,0,.4);transition:.2s; border: 1px solid #1e293b}
        .card img{width:100%;height:180px;object-fit:cover;border-radius:10px}
        .card h3{margin:15px 0 5px; color: #38bdf8}
        .price{color:#22c55e;font-weight:600; font-size: 1.2rem}
        .form{background:#1e293b;padding:25px;border-radius:16px;margin-bottom:30px; border: 1px solid #38bdf8}
        .form input, .form textarea{width:100%;margin:8px 0;padding:12px;border-radius:8px;border:1px solid #334155;background:#0f172a;color:white}
        .form button{width:100%;padding:12px;background:#38bdf8;border:none;border-radius:10px;font-weight:600;cursor:pointer; margin-top:10px}
        .btn-edit{background:#f59e0b !important; color:white !important; margin-bottom:5px}
        .btn-delete{background:#ef4444 !important; color:white !important}
    </style>
</head>
<body>

<header>🛒 TechStore CRUD PRO</header>

<nav>
    <button onclick="show('inicio')">🏠 Inicio</button>
    <button onclick="show('admin')">⚙️ Admin</button>
    <button onclick="show('api')">🔗 API</button>
</nav>

<div id="inicio" class="section active">
    <div class="grid" id="inicioProductos"></div>
</div>

<div id="admin" class="section">
    <h2 id="formTitle">Agregar Nuevo Producto</h2>
    <div class="form">
        <input id="prodId" type="hidden">
        <input id="nombre" placeholder="Nombre">
        <input id="precio" type="number" placeholder="Precio">
        <input id="stock" type="number" placeholder="Stock">
        <input id="imagen" placeholder="URL Imagen">
        <textarea id="descripcion" placeholder="Descripción"></textarea>
        <button id="btnSave" onclick="guardarProducto()">🚀 Guardar en la Nube</button>
        <button id="btnCancel" style="display:none; background:#64748b" onclick="resetForm()">Cancelar Edición</button>
    </div>
    <div class="grid" id="adminProductos"></div>
</div>

<div id="api" class="section">
    <pre id="apiData">Cargando JSON...</pre>
</div>

<script>
async function cargarDatos() {
    const res = await fetch('/api/productos');
    const productos = await res.json();
    
    document.getElementById('inicioProductos').innerHTML = productos.map(p => \`
        <div class="card">
            <img src="\${p.imagen}">
            <h3>\${p.nombre}</h3>
            <p>\${p.descripcion}</p>
            <p class="price">S/ \${p.precio}</p>
        </div>\`).join('');

    document.getElementById('adminProductos').innerHTML = productos.map(p => \`
        <div class="card">
            <h3>\${p.nombre}</h3>
            <p>S/ \${p.precio}</p>
            <button class="btn-edit" onclick='prepararEdicion(\${JSON.stringify(p)})'>✏️ Editar</button>
            <button class="btn-delete" onclick="eliminarProducto(\${p.id})">🗑️ Eliminar</button>
        </div>\`).join('');

    document.getElementById('apiData').textContent = JSON.stringify(productos, null, 2);
}

function prepararEdicion(p) {
    document.getElementById('prodId').value = p.id;
    document.getElementById('nombre').value = p.nombre;
    document.getElementById('precio').value = p.precio;
    document.getElementById('stock').value = p.stock;
    document.getElementById('descripcion').value = p.descripcion;
    document.getElementById('imagen').value = p.imagen;
    
    document.getElementById('formTitle').innerText = "Editando Producto #" + p.id;
    document.getElementById('btnSave').innerText = "💾 Actualizar Cambios";
    document.getElementById('btnCancel').style.display = "block";
    window.scrollTo(0,0);
}

function resetForm() {
    document.getElementById('prodId').value = "";
    document.querySelectorAll('.form input, .form textarea').forEach(i => i.value = '');
    document.getElementById('formTitle').innerText = "Agregar Nuevo Producto";
    document.getElementById('btnSave').innerText = "🚀 Guardar en la Nube";
    document.getElementById('btnCancel').style.display = "none";
}

async function guardarProducto() {
    const id = document.getElementById('prodId').value;
    const data = {
        nombre: document.getElementById('nombre').value,
        precio: document.getElementById('precio').value,
        stock: document.getElementById('stock').value,
        descripcion: document.getElementById('descripcion').value,
        imagen: document.getElementById('imagen').value
    };

    const url = id ? '/api/productos/' + id : '/api/productos';
    const method = id ? 'PUT' : 'POST';

    await fetch(url, {
        method: method,
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    });

    resetForm();
    cargarDatos();
    show('inicio');
}

async function eliminarProducto(id) {
    if(confirm('¿Eliminar de la nube?')) {
        await fetch('/api/productos/' + id, { method: 'DELETE' });
        cargarDatos();
    }
}

function show(id) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

cargarDatos();
</script>
</body>
</html>
    `);
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log('Servidor en puerto ' + port));