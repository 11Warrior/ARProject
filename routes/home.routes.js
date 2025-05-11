const express = require('express');
const homeControllers = require('../controllers/home.controllers');
const router = express.Router();

router.get('/', homeControllers.dashboard);

module.exports = router