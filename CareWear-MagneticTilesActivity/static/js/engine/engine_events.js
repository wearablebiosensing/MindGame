//====================================
//      Controls / EventListeners
//====================================

//When the user clicks on the screen
function mouse_down(event) {
  event.preventDefault();

  let clientX = 0;
  let clientY = 0;

  // Handle touch events as well
  if (event.type === "touchstart") {
    // Get touch coordinates
    const touch = event.touches[0];
    clientX = touch.clientX;
    clientY = touch.clientY;
  } else {
    clientX = event.clientX;
    clientY = event.clientY;
  }

  const { x, y } = calculateMousePos(clientX, clientY);

  // Check if the mouse position is inside any shape
  for (let i = shapes.length - 1; i >= 0; i--) {
    const shape = shapes[i];

    //Prevent level tiles & snapped shapes from being moved
    if (shape.isPointInside(x, y) && !shape.isLevelShape && !shape.isSnapped) {
      console.log("Inside of a shape");

      if (shape.isBuildingBlock) {
        let newShape;

        //Creates a new shape from building block
        newShape = shape.createShapeFromBlock();
        shapes.push(newShape);
        current_shape_index = shapes.length - 1;
        newShape.mouseDown(x, y);
      } else {
        current_shape_index = i;
        shape.mouseDown(x, y);
      }

      // Move the shape to the top of the stack
      // shapes.push(shapes.splice(i, 1)[0]);

      break;
    }
  }
}

function mouse_move(event) {
  // if (current_shape_index === null) return;

  let clientX = 0;
  let clientY = 0;

  // Handle touch events as well
  if (event.type === "touchmove") {
    // Get touch coordinates
    const touch = event.touches[0];
    clientX = Math.round(touch.clientX);
    clientY = Math.round(touch.clientY);
  } else {
    clientX = event.clientX;
    clientY = event.clientY;
  }

  //Collect mouse data every interval set by global var
  const currentTime = Date.now();

  const { x, y } = calculateMousePos(clientX, clientY);

  // Calculate the change in position and time
  const dx = x - prevMouseX;
  const dy = y - prevMouseY;
  const dt = currentTime - prevTimestamp;

  // Calculate the acceleration
  const accelerationX = dx / dt;
  const accelerationY = dy / dt;

  const accelerationX_in_px_per_s_squared = accelerationX * 1000;
  const accelerationY_in_px_per_s_squared = accelerationY * 1000;

  // Store the current mouse position and timestamp for the next iteration
  prevMouseX = x;
  prevMouseY = y;
  prevTimestamp = currentTime;

  // Check if enough time has passed since the last collection
  if (currentTime - lastCollectionTime >= throttlingInterval) {
    if (mouse_motion_array) {
      // console.log("Push mouse data: ", Math.round(x), Math.round(y));
      mouse_motion_array.push([
        Math.round(x),
        Math.round(y),
        getTimestamp(),
        current_shape_index ? shapes[current_shape_index].type : "null",
        Math.round(accelerationX_in_px_per_s_squared),
        Math.round(accelerationY_in_px_per_s_squared),
      ]);
      console.log("Mouse: ", mouse_motion_array);
      lastCollectionTime = currentTime;
    }
  }

  // Ensures that we have to be dragging a shape to do logic below
  if (current_shape_index === null) return;

  let closestDistanceToShape = null;

  const shape = shapes[current_shape_index];
  for (let targetShape of shapes.filter(
    (s) => s.isLevelShape || s.isBuildingBlock
  )) {
    //Calculate distance from dragging shape to level shape
    const distance = shape.getDistanceToShape(targetShape);
    if (closestDistanceToShape == null) {
      closestDistanceToShape = distance;
      closest_shape_to_current = targetShape; //Global Var
    } else if (distance < closestDistanceToShape) {
      closestDistanceToShape = distance;
      closest_shape_to_current = targetShape; //Global Var
    }

    // Check if the shape is close enough to a special shape and snap it if true
    shape.snapToTargetShape(targetShape);
    updateProgressBar();
  }

  // LEVEL IS COMPLETE
  if (getProgressBarPercentage() == 100) {
    if (isDataSentAlready == false) {
      if (mouse_motion_array.length != 0) {
        console.log("POSING");
        postLevelMouseData(); //Create csv
        stop_mqtt_data_collection();
      }
    }

    isDataSentAlready = true;
  }

  shapes[current_shape_index].mouseMove(x, y);

  drawShapes();
}

function mouse_up(event) {
  event.preventDefault();

  if (current_shape_index === null) return;

  const shape = shapes[current_shape_index];

  //Shape is not over correct shape, give feedback
  if (shape.type != closest_shape_to_current.type) {
    //Get Building Block so we can move shape back
    let buildingBlockOfShape = null;

    for (let buildingBlock of shapes.filter((s) => s.isBuildingBlock)) {
      if (shape.type == buildingBlock.type) {
        buildingBlockOfShape = buildingBlock;
      }
    }

    showFeedbackText();

    //Move shape back to Building Block
    animateShapeToBuildingBlock(shape, buildingBlockOfShape);
  }

  shape.mouseUp();
  current_shape_index = null;

  // Add the identifier for the end of stroke
  mouse_motion_array.push([
    "END_OF_STROKE",
    0,
    0,
    getTimestamp(),
    "END_OF_STROKE",
    0,
    0,
    0,
  ]);
}

//Called to rotate in degrees
function rotateCurrentShape(deg) {
  if (current_shape_index !== null) {
    const shape = shapes[current_shape_index];

    //Prevents rotation when shape is snapped into place
    if (!shape.isDragging) return;

    shape.rotate(deg); // Adjust the rotation angle as desired
    console.log("Shape rotation - ", shape.rotation);
    drawShapes();
  }
}

document.addEventListener("keydown", function (event) {
  if (event.key === "r" || event.key === "R") {
    rotateCurrentShape(5);
    console.log("Rotated shape");
  }

  if (event.key === "e" || event.key === "E") {
    rotateCurrentShape(-5);
    console.log("Rotated shape");
  }
});

//Add the actual event listeners to the canvas
canvas.addEventListener("mousedown", mouse_down);
canvas.addEventListener("mouseup", mouse_up);
canvas.addEventListener("mousemove", mouse_move);

canvas.addEventListener("touchstart", mouse_down);
canvas.addEventListener("touchend", mouse_up);
canvas.addEventListener("touchmove", mouse_move);
