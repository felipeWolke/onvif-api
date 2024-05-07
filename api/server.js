require('dotenv').config();
const { exec } = require('child_process');
const os = require('os');
const jwt = require('jsonwebtoken');
const retryInterval = 300 * 1000; // 120 segundos
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

function initCameras() {
    const promises = Object.keys(camIps).map(key =>
        new Promise(resolve => {
            initCamera(key, resolve);
        })
    );

    return Promise.all(promises).then(() => {
        // Programa los reintentos para cámaras no inicializadas
        setInterval(() => {
            Object.keys(camIps).forEach(key => {
                if (!cams[key]) {
                    console.log(`Reintento de conexión para la cámara ${key}`);
                    initCamera(key, () => {});
                }
            });
        }, retryInterval);
    });
}

function initCamera(key, resolve) {
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
}

// Endpoint para mover la cámara
// Endpoint para mover la cámara de manera continua
app.post('/move', authenticate, (req, res) => {
    const { camId, x, y, zoom } = req.body;
    const cam = cams[camId];

    if (!cam) {
        return res.status(500).send('Camera not initialized or invalid camera ID');
    }

    cam.relativeMove({ x, y, zoom }, (err) => {
        if (err) {
            console.log(err);
            return res.status(500).send('Error moving camera');
        }
    
        console.log(`Relative move command sent to camera ${camId}`);
        // Aquí podrías enviar una respuesta de éxito, si la lógica de tu aplicación lo requiere
        // res.send(`Camera ${camId} has moved to the relative position specified`);
    });
    
    cam.getStatus((err, status) => {
        if (err) {
            console.log(err);
            return res.status(500).send('Error obtaining camera position');
    }
        console.log(`Position obtained for camera ${camId}`);
        res.json({ 
            camId: camId,
            position: {
                x: status.position.x,
                y: status.position.y,
                zoom: status.position.zoom
            },
            message: "camera moved to relative position"
        })
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
        // Suponiendo que el módulo ONVIF tiene un método getStatus para obtener la posición actual
        cam.getStatus((err, status) => {
            if (err) {
                console.log(err);
                return res.status(500).send('Error obtaining camera position');
        }
            console.log(`Position obtained for camera ${camId}`);
            res.json({ 
                camId: camId,
                position: {
                    x: status.position.x,
                    y: status.position.y,
                    zoom: status.position.zoom
                },
                message: "camera moved to absolute position"
            })
        });
        //res.send(`Camera ${camId} moved to absolute position`);
    });
});

app.get('/health',authenticate, (req, res) => {
    
    res.send("saludo")
});

app.get('/cameras/status', authenticate, (req, res) => {
    let status = {};
    for (let camId in camIps) {
        status[camId] = cams[camId] ? 'Connected' : 'Disconnected';
    }
    res.json(status);
});

app.get('/server/status', authenticate,(req, res) => {
    let command;
    
    if (os.platform() === 'linux') {
        // En Linux, generalmente 'top -b -n 1' tiene un encabezado de aproximadamente 7 líneas antes de los procesos
        command = 'top -b -n 1 | head -n 17'; // 7 líneas de encabezado + 10 líneas de procesos
    } else if (os.platform() === 'darwin') {
        // En macOS, 'top -l 1' tiene un encabezado de aproximadamente 10 líneas antes de los procesos
        command = 'top -l 1 -s 0 -stats pid,command,cpu,mem | head -n 21'; // 10 líneas de encabezado + 11 líneas para asegurar 10 procesos
    } else {
        return res.status(500).send("Sistema operativo no soportado");
    }

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return res.status(500).send(`Error al ejecutar comando: ${error.message}`);
        }
        if (stderr) {
            console.error(`stderr: ${stderr}`);
            return res.status(500).send(stderr);
        }
        res.send(`<pre>${stdout}</pre>`);
    });
});

// Endpoint para obtener la posición absoluta actual de la cámara
app.get('/camera/position', authenticate, (req, res) => {
    const { camId } = req.query; // Asume que el ID de la cámara se pasa como parámetro de consulta

    const cam = cams[camId];
    if (!cam) {
        return res.status(500).send('Camera not initialized or invalid camera ID');
    }

    // Suponiendo que el módulo ONVIF tiene un método getStatus para obtener la posición actual
    cam.getStatus((err, status) => {
        if (err) {
            console.log(err);
            return res.status(500).send('Error obtaining camera position');
        }
        console.log(`Position obtained for camera ${camId}`);
        res.json({ 
            camId: camId,
            position: {
                x: status.position.x,
                y: status.position.y,
                zoom: status.position.zoom
            }
        });
    });
});
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const storedUsername = process.env.USERNAME;
    const storedPassword = process.env.PASSWORD;

    // Verifica las credenciales
    if (username === storedUsername && password === storedPassword) {
        const user = { name: username };
        // Firmar el token con una duración de 1 hora
        const accessToken = jwt.sign(user, process.env.SECRET_KEY, { expiresIn: '1h' });
        res.json({ accessToken });
    } else {
        // Enviar error si las credenciales son incorrectas
        res.status(401).send('Las credenciales son incorrectas');
    }
});

// Inicia el servidor después de inicializar las cámaras
initCameras().then(() => {
    app.listen(port, () => {
        console.log(`Camera API running at http://localhost:${port}`);
    });
}).catch(err => {
    console.error('Unexpected error during camera initialization:', err);
});
