// Function to get a value from local storage or return null if it doesn't exist
function getLocalStorageOrNull(key) {
  try {
    // Try to get the value from local storage
    const value = localStorage.getItem(key);
    // If the value is not null, return it, otherwise return null
    return value !== null ? value : null;
  } catch (error) {
    // If there was an error retrieving the value, log it and return null
    console.error("Error retrieving from local storage:", error);
    return null;
  }
}

// Function to get a random number between min and max (inclusive)
function getRandomNumberInclusive(min, max) {
  // Round min up to the nearest whole number
  min = Math.ceil(min);
  // Round max down to the nearest whole number
  max = Math.floor(max);
  // Generate and return a random number between min and max
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Function to start collecting MQTT data
function start_mqtt_data_collection() {
  // Log some information
  console.log("Mouse info ", current_level, current_sub_level, getLocalStorageOrNull("userID"));
  // Send a POST request to the /start_mqtt endpoint
  fetch("/start_mqtt", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    // The body of the request is a JSON string containing some data from local storage
    body: JSON.stringify({
      level: getLocalStorageOrNull("currentLevel"),
      sub_level: getLocalStorageOrNull("currentSubLevel"),
      userID: getLocalStorageOrNull("userID"),
      watchID: getLocalStorageOrNull("watchID"),
    }),
  });
}

// Function to stop collecting MQTT data
function stop_mqtt_data_collection() {
  // Send a POST request to the /stop_mqtt endpoint
  fetch("/stop_mqtt", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    // The body of the request is a JSON string containing the watchID from local storage
    body: JSON.stringify({
      watchID: getLocalStorageOrNull("watchID"),
    }),
  })
    .then((res) => {
      // Log a message when the request is successful
      console.log("Stop mqtt data collection");
    })
    .catch((err) => {
      // Log any errors
      console.log(err);
    });
}
