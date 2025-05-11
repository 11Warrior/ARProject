const express = require('express');
const ExcerciseSessionControllers = require('../controllers/ExerciseSession.controllers');
const router = express.Router();

router.get('/workout', ExcerciseSessionControllers.workout);

module.exports = router