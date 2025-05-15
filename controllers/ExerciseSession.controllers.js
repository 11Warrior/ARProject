// const { ReturnDocument } = require("mongodb");


const workout = async (req, res, next) => {
    const workoutType = req.query.type || 'bicep';
    return res.render('workout', { workoutType });
}

module.exports = {

    workout
};