/**
 * Calcualtes the euclidan distance between two points
 */
function euclideanDistance(x1, y1, x2, y2) {
  const deltaX = x2 - x1;
  const deltaY = y2 - y1;
  const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  return distance;
}

/**
 * At the end of each level before the data gets sent to the server
 * This function calculates the sum of the shortist distance between the building block
 * and each level block. It then stores this in an object and returns it
 *  (key) - Shape Name    (value) - total distance for shape
 */
function calculateShortestEuclidianDistanceForLevel() {
  shortestEuclidDistances = {};

  for (let levelShape of shapes.filter((s) => s.isLevelShape)) {
    //Getting Building Block
    let buildingBlockOfSameLevelShape = null;
    shapes.forEach((shape) => {
      if (shape.isBuildingBlock && shape.type == levelShape.type) {
        buildingBlockOfSameLevelShape = shape;
      }
    });

    distance = euclideanDistance(
      buildingBlockOfSameLevelShape.x,
      buildingBlockOfSameLevelShape.y,
      levelShape.x,
      levelShape.y
    );

    if (levelShape.type in shortestEuclidDistances) {
      //Add to Shortest Distance
      shortestEuclidDistances[levelShape.type] += distance;
    } else {
      shortestEuclidDistances[levelShape.type] = distance;
    }
  }

  // console.log("Shortest Euclid Distance For Level - ", shortestEuclidDistances);
  return shortestEuclidDistances;
}

function calculateUserEuclidDistances() {
  const shapeDistances = {};
  let currentStrokeData = [];
  let totalDistance = 0; // Initialize totalDistance to 0
  let prevX = null;
  let prevY = null;

  for (const row of mouse_motion_array) {
    if (row[0] === "END_OF_STROKE") {
      const shape = currentStrokeData[0][2];

      // Calculate the distance traveled for the current stroke
      let strokeDistance = 0;
      for (let i = 1; i < currentStrokeData.length; i++) {
        const [x1, y1] = currentStrokeData[i - 1];
        const [x2, y2] = currentStrokeData[i];
        strokeDistance += euclideanDistance(x1, y1, x2, y2);
      }

      // Add the strokeDistance to totalDistance
      totalDistance += strokeDistance;

      // Store the total distance for the shape
      if (shape in shapeDistances) {
        shapeDistances[shape] += strokeDistance;
      } else {
        shapeDistances[shape] = strokeDistance;
      }

      currentStrokeData = [];
    } else {
      const [x, y, shape] = [parseInt(row[0]), parseInt(row[1]), row[3]];
      currentStrokeData.push([x, y, shape]);
    }
  }

  // Calculate and add the distance of the last stroke
  if (currentStrokeData.length > 0) {
    const shape = currentStrokeData[0][2];

    // Calculate the distance traveled for the last stroke
    let strokeDistance = 0;
    for (let i = 1; i < currentStrokeData.length; i++) {
      const [x1, y1] = currentStrokeData[i - 1];
      const [x2, y2] = currentStrokeData[i];
      strokeDistance += euclideanDistance(x1, y1, x2, y2);
    }

    // Add the strokeDistance to totalDistance
    totalDistance += strokeDistance;

    // Store the total distance for the shape
    if (shape in shapeDistances) {
      shapeDistances[shape] += strokeDistance;
    } else {
      shapeDistances[shape] = strokeDistance;
    }
  }

  console.log(`Total Distance Traveled: ${totalDistance}`);

  // Print the total distances for each shape
  for (const shape in shapeDistances) {
    console.log(`Shape: ${shape}, Total Distance: ${shapeDistances[shape]}`);
  }

  return shapeDistances;
}

function euclideanDistance(x1, y1, x2, y2) {
  return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
}

//====================================
//        Collect mouse data
//====================================
function getTimestamp() {
  // Create a new Date object
  const currentDate = new Date();

  // Get the individual components of the current timestamp
  const hours = currentDate.getHours().toString().padStart(2, "0");
  const minutes = currentDate.getMinutes().toString().padStart(2, "0");
  const seconds = currentDate.getSeconds().toString().padStart(2, "0");
  const milliseconds = currentDate
    .getMilliseconds()
    .toString()
    .padStart(3, "0");

  // Format the timestamp
  const formattedTimestamp = `${hours}:${minutes}:${seconds}:${milliseconds}`;

  return formattedTimestamp;
}

function calculateTotalLevelTime() {
  const user_end_timestamp = Date.now();

  // Global - user_start_timestamp
  const total_level_time = user_end_timestamp - user_start_timestamp;
  const minutes = Math.floor(total_level_time / (1000 * 60));
  const seconds = Math.floor((total_level_time / 1000) % 60);

  return {
    ttc_minutes: minutes,
    ttc_seconds: seconds,
  };

  // Ensure minutes and seconds have two digits with leading zeros
  // const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
  // const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds;

  // const timeString = `${formattedMinutes}:${formattedSeconds}`;

  // return timeString;
}

function postLevelMouseData() {
  /*
      This function will post the acculated data of the mouse movements
      for the current level to the server to create the csv file. It will then
      reset all of the accumulators
    */

  // calculateTotalLevelTime();
  // console.log("End of motion - ", mouse_motion_array);
  postMouseMotionData();
}

function postMouseMotionData() {
  // console.log(
  //   "user_euclid_movement_distances:",
  //   calculateUserEuclidDistances(),
  //   "shortest_euclid_distances:",
  //   calculateShortestEuclidianDistanceForLevel()
  // );

  //Turns the screen to a low opacity black
  //Displays the spinner untill the fetch request responds
  const spinner = document.querySelector(".spinner");
  const finished = document.querySelector(".finished");
  finished.style.display = "block";
  spinner.style.display = "block";

  //Posting the data to the server
  fetch("/process-mouse-data", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      time_to_complete: calculateTotalLevelTime(), //Send how long it took user to complete level
      user_euclid_movement_distances: calculateUserEuclidDistances(),
      shortest_euclid_distances: calculateShortestEuclidianDistanceForLevel(),
      data: mouse_motion_array, // Raw Mouse Data
      level: current_level,
      sub_level: current_sub_level,
      userID: getLocalStorageOrNull("userID"),
    }),
  })
    .then((res) => {
      //Go to the scoring page
      window.location.href = `/updated_scoring`;
    })
    .catch((err) => console.log(err));
}
