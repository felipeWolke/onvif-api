require('dotenv').config();
const ONVIF = require('node-onvif');

// Usar variables de entorno para la configuración de la cámara
const cameraIp = process.env.CAMERA_IP2;
const cameraPort = process.env.CAMERA_PORT2;
const cameraUsername = process.env.CAMERA_USERNAME2;
const cameraPassword = process.env.CAMERA_PASSWORD2;

const device2 = new ONVIF.OnvifDevice({
    xaddr: `http://${cameraIp}:${cameraPort}/onvif/device_service`,
    user: cameraUsername,
    pass: cameraPassword
});

const initConnection2 = device2.init()
    .then(() => {
        console.log('Conexión con la cámara ONVIF establecida');
        return device2; // Devuelve la instancia del dispositivo conectado
    })
    .catch((error) => {
        console.error('Error al conectar con la cámara ONVIF:', error);
        throw error;
    });

module.exports = initConnection2;

