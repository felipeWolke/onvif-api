import ONVIF from 'node-onvif';

// Función para inicializar y conectar a la cámara
function initCamera(ip, port, username, password) {
    const device = new ONVIF.OnvifDevice({
        xaddr: `http://${ip}:${port}/onvif/device_service`,
        user: username,
        pass: password
    });

    device.init().then(() => {
        console.log('Cámara inicializada');
        // La cámara está lista para ser controlada aquí
    }).catch((error) => {
        console.error(error);
    });

    return device;
}

// Función para mover la cámara
function moveCamera(device, direction, speed) {
    let ptz = {
        x: 0, // Pan
        y: 0, // Tilt
        z: 0  // Zoom
    };

    switch (direction) {
        case 'left':
            ptz.x = -speed;
            break;
        case 'right':
            ptz.x = speed;
            break;
        case 'up':
            ptz.y = speed;
            break;
        case 'down':
            ptz.y = -speed;
            break;
        case 'zoomIn':
            ptz.z = speed;
            break;
        case 'zoomOut':
            ptz.z = -speed;
            break;
    }

    device.ptzMove({
        speed: ptz,
        timeout: 1 // Duración del movimiento en segundos
    }).then(() => {
        console.log('Movimiento realizado');
    }).catch((error) => {
        console.error(error);
    });
}

// Ejemplo de uso
const device = initCamera('192.168.1.100', 80, 'admin', 'adminpassword');
moveCamera(device, 'left', 0.5); // Mover la cámara hacia la izquierda a media velocidad
