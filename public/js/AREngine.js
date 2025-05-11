class ARWorkoutEngine {
    static instance

    constructor({
        userVideo = "",
        userStream = "",
        userCanvas=""
    } = {}) {
        this.userVideo=userVideo
        this.userCanvas=userCanvas
        this.userStream=userStream
        this.userCanvas.height= this.userVideo.videoHeight
        this.userCanvas.width= this.userVideo.videoWidth
        this.userCanvasContext=this.userCanvas.getContext("2d");
        this.userCanvasContext.translate(this.userCanvas.width, 0);
        this.userCanvasContext.scale(-1, 1);
        this.initializePoseNet()
        this.initializeCamera()
        this.POSENET_LOADED=false
        this.sketcher=new Sketcher(this.userCanvas)
        ARWorkoutEngine.setInstance(this)

    }
    async initializePoseNet(){
        const detectorConfig = {modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING};
        this.detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, detectorConfig);
        $('body').trigger('model-loaded')
        this.POSENET_LOADED=true
    }
    async  initializeCamera() {
        const camera = new Camera(this.userVideo, {
            onFrame: async () => {
                this.drawUserStream();
                if(this.POSENET_LOADED){
                    this.performPredictions()
                }
            },
            width: 1280,
            height: 720,
        });
        camera.start(this.userStream);
    }
    
    async performPredictions(){
        const poses = await this.detector.estimatePoses(this.userVideo);
        console.log(poses)
        this.sketcher.drawPredictions(poses)
    }
    drawUserStream(){
        this.userCanvasContext.drawImage(this.userVideo,0,0,this.userVideo.videoWidth, this.userVideo.videoHeight)
    }
    updateCanvas(cv){
        this.userCanvas=cv
    }
    updateVideo(video){
        this.userVideo=video
    }
    updateStream(stream){
        this.userStream=stream
    }
    static setInstance(instance){
            this.instance=instance
    }
    static getInstance(){
        if(!this.instance){
            throw new Error('Cannot get ARWorkoutEngine instance without building it.')
        }else{
            return this.instance

        }
    }
}
