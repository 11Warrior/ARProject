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
            } else if (this.workoutType === 'squats') {
                this.detectSquat(keypoints);
            } else if (this.workoutType === 'shoulderPress') {
                this.detectShoulderPress(keypoints);
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

    detectSquat(keypoints) {
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
        const leftAnkle = keypoints.find(
            kp => kp.name === "left_ankle" || kp.part === "leftAnkle"
        );
        const rightAnkle = keypoints.find(
            kp => kp.name === "right_ankle" || kp.part === "rightAnkle"
        );

        if (
            leftHip && rightHip && leftKnee && rightKnee &&
            leftAnkle && rightAnkle &&
            (leftHip.score === undefined || leftHip.score > 0.4) &&
            (rightHip.score === undefined || rightHip.score > 0.4) &&
            (leftKnee.score === undefined || leftKnee.score > 0.4) &&
            (rightKnee.score === undefined || rightKnee.score > 0.4) &&
            (leftAnkle.score === undefined || leftAnkle.score > 0.4) &&
            (rightAnkle.score === undefined || rightAnkle.score > 0.4)
        ) {
            // Calculate average positions
            const avgHipY = (leftHip.y + rightHip.y) / 2;
            const avgKneeY = (leftKnee.y + rightKnee.y) / 2;
            const avgAnkleY = (leftAnkle.y + rightAnkle.y) / 2;

            // Calculate knee angles
            const leftKneeAngle = Math.abs(Math.atan2(
                leftHip.y - leftKnee.y,
                leftHip.x - leftKnee.x
            ) - Math.atan2(
                leftAnkle.y - leftKnee.y,
                leftAnkle.x - leftKnee.x
            )) * 180 / Math.PI;

            const rightKneeAngle = Math.abs(Math.atan2(
                rightHip.y - rightKnee.y,
                rightHip.x - rightKnee.x
            ) - Math.atan2(
                rightAnkle.y - rightKnee.y,
                rightAnkle.x - rightKnee.x
            )) * 180 / Math.PI;

            const avgKneeAngle = (leftKneeAngle + rightKneeAngle) / 2;

            // Squat is considered "down" when knees are bent significantly
            const isSquatDown = avgKneeAngle < 100;
            // Squat is considered "up" when knees are nearly straight
            const isSquatUp = avgKneeAngle > 160;

            // Initialize wasDown if not present
            if (this.wasDown === undefined) this.wasDown = false;

            // Only count when going from down to up
            if (isSquatUp && this.wasDown) {
                if (window.incrementReps) window.incrementReps();
                this.wasDown = false;
            }
            if (isSquatDown) {
                this.wasDown = true;
            }
        }
    }

    detectShoulderPress(keypoints) {
        const leftShoulder = keypoints.find(
            kp => kp.name === "left_shoulder" || kp.part === "leftShoulder"
        );
        const rightShoulder = keypoints.find(
            kp => kp.name === "right_shoulder" || kp.part === "rightShoulder"
        );
        const leftElbow = keypoints.find(
            kp => kp.name === "left_elbow" || kp.part === "leftElbow"
        );
        const rightElbow = keypoints.find(
            kp => kp.name === "right_elbow" || kp.part === "rightElbow"
        );
        const leftWrist = keypoints.find(
            kp => kp.name === "left_wrist" || kp.part === "leftWrist"
        );
        const rightWrist = keypoints.find(
            kp => kp.name === "right_wrist" || kp.part === "rightWrist"
        );

        if (
            leftShoulder && rightShoulder && leftElbow && rightElbow &&
            leftWrist && rightWrist &&
            (leftShoulder.score === undefined || leftShoulder.score > 0.4) &&
            (rightShoulder.score === undefined || rightShoulder.score > 0.4) &&
            (leftElbow.score === undefined || leftElbow.score > 0.4) &&
            (rightElbow.score === undefined || rightElbow.score > 0.4) &&
            (leftWrist.score === undefined || leftWrist.score > 0.4) &&
            (rightWrist.score === undefined || rightWrist.score > 0.4)
        ) {
            // Calculate average positions
            const avgShoulderY = (leftShoulder.y + rightShoulder.y) / 2;
            const avgWristY = (leftWrist.y + rightWrist.y) / 2;

            // Calculate arm angles
            const leftArmAngle = Math.abs(Math.atan2(
                leftShoulder.y - leftElbow.y,
                leftShoulder.x - leftElbow.x
            ) - Math.atan2(
                leftWrist.y - leftElbow.y,
                leftWrist.x - leftElbow.x
            )) * 180 / Math.PI;

            const rightArmAngle = Math.abs(Math.atan2(
                rightShoulder.y - rightElbow.y,
                rightShoulder.x - rightElbow.x
            ) - Math.atan2(
                rightWrist.y - rightElbow.y,
                rightWrist.x - rightElbow.x
            )) * 180 / Math.PI;

            const avgArmAngle = (leftArmAngle + rightArmAngle) / 2;

            // Shoulder press is considered "up" when arms are extended
            const isPressUp = avgArmAngle > 150 && avgWristY < avgShoulderY - 20;
            // Shoulder press is considered "down" when arms are bent
            const isPressDown = avgArmAngle < 90 && avgWristY > avgShoulderY;

            // Initialize wasDown if not present
            if (this.wasDown === undefined) this.wasDown = false;

            // Only count when going from down to up
            if (isPressUp && this.wasDown) {
                if (window.incrementReps) window.incrementReps();
                this.wasDown = false;
            }
            if (isPressDown) {
                this.wasDown = true;
            }
        }
    }
}