// Makse sure localstorage names are consistant
const LOCALSTORAGE_USERID = "mindgame_userID";
const LOCALSTORAGE_PROGRESS = "mindgame_progress";
const LOCALSTORAGE_CURR_LEVEL = "mindgame_level";
const LOCALSTORAGE_CURR_SUBLEVEL = "mindgame_sublevel";
const LOCALSTORAGE_NEXT_LEVEL = "mindgame_next_level";
const LOCALSTORAGE_NEXT_SUBLEVEL = "mindgame_next_sublevel";
const LOCALSTORAGE_WATCHID = "mindgame_watchID";

const MINDGAME_MAX_LEVEL = 9;
const MINDGAME_MAX_SUBLEVEL = 3;

const MINDGAME_PROGRESS_ENUM = Object.freeze({
  HOME: "mindgame_home",
  NOGO: "mindgame_nogo",
  PRECHECK: "mindgame_precheck",
});

const MINDGAME_ROUTE_ENUM = Object.freeze({
  HOME: "/",
  NOGO: "/nogo",
  PRECHECK: "/mindgame_precheck",
});

function getLocalStorageOrNull(key) {
  try {
    const value = localStorage.getItem(key);
    return value !== null ? value : null;
  } catch (error) {
    console.error("Error retrieving from local storage:", error);
    return null;
  }
}

function getLocalStorage(key, default_value) {
  const value = getLocalStorageOrNull(key);
  return value == null ? default_value : value;
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
      level: getLocalStorageOrNull(LOCALSTORAGE_CURR_LEVEL),
      sub_level: getLocalStorageOrNull(LOCALSTORAGE_CURR_SUBLEVEL),
      userID: getLocalStorageOrNull(LOCALSTORAGE_USERID),
      watchID: getLocalStorageOrNull(LOCALSTORAGE_WATCHID),
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
      watchID: getLocalStorageOrNull(LOCALSTORAGE_WATCHID),
    }),
  })
    .then((res) => {
      console.log("Stop mqtt data collection");
    })
    .catch((err) => console.log(err));
}
