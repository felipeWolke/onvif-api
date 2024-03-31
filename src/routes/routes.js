// routes.js
const express = require('express');
const { moveCamera1Controller, moveCamera2Controller } = require('../controllers/controller');

const router = express.Router();

router.post('/camera/1', moveCamera1Controller);
router.post('/camera/2', moveCamera2Controller);

module.exports = router;
