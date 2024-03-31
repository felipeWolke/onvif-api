// controller.js
const { moveCamera1, moveCamera2 } = require('../business/business');

function moveCamera1Controller(req, res) {
    const { direction } = req.body;
    moveCamera1(direction)
        .then(result => res.send(result))
        .catch(error => res.status(500).send(`Error al mover la cámara: ${error.message}`));
}

function moveCamera2Controller(req, res) {
    const { direction } = req.body;
    moveCamera2(direction)
        .then(result => res.send(result))
        .catch(error => res.status(500).send(`Error al mover la cámara: ${error.message}`));
}

module.exports = {
    moveCamera1Controller,
    moveCamera2Controller
};
