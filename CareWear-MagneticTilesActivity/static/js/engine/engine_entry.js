//====================================
//          Game Functions
//====================================
function drawShapes() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawSectionLines();

  for (let shape of shapes) {
    shape.draw();
  }

  // calculateShortestEuclidianDistanceForCurrentLevel();
}

//Start the engine
//All thats needed is the event listeners
drawShapes();

//Starting watch data collection
start_mqtt_data_collection();
