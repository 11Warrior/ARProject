class Sketcher{
    constructor(canvasToDraw, workoutType){
        this.canvasToDraw = canvasToDraw
        this.canvasToDrawContext = canvasToDraw.getContext('2d')
        this.workoutType = workoutType
        this.prevState = false;
        this.wasDown = undefined;
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

            if (this.workoutType === 'pushup') {
                this.detectPushup(keypoints);
            } else if (this.workoutType === 'biceps') {
                this.detectBicepCurl(keypoints);
            } else if (this.workoutType === 'situp') {
                this.detectSitup(keypoints);
            }
        }
    }

    detectPushup(keypoints) {
        const leftShoulder = keypoints.find(
            kp => kp.name === "left_shoulder" || kp.part === "leftShoulder"
        );
        const rightShoulder = keypoints.find(
            kp => kp.name === "right_shoulder" || kp.part === "rightShoulder"
        );
        const leftHip = keypoints.find(
            kp => kp.name === "left_hip" || kp.part === "leftHip"
        );
        const rightHip = keypoints.find(
            kp => kp.name === "right_hip" || kp.part === "rightHip"
        );

        if (
            leftShoulder && rightShoulder && leftHip && rightHip &&
            (leftShoulder.score === undefined || leftShoulder.score > 0.4) &&
            (rightShoulder.score === undefined || rightShoulder.score > 0.4) &&
            (leftHip.score === undefined || leftHip.score > 0.4) &&
            (rightHip.score === undefined || rightHip.score > 0.4)
        ) {
            // Calculate average positions
            const avgShoulderY = (leftShoulder.y + rightShoulder.y) / 2;
            const avgHipY = (leftHip.y + rightHip.y) / 2;
            
            // Calculate the angle between shoulders and hips
            const angle = Math.abs(Math.atan2(avgHipY - avgShoulderY, 
                Math.abs((leftShoulder.x + rightShoulder.x) / 2 - (leftHip.x + rightHip.x) / 2)) * 180 / Math.PI);

            // Consider it a pushup when the angle is close to 0 (body is straight)
            // and the shoulders are significantly above the hips
            const isPushupUp = angle < 20 && avgShoulderY < avgHipY - 50;

            if (isPushupUp && !this.prevState) {
                if (window.incrementReps) window.incrementReps();
            }
            this.prevState = isPushupUp;
        }
    }

    detectBicepCurl(keypoints) {
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

            if (isCurlUp && !this.prevState) {
                if (window.incrementReps) window.incrementReps();
            }
            this.prevState = isCurlUp;
        }
    }

    detectSitup(keypoints) {
        const leftShoulder = keypoints.find(
            kp => kp.name === "left_shoulder" || kp.part === "leftShoulder"
        );
        const rightShoulder = keypoints.find(
            kp => kp.name === "right_shoulder" || kp.part === "rightShoulder"
        );
        const leftHip = keypoints.find(
            kp => kp.name === "left_hip" || kp.part === "leftHip"
        );
        const rightHip = keypoints.find(
            kp => kp.name === "right_hip" || kp.part === "rightHip"
        );
        const leftKnee = keypoints.find(
            kp => kp.name === "left_knee" || kp.part === "leftKnee"
        );
        const rightKnee = keypoints.find(
            kp => kp.name === "right_knee" || kp.part === "rightKnee"
        );

        if (
            leftShoulder && rightShoulder && leftHip && rightHip &&
            leftKnee && rightKnee &&
            (leftShoulder.score === undefined || leftShoulder.score > 0.4) &&
            (rightShoulder.score === undefined || rightShoulder.score > 0.4) &&
            (leftHip.score === undefined || leftHip.score > 0.4) &&
            (rightHip.score === undefined || rightHip.score > 0.4) &&
            (leftKnee.score === undefined || leftKnee.score > 0.4) &&
            (rightKnee.score === undefined || rightKnee.score > 0.4)
        ) {
            const avgShoulderY = (leftShoulder.y + rightShoulder.y) / 2;
            const avgHipY = (leftHip.y + rightHip.y) / 2;
            const angle = Math.abs(Math.atan2(avgHipY - avgShoulderY, 
                Math.abs((leftShoulder.x + rightShoulder.x) / 2 - (leftHip.x + rightHip.x) / 2)) * 180 / Math.PI);

            // "Up" position: torso raised
            const isSitupUp = angle < 45 && avgShoulderY < avgHipY - 30;
            // "Down" position: torso down
            const isSitupDown = angle < 45 && avgShoulderY > avgHipY - 10;

            // Initialize wasDown if not present
            if (this.wasDown === undefined) this.wasDown = false;

            // Only count when going from down to up
            if (isSitupUp && this.wasDown) {
                if (window.incrementReps) window.incrementReps();
                this.wasDown = false; // Prevent double count
            }
            if (isSitupDown) {
                this.wasDown = true;
            }
        }
    }
}