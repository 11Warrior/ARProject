const mongoose = require('mongoose');

const exerciseSessionSchema = new mongoose.Schema({
    workoutType: {
        type: String,
        required: true
    },
    startTime: {
        type: Date,
        default: Date.now
    },
    endTime: {
        type: Date
    },
    accuracy: {
        type: Number,
        default: 0
    },
    reps: {
        type: Number,
        default: 0
    }
});

const ExerciseSession = mongoose.model('ExerciseSession', exerciseSessionSchema);

// Static methods
ExerciseSession.startExcerciseSession = async function(sessionData) {
    const session = new ExerciseSession({
        workoutType: sessionData.workoutType
    });
    return await session.save();
};

ExerciseSession.endExerciseSession = async function(sessionData) {
    return await ExerciseSession.findByIdAndUpdate(
        sessionData.sessionID,
        {
            endTime: new Date(),
            accuracy: sessionData.accuracy
        },
        { new: true }
    );
};

ExerciseSession.getUserSessions = async function() {
    return await ExerciseSession.find()
        .sort({ startTime: -1 })
        .limit(10);
};

module.exports = { ExerciseSession }; 