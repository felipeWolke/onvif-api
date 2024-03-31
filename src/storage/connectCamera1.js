require('dotenv').config();
const ONVIF = require('node-onvif');

// Usar variables de entorno para la configuración de la cámara
const cameraIp = process.env.CAMERA_IP1;
const cameraPort = process.env.CAMERA_PORT1;
const cameraUsername = process.env.CAMERA_USERNAME1;
const cameraPassword = process.env.CAMERA_PASSWORD1;

const device1 = new ONVIF.OnvifDevice({
    xaddr: `http://${cameraIp}:${cameraPort}/onvif/device_service`,
    user: cameraUsername,
    pass: cameraPassword
});

const initConnection1 = device1.init()
    .then(() => {
        console.log('Conexión con la cámara ONVIF establecida');
        return device1; // Devuelve la instancia del dispositivo conectado
    })
    .catch((error) => {
        console.error('Error al conectar con la cámara ONVIF:', error);
        throw error;
    });

module.exports = initConnection1;

