require('dotenv').config();
const express = require('express');
const { Cam } = require('onvif');
const cors = require('cors');

const app = express();
app.use(cors());

const port = process.env.PORT || 3555;
const camIp = process.env.CAMERA_IP || '10.8.0.4';
const camPort = process.env.CAMERA_PORT || 3001;
const camUsername = process.env.CAMERA_USER || 'wolke';
const camPassword = process.env.CAMERA_PASSWORD || 'Wolke1028';

let cam_obj = null;

// Inicializa la cámara ONVIF
function initCamera() {
    return new Promise((resolve, reject) => {
        new Cam({
            hostname: camIp,
            username: camUsername,
            password: camPassword,
            port: camPort,
            timeout: 10000
        }, function(err) {
            if (err) {
                return reject(err);
            }
            cam_obj = this;
            resolve();
        });
    });
}

// Endpoint para mover la cámara
app.get('/move', (req, res) => {
    const { x, y, zoom } = req.query;

    if (!cam_obj) {
        return res.status(500).send('Camera not initialized');
    }

    cam_obj.continuousMove({
        x: parseFloat(x),
        y: parseFloat(y),
        zoom: parseFloat(zoom)
    }, (err) => {
        if (err) {
            console.log(err);
            return res.status(500).send('Error moving camera');
        }

        console.log('Move command sent, camera will move for 1 second');

        // Programa la detención del movimiento después de 1 segundo
        setTimeout(() => {
            cam_obj.stop({panTilt: true, zoom: true}, (stopErr) => {
                if (stopErr) {
                    console.log(stopErr);
                    return res.status(500).send('Error stopping camera');
                }
                console.log('Stop command sent, camera has stopped moving');
                res.send('Camera moved for 1 second and stopped');
            });
        }, 1000); // 1000 milisegundos = 1 segundo
    });
});

// Inicia el servidor después de inicializar la cámara
initCamera().then(() => {
    app.listen(port, () => {
        console.log(`Camera API running at http://localhost:${port}`);
    });
}).catch(err => {
    console.error('Failed to initialize camera:', err);
});
