class ARWorkoutEngineBuilder  {

    constructor(){
        this.workoutType = 'bicep';
    }

    addUserVideo(userVideo){
        this.userVideo=userVideo
        return this
    }
    addUserStream(userStream){
        this.userStream=userStream
        return this
    }
    addUserCanvas(userCanvas){
        this.userCanvas=userCanvas
        return this
    }
    addWorkoutType(workoutType) {
        this.workoutType = workoutType;
        return this;
    }
    
    build(){
        return new ARWorkoutEngine(this)
    }
}