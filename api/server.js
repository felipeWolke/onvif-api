require('dotenv').config();
const express = require('express');
const { Cam } = require('onvif');
const cors = require('cors');

const app = express();
app.use(cors());

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
app.get('/move', (req, res) => {
    const { camId, x, y, zoom } = req.query;
    const cam = cams[camId];

    if (!cam) {
        return res.status(500).send('Camera not initialized or invalid camera ID');
    }

    cam.continuousMove({
        x: parseFloat(x),
        y: parseFloat(y),
        zoom: parseFloat(zoom)
    }, (err) => {
        if (err) {
            console.log(err);
            return res.status(500).send('Error moving camera');
        }

        console.log(`Move command sent to camera ${camId}, camera will move for 1 second`);

        // Programa la detención del movimiento después de 1 segundo
        setTimeout(() => {
            cam.stop({panTilt: true, zoom: true}, (stopErr) => {
                if (stopErr) {
                    console.log(stopErr);
                    return res.status(500).send('Error stopping camera');
                }
                console.log('Stop command sent, camera has stopped moving');
                res.send(`Camera ${camId} moved for 1 second and stopped`);
            });
        }, 1000); // 1000 milisegundos = 1 segundo
    });
});

app.get('/moveAbsolute', (req, res) => {
    const { camId, x, y, zoom } = req.query;
    const cam = cams[camId];

    if (!cam) {
        return res.status(500).send('Camera not initialized or invalid camera ID');
    }

    cam.absoluteMove({
        x: parseFloat(x),
        y: parseFloat(y),
        zoom: parseFloat(zoom)
    }, (err) => {
        if (err) {
            console.log(err);
            return res.status(500).send('Error moving camera to absolute position');
        }

        console.log(`Absolute move command sent to camera ${camId}`);
        res.send(`Camera ${camId} moved to absolute position`);
    });
});


// Inicia el servidor después de inicializar las cámaras
initCameras().then(() => {
    app.listen(port, () => {
        console.log(`Camera API running at http://localhost:${port}`);
    });
}).catch(err => {
    console.error('Unexpected error during camera initialization:', err);
});
