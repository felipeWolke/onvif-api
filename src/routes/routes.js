// routes.js
const express = require('express');
const { moveCameraController } = require('../controllers/controller');

const router = express.Router();

router.post('/camera/move', moveCameraController);

module.exports = router;
