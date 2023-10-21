//====================================
//          Shape Factory's
//====================================
/*We need these functions becuase we use the same shape
class for mulipes different shapes and it just makes it easier*/

function OrangeSquare(
  x,
  y,
  rotation = 0,
  isLevelTile = false,
  isBuildingBlock = false
) {
  const SQUARE_SIZE = 100;
  let color = isLevelTile ? "#D9D9D9" : "#7BBEFC";
  return new Square(
    x,
    y,
    SQUARE_SIZE,
    SQUARE_SIZE,
    color,
    rotation,
    isLevelTile,
    isBuildingBlock
  );
}

function RedCircle(
  x,
  y,
  rotation = 0,
  isLevelTile = false,
  isBuildingBlock = false
) {
  const CIRCLE_RADIUS = 50;
  let color = isLevelTile ? "#D9D9D9" : "#F08C8C";
  return new Circle(
    x,
    y,
    CIRCLE_RADIUS,
    color,
    rotation,
    isLevelTile,
    isBuildingBlock
  );
}

function BlueRightTriangle(
  x,
  y,
  rotation = 0,
  isLevelTile = false,
  isBuildingBlock = false
) {
  const BASE = 100;
  const HEIGHT = 100;
  let color = isLevelTile ? "#D9D9D9" : "#968FFF";
  return new RightTriangle(
    x,
    y,
    BASE,
    HEIGHT,
    color,
    rotation,
    isLevelTile,
    isBuildingBlock
  );
}

function GreenTrapezoid(
  x,
  y,
  rotation = 180,
  isLevelTile = false,
  isBuildingBlock = false
) {
  const BASE = 200;
  const HEIGHT = 100;
  let color = isLevelTile ? "#D9D9D9" : "#A36DBD";
  return new Trapezoid(
    x,
    y,
    BASE,
    HEIGHT,
    color,
    rotation,
    isLevelTile,
    isBuildingBlock
  );
}

function GreenEquilateralTriangle(
  x,
  y,
  rotation = 0,
  isLevelTile = false,
  isBuildingBlock = false
) {
  const SIDE_LENGTH = 95;
  let color = isLevelTile ? "#D9D9D9" : "#FFCC4D";
  return new EquilateralTriangle(
    x,
    y,
    SIDE_LENGTH,
    color,
    rotation,
    isLevelTile,
    isBuildingBlock
  );
}

function BlueHexagon(
  x,
  y,
  rotation = 0,
  isLevelTile = false,
  isBuildingBlock = false
) {
  const SIDE_LENGTH = 100;
  let color = isLevelTile ? "#D9D9D9" : "#81E5DB";

  return new Hexagon(
    x,
    y,
    SIDE_LENGTH,
    color,
    rotation,
    isLevelTile,
    isBuildingBlock
  );
}

function YellowDiamond(
  x,
  y,
  rotation = 0,
  isLevelTile = false,
  isBuildingBlock = false
) {
  const WIDTH = 70;
  const HEIGHT = 200;
  let color = isLevelTile ? "#D9D9D9" : "#E5CF81";

  return new Diamond(
    x,
    y,
    WIDTH,
    HEIGHT,
    color,
    rotation,
    isLevelTile,
    isBuildingBlock,
    "yellow"
  );
}

function PurpleDiamond(
  x,
  y,
  rotation = 0,
  isLevelTile = false,
  isBuildingBlock = false
) {
  // TODO: Change this.
  const WIDTH = 110;
  const HEIGHT = 200;
  let color = isLevelTile ? "#D9D9D9" : "#CA6B6E";

  return new Diamond(
    x,
    y,
    WIDTH,
    HEIGHT,
    color,
    rotation,
    isLevelTile,
    isBuildingBlock,
    "purple"
  );
}

function PinkQuarterCircle(
  x,
  y,
  rotation = 0,
  isLevelTile = false,
  isBuildingBlock = false
) {
  const RADIUS = 100;
  let color = isLevelTile ? "#D9D9D9" : "#727A9C";
  return new QuarterCircle(
    x,
    y,
    RADIUS,
    color,
    rotation,
    isLevelTile,
    isBuildingBlock
  );
}

