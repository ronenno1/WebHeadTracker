function init_minno_mesh(global) {

    /* ---------- Create Container ---------- */

    global.canvas_div = document.createElement('div');
    global.canvas_div.style.marginLeft = 'auto';
    global.canvas_div.style.marginRight = 'auto';

    global.canvas_div.style.position = 'absolute';
    global.canvas_div.style.left = '50%';
    global.canvas_div.style.transform = 'translate(-50%, -50%)';

    /* ---------- Video (UNCHANGED) ---------- */

    global.full_video = document.createElement('video');
    global.full_video.className = "input_video";
    global.full_video.width = "1280px";
    global.full_video.height = "720px";

    /* ---------- Canvas ---------- */

    global.full_canvas = document.createElement('canvas');
    global.full_canvas.className = "output_canvas";
    global.full_canvas.width = 256;
    global.full_canvas.height = 144;

    global.full_canvas.style.display = 'block';
    global.full_canvas.style.margin = 'auto';

    /* ---------- Append Elements ---------- */

    global.canvas_div.appendChild(global.full_video);
    global.canvas_div.appendChild(global.full_canvas);

    /* ---------- Position ---------- */

    global.top_vid = true;

    if (global.top_vid) {
        global.canvas_div.style.top = global.full_canvas.height / 2 + 'px';
        document.body.style.marginTop = global.full_canvas.height + 'px';
    } else {
        global.canvas_div.style.bottom = -global.full_canvas.height / 2 + 'px';
    }

    document.body.appendChild(global.canvas_div);

    /* ---------- Globals ---------- */

    global.videoElement = global.full_video;

    global.head_data = [];

    global.samples_counter = 0;
    global.samples_valid_counter = 0;

    global.start_recording = start_recording;
    global.stop_recording = stop_recording;
    global.stopVideo = stop_video;

    global.get_all = get_all;
    global.get_validity = get_validity;
    global.get_answer = get_answer;

    global.detectionNeeded = false;
    global.stop_me = false;

    /* ---------- FaceMesh ---------- */

    global.faceMesh = new FaceMesh({
        locateFile: (file) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
    });

    global.faceMesh.setOptions({
        maxNumFaces: 1,
        selfieMode: true,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
    });

    global.faceMesh.onResults((results) => parse_data(results, global));

    /* ---------- Camera ---------- */

    global.camera = new Camera(global.videoElement, {
        onFrame: async () => {

            if (global.stop_me) return;

            await global.faceMesh.send({
                image: global.videoElement
            });

        },
        width: 1280,
        height: 720
    });

    global.camera.start();
}

/* -----------------------------
   Parse FaceMesh Data
----------------------------- */

function parse_data(results, global) {

    const canvas = global.full_canvas;
    const ctx = canvas.getContext('2d');

    const W = canvas.width;
    const H = canvas.height;

    ctx.save();
    ctx.clearRect(0, 0, W, H);

    ctx.drawImage(results.image, 0, 0, W, H);

    const boxX = 0.3 * W;
    const boxY = 0.1 * H;
    const boxW = 0.4 * W;
    const boxH = 0.8 * H;

    ctx.strokeStyle = "#00ff00";
    ctx.lineWidth = 5;
    ctx.strokeRect(boxX, boxY, boxW, boxH);

    const centerX = boxX + boxW / 2;
    const centerY = boxY + boxH / 2;

    const cross = 10;

    ctx.beginPath();
    ctx.moveTo(centerX - cross, centerY);
    ctx.lineTo(centerX + cross, centerY);
    ctx.moveTo(centerX, centerY - cross);
    ctx.lineTo(centerX, centerY + cross);
    ctx.stroke();

    if (global.detectionNeeded && results.multiFaceLandmarks) {

        global.samples_counter++;

        if (results.multiFaceLandmarks.length === 0) {
            ctx.strokeStyle = "#ff0000";
            ctx.strokeRect(boxX, boxY, boxW, boxH);
        }

        for (const landmarks of results.multiFaceLandmarks) {

            const leftEye = landmarks[33];
            const rightEye = landmarks[263];
            const nose = landmarks[4];

            const dx = (leftEye.x - rightEye.x) * W;
            const dy = (leftEye.y - rightEye.y) * H;

            const eyeWidth = Math.sqrt(dx * dx + dy * dy);

            const x_pos = nose.x * W - W / 2;
            const y_pos = nose.y * H - H / 2;

            global.head_data.push({
                t: Date.now(),
                x: Math.round(100 * x_pos / eyeWidth),
                y: Math.round(-100 * y_pos / eyeWidth),
                angle: Math.round(-(90 + Math.atan2(dx, dy) * 180 / Math.PI))
            });

            global.samples_valid_counter++;

            if (
                leftEye.x < 0.31 ||
                rightEye.x > 0.69 ||
                leftEye.y < 0.21 ||
                rightEye.y < 0.21 ||
                leftEye.x > 0.79 ||
                rightEye.x > 0.79
            ) {
                ctx.strokeStyle = "#ff0000";
                ctx.strokeRect(boxX, boxY, boxW, boxH);
            }
        }
    }

    ctx.restore();
}

/* -----------------------------
   Data Access
----------------------------- */

function get_all(global) {
    return global.head_data;
}

function get_validity(global) {
    return global.samples_valid_counter / global.samples_counter;
}

/* -----------------------------
   Detect Nod vs Shake
----------------------------- */

function get_answer(global) {

    const data = global.head_data;
    let detection = 'e';

    if (data.length > 0) {

        const baseX = data[0].x;
        const baseY = data[0].y;

        const X = data.map(p => p.x - baseX);
        const Y = data.map(p => p.y - baseY);

        const rangeX = Math.max(...X) - Math.min(...X);
        const rangeY = Math.max(...Y) - Math.min(...Y);

        if (rangeX > 20 || rangeY > 20) {

            const ratio = rangeX / rangeY;

            if (ratio > 1.5) detection = 'n';
            if (ratio < 0.66) detection = 'y';

        }
    }

    const key = detection.toUpperCase().charCodeAt(0);

    document.dispatchEvent(new KeyboardEvent("keydown", { keyCode: key }));

    setTimeout(() => {
        document.dispatchEvent(new KeyboardEvent("keyup", { keyCode: key }));
    }, 50);

    return detection;
}

/* -----------------------------
   Control
----------------------------- */

function start_recording(global) {

    global.detectionNeeded = true;
    global.head_data = [];

    global.samples_counter = 0;
    global.samples_valid_counter = 0;
}

function stop_recording(global) {
    global.detectionNeeded = false;
}

function stop_video(global) {

    global.stop_me = true;
    global.detectionNeeded = false;

    document.body.removeChild(global.canvas_div);

    global.camera.stop();
    global.camera = false;
}
