// connect.js
const ONVIF = require('node-onvif');

// Datos de la cámara - idealmente estos deberían ser almacenados de forma segura o configurados como variables de entorno
const cameraIp = '192.168.1.100';
const cameraPort = 80;
const cameraUsername = 'admin';
const cameraPassword = 'adminpassword';

const device = new ONVIF.OnvifDevice({
    xaddr: `http://${cameraIp}:${cameraPort}/onvif/device_service`,
    user: cameraUsername,
    pass: cameraPassword
});

const initConnection = device.init()
    .then(() => {
        console.log('Conexión con la cámara ONVIF establecida');
        return device; // Devuelve la instancia del dispositivo conectado
    })
    .catch((error) => {
        console.error('Error al conectar con la cámara ONVIF:', error);
        throw error;
    });

module.exports = initConnection;
