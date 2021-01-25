const videoWidth = 600;
const videoHeight = 500;
let modelPromise;
modelPromise = cocoSsd.load({ base: "lite_mobilenet_v2" });

async function setupCamera() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error(
        'Browser API navigator.mediaDevices.getUserMedia not available');
  }

  const video = document.getElementById('video');
  video.width = videoWidth;
  video.height = videoHeight;

  const stream = await navigator.mediaDevices.getUserMedia({
    'audio': false,
    'video': {
      facingMode: null,
      width: videoWidth,
      height: videoHeight,
    },
  });
  video.srcObject = stream;

  return new Promise((resolve) => {
    video.onloadedmetadata = () => {
      resolve(video);
    };
  });
}

async function loadVideo() {
  const video = await setupCamera();
  video.play();

  return video;
}

function detectInRealTime(video) {
  const canvas = document.getElementById('output');
  const ctx = canvas.getContext('2d');

  canvas.width = videoWidth;
  canvas.height = videoHeight;

  async function objectDetectionFrame() {
    const model = await modelPromise;
    const result = await model.detect(video);
    ctx.drawImage(video, 0, 0);
    ctx.font = '10px Arial';
  
    console.log('number of detections: ', result.length);
    for (let i = 0; i < result.length; i++) {
      ctx.beginPath();
      ctx.strokeRect(...result[i].bbox);
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'green';
      ctx.fillStyle = 'green';
      ctx.stroke();
      ctx.fillText(
          result[i].score.toFixed(3) + ' ' + result[i].class, result[i].bbox[0],
          result[i].bbox[1] > 10 ? result[i].bbox[1] - 5 : 10);
    }
    requestAnimationFrame(objectDetectionFrame);
  }
  objectDetectionFrame();
}

async function bindPage() {
  let video;
  try {
    video = await loadVideo();
  } catch (e) {
    let info = document.getElementById('info');
    info.textContent = 'this browser does not support video capture,' +
        'or this device does not have a camera';
    info.style.display = 'block';
    throw e;
  }
  detectInRealTime(video)
}

navigator.getUserMedia = navigator.getUserMedia ||
    navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
// kick off the demo
bindPage();