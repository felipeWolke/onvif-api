require('dotenv').config();
//console.log(process.env);  // Esto mostrará todas las variables de entorno cargadas

const express = require('express');
const { Cam } = require('onvif');
const cors = require('cors');
const authenticate = require('../authentication/authentication');


const app = express();
app.use(cors());
app.use(express.json());

// Middleware para datos de formularios
app.use(express.urlencoded({ extended: true }));

const port = process.env.PORT || 3555;
const camPort = process.env.CAMERA_PORT || 3001;
const camUsername = process.env.CAMERA_USER || 'wolke';
const camPassword = process.env.CAMERA_PASSWORD || 'Wolke1028';

// Direcciones IP de las cámaras
const camIps = {
    1: '10.8.0.3',
    2: '10.8.0.4',
    3: '10.8.0.7'
};

let cams = {};

// Inicializa todas las cámaras ONVIF
function initCameras() {
    const promises = Object.keys(camIps).map(key =>
        new Promise(resolve => {
            new Cam({
                hostname: camIps[key],
                username: camUsername,
                password: camPassword,
                port: camPort,
                timeout: 10000
            }, function(err) {
                if (err) {
                    console.error(`Failed to initialize camera ${key}:`, err);
                    resolve(); // Se resuelve la promesa aunque haya error
                    return;
                }
                cams[key] = this;
                console.log(`Camera ${key} initialized successfully`);
                resolve();
            });
        })
    );

    // Resolve all promises, whether they succeeded or failed
    return Promise.all(promises);
}

// Endpoint para mover la cámara
// Endpoint para mover la cámara de manera continua
app.post('/move', authenticate, (req, res) => {
    const { camId, x, y, zoom } = req.body;
    const cam = cams[camId];

    if (!cam) {
        return res.status(500).send('Camera not initialized or invalid camera ID');
    }

    cam.continuousMove({ x, y, zoom }, (err) => {
        if (err) {
            console.log(err);
            return res.status(500).send('Error moving camera');
        }

        console.log(`Move command sent to camera ${camId}, camera will move for 1 second`);

        setTimeout(() => {
            cam.stop({panTilt: true, zoom: true}, (stopErr) => {
                if (stopErr) {
                    console.log(stopErr);
                    return res.status(500).send('Error stopping camera');
                }
                console.log('Stop command sent, camera has stopped moving');
                res.send(`Camera ${camId} moved for 1 second and stopped`);
            });
        }, 1000);
    });
});

// Endpoint para mover la cámara a una posición absoluta
app.post('/moveAbsolute', authenticate, (req, res) => {
    const { camId, x, y, zoom } = req.body;
    const cam = cams[camId];

    if (!cam) {
        return res.status(500).send('Camera not initialized or invalid camera ID');
    }

    cam.absoluteMove({ x, y, zoom }, (err) => {
        if (err) {
            console.log(err);
            return res.status(500).send('Error moving camera to absolute position');
        }

        console.log(`Absolute move command sent to camera ${camId}`);
        res.send(`Camera ${camId} moved to absolute position`);
    });
});

app.get('/health',authenticate, (req, res) => {
    console.log(process.env.TOKEN)
    res.send("saludo")
});

// Inicia el servidor después de inicializar las cámaras
initCameras().then(() => {
    app.listen(port, () => {
        console.log(`Camera API running at http://localhost:${port}`);
    });
}).catch(err => {
    console.error('Unexpected error during camera initialization:', err);
});
