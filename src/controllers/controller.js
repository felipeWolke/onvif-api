// controller.js
const { moveCamera } = require('../business/business');

function moveCameraController(req, res) {
    const { direction } = req.body;
    moveCamera(direction)
        .then(result => res.send(result))
        .catch(error => res.status(500).send(`Error al mover la cámara: ${error.message}`));
}

module.exports = {
    moveCameraController
};
