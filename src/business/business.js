// business.js
const cameraConnection = require('../storage/connect');

async function moveCamera(direction) {
    try {
        const device = await cameraConnection;
        const ptz = { x: 0, y: 0, z: 0 };

        switch (direction) {
            case 'left':
                ptz.x = -1;
                break;
            case 'right':
                ptz.x = 1;
                break;
            case 'up':
                ptz.y = 1;
                break;
            case 'down':
                ptz.y = -1;
                break;
            case 'zoomIn':
                ptz.z = 1;
                break;
            case 'zoomOut':
                ptz.z = -1;
                break;
        }

        await device.ptzMove({
            speed: ptz,
            timeout: 1
        });
        console.log(`Movimiento de la cámara hacia ${direction}`);
        return 'Movimiento completado';
    } catch (error) {
        console.error('Error al mover la cámara:', error);
        throw error;
    }
}

module.exports = {
    moveCamera
};
