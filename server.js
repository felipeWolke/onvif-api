// server.js
const express = require('express');
const cameraRoutes = require('./src/routes/routes'); // Importa las rutas de la cámara

const app = express();
const PORT = 3000;

app.use(express.json()); // Para parsear el cuerpo de las solicitudes JSON

// Utiliza las rutas definidas en routes.js para las rutas relacionadas con la cámara
app.use(cameraRoutes);

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

