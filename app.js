const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// === CONFIGURACIÓN CON VARIABLES REALES DE CLEVER CLOUD ===
const pool = mysql.createPool({
    host: 'b1xmex2llgxskp78829g-mysql.services.clever-cloud.com',
    database: 'b1xmex2llgxskp78829g',
    user: 'uctthwr3xtttbxlq', // Corregido: era 'xlq'
    password: 'W4n6Xzaag17ZKOIm33nb',
    port: 3306,
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0
});

// Prueba de conexión inmediata
pool.getConnection((err, conn) => {
    if (err) {
        console.error('Error de acceso:', err.message);
    } else {
        console.log('-----------------------------------------');
        console.log('¡CONEXIÓN EXITOSA! Ya estás en la nube.');
        console.log('-----------------------------------------');
        conn.release();
    }
});

// === RUTAS ===
app.get('/productos', (req, res) => {
    pool.query('SELECT * FROM productos', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.post('/productos', (req, res) => {
    const { nombre, precio, stock, descripcion } = req.body;
    const sql = 'INSERT INTO productos (nombre, precio, stock, descripcion) VALUES (?, ?, ?, ?)';
    pool.query(sql, [nombre, precio, stock, descripcion], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id: result.insertId, estado: 'creado' });
    });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Servidor listo en puerto ${port}`);
});