function getLocalStorageOrNull(key) {
  try {
    const value = localStorage.getItem(key);
    return value !== null ? value : null;
  } catch (error) {
    console.error("Error retrieving from local storage:", error);
    return null;
  }
}

/**
 * Draws two balck lines to seperate the differnt parts of the screen
 * Left - Building Blocks  (25%)
 * Center - Level (50%)
 * Right - Mouse Info (25%)
 */
function drawSectionLines() {
  const section_one_line = canvas.width * 0.25;
  const section_two_line = canvas.width * 0.75;

  ctx.beginPath();

  ctx.moveTo(section_one_line, 0);
  ctx.lineTo(section_one_line, canvas.height);
  ctx.stroke();

  ctx.moveTo(section_two_line, 0);
  ctx.lineTo(section_two_line, canvas.height);
  ctx.stroke();

  ctx.closePath();
}

/**
 * This function is called inside the games page's html so show the right level
 * @param  {Number} level What level you want to cahnge too
 * @param  {Number} sub_level The sublevel to change too
 */
function changeCurrentLevel(level, sub_level) {
  //Update Global Varaibles
  current_level = level;
  current_sub_level = sub_level;

  //Reset All Shapes on screen
  shapes = [];

  //Add Back and Draw needed blocks for new level
  shapes.push(...building_blocks);
  shapes.push(...LEVELS[current_level][current_sub_level]);

  //Update UI
  drawShapes();
  updateProgressBar();
}

//====================================
//             Utils
//====================================

function calculateMousePos(clientX, clientY) {
  /* Function to calculate mouse coordinates relative to the canvas*/
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const x = (clientX - rect.left) * scaleX;
  const y = (clientY - rect.top) * scaleY;
  return { x, y };
}

//====================================
//          Progress Bar
//====================================

// Update the progress bar with a percentage value
function updateProgressBar() {
  percentage = getProgressBarPercentage();
  progressBar.style.width = percentage + "%";
}

function getProgressBarPercentage() {
  const TOTAL_TILES_IN_LEVEL = LEVELS[current_level][current_sub_level].length; //Change as needed
  let level_tiles_filled = 0;

  for (let targetShape of shapes.filter((s) => s.isLevelShape)) {
    if (targetShape.isLevelShapeFilled) level_tiles_filled += 1;
  }

  // console.log(level_tiles_filled, " // ", TOTAL_TILES_IN_LEVEL);

  let percent_level_complete = Math.round(
    (level_tiles_filled / TOTAL_TILES_IN_LEVEL) * 100
  );

  //Set percentage text
  progressBarPercent.innerText = `${percent_level_complete}% complete`;

  return percent_level_complete;
}

/**
 * When a user dose not drag the shape to the right block
 * This function will show the red text letting the user know
 * The text will last for 1s
 */
function showFeedbackText() {
  shapeFeedbackText.style.display = "block";

  setTimeout(() => {
    shapeFeedbackText.style.display = "none";
  }, 1000);
}

/**
 * When a user dose not drag the shape to the right block
 * This function will be called to animate the shape back to the building block
 */
function animateShapeToBuildingBlock(shape, buildingBlockOfShape) {
  const animationSpeed = 0.2; // You can adjust the speed as needed
  const dx = (buildingBlockOfShape.x - shape.x) * animationSpeed;
  const dy = (buildingBlockOfShape.y - shape.y) * animationSpeed;
  const dr = (buildingBlockOfShape.rotation - shape.rotation) * animationSpeed;

  // Check if the shape is close enough to the buildingBlockOfShape
  if (Math.abs(dx) < 1 && Math.abs(dy) < 1) {
    // Snap the shape to the buildingBlockOfShape to avoid precision issues
    shape.x = buildingBlockOfShape.x;
    shape.y = buildingBlockOfShape.y;
    shape.rotation = buildingBlockOfShape.rotation;

    // shapes.splice(current_shape_index, 1);

    drawShapes();

    return;
  } else {
    // Move the shape towards the buildingBlockOfShape
    shape.x += dx;
    shape.y += dy;
    shape.rotation += dr;
  }

  // Update Position on screen
  drawShapes();

  // Repeat the animation on the next frame
  requestAnimationFrame(() => {
    animateShapeToBuildingBlock(shape, buildingBlockOfShape);
  });
}
