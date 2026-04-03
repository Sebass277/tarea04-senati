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
        if (err) return res.status(500).json({ error: "Error de lectura" });
        res.json(results);
    });
});

app.post('/api/productos', (req, res) => {
    const { nombre, precio, stock, descripcion, imagen } = req.body;
    if (!nombre || !precio) return res.status(400).json({ error: "Faltan datos" });
    const imgFinal = imagen || `https://picsum.photos/400/300?random=${Math.random()}`;
    const sql = 'INSERT INTO productos (nombre, precio, stock, descripcion, imagen) VALUES (?, ?, ?, ?, ?)';
    pool.query(sql, [nombre, precio, stock, descripcion, imgFinal], (err, result) => {
        if (err) return res.status(500).json({ error: "Error de inserción" });
        res.json({ id: result.insertId, status: 'success' });
    });
});

app.put('/api/productos/:id', (req, res) => {
    const { nombre, precio, stock, descripcion, imagen } = req.body;
    const sql = 'UPDATE productos SET nombre=?, precio=?, stock=?, descripcion=?, imagen=? WHERE id=?';
    pool.query(sql, [nombre, precio, stock, descripcion, imagen, req.params.id], (err) => {
        if (err) return res.status(500).json({ error: "Error de actualización" });
        res.json({ status: 'updated' });
    });
});

