const video = document.getElementById("video");

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
  faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
  faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
  faceapi.nets.faceExpressionNet.loadFromUri("/models"),
]).then(startVideo);

function startVideo() {
  navigator.mediaDevices
    .getUserMedia({ video: {} })
    .then((stream) => {
      video.srcObject = stream;
      video.addEventListener("loadedmetadata", onVideoReady);
    })
    .catch((err) => console.error(err));
}

function onVideoReady() {
  const container = document.querySelector(".video-container");
  const canvas = faceapi.createCanvasFromMedia(video);
  container.appendChild(canvas);

  // Ensure correct positioning
  canvas.style.position = "absolute";
  canvas.style.top = "0";
  canvas.style.left = "0";

  function updateCanvasSize() {
    const { width, height } = video.getBoundingClientRect();
    canvas.width = width;
    canvas.height = height;
    faceapi.matchDimensions(canvas, { width, height });
  }

  updateCanvasSize(); // Set initial size
  window.addEventListener("resize", updateCanvasSize); // Update on resize

  setInterval(async () => {
    const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions();

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Get precise video bounding box for accurate scaling
    const videoRect = video.getBoundingClientRect();
    const displaySize = { width: videoRect.width, height: videoRect.height };
    const resizedDetections = faceapi.resizeResults(detections, displaySize);

    // Draw aligned face landmarks
    faceapi.draw.drawDetections(canvas, resizedDetections);
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
    faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
  }, 100);
}
