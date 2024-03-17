window.addEventListener("resize", resizeCanvas);

function resizeCanvas() {
  canvas.width = window.innerWidth * 2;
  canvas.height = window.innerHeight * 2;
  drawShapes();
}

//====================================
//          Game Functions
//====================================
function drawShapes() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawSectionLines();
  shapes.forEach((shape) => shape.draw()); // Draw each shape

  requestAnimationFrame(drawShapes); // Loop this function

  // calculateShortestEuclidianDistanceForCurrentLevel();
}

//Start the engine
//All thats needed is the event listeners
drawShapes();
