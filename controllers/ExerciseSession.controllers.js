// const { ReturnDocument } = require("mongodb");
const { ExerciseSession } = require("../models/exerciseSession.models");

const startSession = async (req, res, next) => {
    if(!req.body.workoutType){
        return res.status(400).json({
            message:'Invalid Request'
        })
    }
    var exerciseSession = await ExerciseSession.startExcerciseSession({
        workoutType: req.body.workoutType
    })
    return res.status(200).json({
        sessionID: exerciseSession._id
    })
}

const endSession = async (req, res, next) => {
    if(!req.body.sessionID || !req.body.accuracy){
        return res.status(400).json({
            message:'Invalid Request'
        })
    }
    await ExerciseSession.endExerciseSession({
        sessionID: req.body.sessionID,
        accuracy: req.body.accuracy
    })
    return res.status(200).json({
        sessionID: req.body.sessionID,
        message:'session ended'
    })
}

const getSessions = async (req, res, next) => {
    var sessions = await ExerciseSession.getUserSessions()
    return res.status(200).json(sessions)
}

const workout = async (req, res, next) => {
    const workoutType = req.query.type || 'bicep';
    return res.render('workout', { workoutType });
}

module.exports = {
    startSession,
    endSession,
    getSessions,
    workout
};