app.delete('/api/productos/:id', (req, res) => {
    pool.query('DELETE FROM productos WHERE id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: "Error de eliminación" });
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
    <title>TechStore Pro</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap" rel="stylesheet">
    <style>
        *{box-sizing:border-box}
        body{margin:0;font-family:'Inter',sans-serif;background:#0f172a;color:#e2e8f0;line-height:1.6}
        header{padding:25px;text-align:center;font-size:1.8rem;font-weight:600;background:#1e293b;border-bottom:3px solid #38bdf8;box-shadow:0 4px 10px rgba(0,0,0,0.3)}
        nav{display:flex;justify-content:center;gap:12px;margin:25px 0;padding:0 15px}
        nav button{background:#1e293b;color:white;border:1px solid #334155;padding:12px 20px;border-radius:12px;cursor:pointer;transition:.3s;flex:1;max-width:140px;font-weight:600}
        nav button:hover{background:#38bdf8;color:black;border-color:#38bdf8;transform:translateY(-2px)}
        .section{display:none;max-width:1200px;margin:auto;padding:20px;animation:fadeIn 0.4s}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        .active{display:block}
        .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:30px}
        @media (max-width:600px){
            .grid{grid-template-columns:1fr}
            header{font-size:1.5rem}
            .card img{height:250px}
            nav{gap:8px}
            nav button{padding:10px;font-size:0.9rem}
        }
        .card{background:#020617;border-radius:20px;padding:22px;box-shadow:0 15px 35px rgba(0,0,0,0.5);transition:.3s;border:1px solid #1e293b;display:flex;flex-direction:column;justify-content:space-between}
        .card:hover{transform:translateY(-8px);border-color:#38bdf8;box-shadow:0 15px 35px rgba(56,189,248,0.2)}
        .card img{width:100%;height:200px;object-fit:cover;border-radius:14px;margin-bottom:15px;border:1px solid #1e293b}
        .card h3{margin:0 0 10px;color:#38bdf8;font-size:1.5rem}
        .price{color:#22c55e;font-weight:700;font-size:1.8rem;margin:10px 0}
        .stock-label{font-size:0.9rem;color:#94a3b8;margin-top:auto}
        .form{background:#1e293b;padding:30px;border-radius:20px;margin-bottom:40px;border:1px solid #38bdf8;box-shadow:0 10px 20px rgba(0,0,0,0.2)}
        .form h2{margin-top:0;color:#38bdf8}
        .form input,.form textarea{width:100%;margin:10px 0;padding:15px;border-radius:10px;border:1px solid #334155;background:#0f172a;color:white;font-size:1rem;outline:none}
        .form input:focus{border-color:#38bdf8}
        .form button{width:100%;padding:16px;background:#38bdf8;border:none;border-radius:12px;font-weight:600;cursor:pointer;margin-top:15px;font-size:1.1rem;color:#0f172a;transition:.2s}
        .form button:hover{background:#7dd3fc;letter-spacing:1px}
        .btn-edit{background:#f59e0b;color:white;margin-bottom:8px;width:100%;padding:10px;border-radius:8px;border:none;cursor:pointer}
        .btn-delete{background:#ef4444;color:white;width:100%;padding:10px;border-radius:8px;border:none;cursor:pointer}
        pre{background:#020617;padding:20px;border-radius:15px;overflow:auto;color:#38bdf8;border:1px solid #1e293b;font-size:0.9rem}
    </style>
</head>
<body>
<header>🛒 TechStore CRUD PRO</header>
<nav>
    <button onclick="show('inicio')">🏠 Tienda</button>
    <button onclick="show('admin')">⚙️ Gestión</button>
    <button onclick="show('api')">🔗 Datos JSON</button>
</nav>
<div id="inicio" class="section active">
    <div class="grid" id="inicioGrid"></div>
</div>
<div id="admin" class="section">
    <div class="form">
        <h2 id="formTitle">📦 Registrar Producto</h2>
        <input id="prodId" type="hidden">
        <input id="nombre" placeholder="Nombre del Producto">
        <input id="precio" type="number" placeholder="Precio (S/)">
        <input id="stock" type="number" placeholder="Stock Actual">
        <input id="imagen" placeholder="URL de la imagen (Opcional)">
        <textarea id="descripcion" placeholder="Descripción detallada" rows="3"></textarea>
        <button id="btnSave" onclick="guardar()">💾 Guardar en la Nube</button>
        <button id="btnCancel" style="display:none;background:#475569;margin-top:10px" onclick="resetForm()">❌ Cancelar</button>
    </div>
    <div class="grid" id="adminGrid"></div>
</div>
<div id="api" class="section">
    <pre id="apiData">Cargando...</pre>
</div>
<script>
async function cargar(){
    try{
        const res=await fetch('/api/productos');
        const data=await res.json();
        document.getElementById('inicioGrid').innerHTML=data.map(p=>\`
            <div class="card">
                <img src="\${p.imagen}" onerror="this.src='https://picsum.photos/400/300?tech'">
                <div>
                    <h3>\${p.nombre}</h3>
                    <p>\${p.descripcion}</p>
                </div>
                <div>
                    <p class="price">S/ \${p.precio}</p>
                    <p class="stock-label">Disponibles: \${p.stock} unidades</p>
                </div>
            </div>\`).join('');
        document.getElementById('adminGrid').innerHTML=data.map(p=>\`
            <div class="card" style="padding:15px">
                <h3 style="font-size:1.1rem">\${p.nombre}</h3>
                <p>S/ \${p.precio} | Stock: \${p.stock}</p>
                <button class="btn-edit" onclick='preEdicion(\${JSON.stringify(p)})'>✏️ Editar</button>
                <button class="btn-delete" onclick="eliminar(\${p.id})">🗑️ Eliminar</button>
            </div>\`).join('');
        document.getElementById('apiData').textContent=JSON.stringify(data,null,2);
    }catch(e){document.getElementById('apiData').textContent="Error de conexión"}
}
function preEdicion(p){
    document.getElementById('prodId').value=p.id;
    document.getElementById('nombre').value=p.nombre;
    document.getElementById('precio').value=p.precio;
    document.getElementById('stock').value=p.stock;
    document.getElementById('descripcion').value=p.descripcion;
    document.getElementById('imagen').value=p.imagen;
    document.getElementById('formTitle').innerText="✏️ Editando Producto #"+p.id;
    document.getElementById('btnSave').innerText="✅ Actualizar Registro";
    document.getElementById('btnCancel').style.display="block";
    window.scrollTo({top:0,behavior:'smooth'});
}
function resetForm(){
    document.getElementById('prodId').value="";
    document.querySelectorAll('.form input,.form textarea').forEach(i=>i.value='');
    document.getElementById('formTitle').innerText="📦 Registrar Producto";
    document.getElementById('btnSave').innerText="💾 Guardar en la Nube";
    document.getElementById('btnCancel').style.display="none";
}
async function guardar(){
    const id=document.getElementById('prodId').value;
    const data={
        nombre:document.getElementById('nombre').value,
        precio:document.getElementById('precio').value,
        stock:document.getElementById('stock').value,
        descripcion:document.getElementById('descripcion').value,
        imagen:document.getElementById('imagen').value
    };
    if(!data.nombre||!data.precio)return alert("Nombre y precio obligatorios");
    const url=id?'/api/productos/'+id:'/api/productos';
    await fetch(url,{
        method:id?'PUT':'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify(data)
    });
    resetForm();
    cargar();
    show('inicio');
}
async function eliminar(id){
    if(confirm('¿Eliminar registro?')){
        await fetch('/api/productos/'+id,{method:'DELETE'});
        cargar();
    }
}
function show(id){
    document.querySelectorAll('.section').forEach(s=>s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}
cargar();
</script>
</body>
</html>
    `);
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log('Servidor en puerto ' + port));