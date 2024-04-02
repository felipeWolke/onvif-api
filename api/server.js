require('dotenv').config();
const express = require('express');
const Cam = require('../lib/onvif').Cam;

const app = express();
const port = 3050; // Puerto en el que la API estará escuchando

let cam_obj = null;

// Inicializa la cámara ONVIF
function initCamera() {
    return new Promise((resolve, reject) => {
        new Cam({
            hostname: '10.8.0.2',
            username: 'wolke',
            password: 'Wolke1028',
            port: 3001,
            timeout: 10000
        }, function(err) {
            if (err) {
                reject(err);
            } else {
                cam_obj = this;
                resolve();
            }
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
    }, function(err) {
        if (err) {
            console.log(err);
            return res.status(500).send('Error moving camera');
        }
        res.send('Camera moved');
    });
});

// Endpoint para mover la cámara
// Endpoint para mover la cámara
app.get('/move', (req, res) => {
    const { x, y, zoom } = req.query;

    if (!cam_obj) {
        return res.status(500).send('Camera not initialized');
    }

    // Inicia el movimiento
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

