function getLocalStorageOrNull(key) {
  try {
    const value = localStorage.getItem(key);
    return value !== null ? value : null;
  } catch (error) {
    console.error("Error retrieving from local storage:", error);
    return null;
  }
}

function getRandomNumberInclusive(min, max) {
  min = Math.ceil(min); // Ensure min is rounded up to the nearest whole number
  max = Math.floor(max); // Ensure max is rounded down to the nearest whole number
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function start_mqtt_data_collection() {
  console.log("Mouse info ", current_level, current_sub_level, getLocalStorageOrNull("userID"));
  fetch("/start_mqtt", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      level: getLocalStorageOrNull("currentLevel"),
      sub_level: getLocalStorageOrNull("currentSubLevel"),
      userID: getLocalStorageOrNull("userID"),
      watchID: getLocalStorageOrNull("watchID"),
    }),
  });
}

function stop_mqtt_data_collection() {
  //Posting the data to the server
  fetch("/stop_mqtt", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      watchID: getLocalStorageOrNull("watchID"),
    }),
  })
    .then((res) => {
      console.log("Stop mqtt data collection");
    })
    .catch((err) => console.log(err));
}
