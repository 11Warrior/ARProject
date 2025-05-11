class Sketcher{
    constructor(canvasToDraw){
        this.canvasToDraw=canvasToDraw
        this.canvasToDrawContext=canvasToDraw.getContext('2d')
        this.prevCurlState = false; 
    }

    drawPredictions(poses){
        if(poses.length>0){
            poses[0].keypoints.forEach(element => {
            this.canvasToDrawContext.beginPath();
            this.canvasToDrawContext.arc(element.x, element.y, 5, 0, Math.PI*2, true);
            this.canvasToDrawContext.closePath();
            this.canvasToDrawContext.fillStyle = 'red';
            this.canvasToDrawContext.fill();
            });

            const keypoints = poses[0].keypoints;

            const rightWrist = keypoints.find(
                kp => kp.name === "right_wrist" || kp.part === "rightWrist"
            );
            const rightShoulder = keypoints.find(
                kp => kp.name === "right_shoulder" || kp.part === "rightShoulder"
            );

            if (
                rightWrist && rightShoulder &&
                (rightWrist.score === undefined || rightWrist.score > 0.4) &&
                (rightShoulder.score === undefined || rightShoulder.score > 0.4)
            ) {

                const isCurlUp = rightWrist.y < rightShoulder.y - 20; 

                if (isCurlUp && !this.prevCurlState) {
                    if (window.incrementReps) window.incrementReps();
                }
                this.prevCurlState = isCurlUp;
            }
        }
    }

}