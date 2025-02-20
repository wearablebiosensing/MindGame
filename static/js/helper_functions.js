console.log("helper_functions.js loaded")
// Makes sure localstorage names are consistent
const LOCALSTORAGE_USERID = "mindgame_userID";
const LOCALSTORAGE_PROGRESS = "mindgame_progress";
const LOCALSTORAGE_CURR_LEVEL = "mindgame_level";
const LOCALSTORAGE_CURR_SUBLEVEL = "mindgame_sublevel";
const LOCALSTORAGE_NEXT_LEVEL = "mindgame_next_level";
const LOCALSTORAGE_NEXT_SUBLEVEL = "mindgame_next_sublevel";
const LOCALSTORAGE_WATCHID = "mindgame_watchID";
const LOCALSTORAGE_LOCATION = "mindgame_location";

const MINDGAME_MAX_LEVEL = 14;
const MINDGAME_MAX_SUBLEVEL = 3;

const MINDGAME_PROGRESS_ENUM = Object.freeze({
  HOME: "mindgame_home",
  CPT: "mindgame_cpt",
  PRECHECK: "mindgame_precheck",
});

const MINDGAME_ROUTE_ENUM = Object.freeze({
  HOME: "/",
  CPT: "/cpt",
  PRECHECK: "/mindgame_precheck",
});

// Ensures level selection happens before MQTT starts
function setLevelBeforeMQTT() {
  const { level, subLevel } = updateRandomLevelSelectionWithoutRepeats();
  
  // Save finalized level to localStorage BEFORE data collection
  localStorage.setItem(LOCALSTORAGE_CURR_LEVEL, level);
  localStorage.setItem(LOCALSTORAGE_CURR_SUBLEVEL, subLevel);

  console.log(`Selected Level: ${level}, Sublevel: ${subLevel} BEFORE data collection`);
  
  return { level, subLevel };
}

// Function to get unplayed levels
function getUnplayedLevels() {
  const playedLevels = JSON.parse(localStorage.getItem("playedLevels") || "[]");
  const allLevels = [];

  for (const level in LEVELS) {
    for (const subLevel in LEVELS[level]) {
      allLevels.push({ level: Number(level), subLevel: Number(subLevel) });
    }
  }

  return allLevels.filter(
    ({ level, subLevel }) =>
      !playedLevels.some((played) => played.level === level && played.subLevel === subLevel)
  );
}

// Function to update random level without repeats //ISSUE: ERROR CAUSING LEVEL NOT TO LOAD (POSSIBILITY CAUSING DATALOSS)
function updateRandomLevelSelectionWithoutRepeats() {
  const unplayedLevels = getUnplayedLevels();
  if (unplayedLevels.length === 0) {
    console.log("All levels played! Resetting...");
    localStorage.removeItem("playedLevels"); // Reset played levels
    return updateRandomLevelSelection(); // Restart random selection
  }

  const randomIndex = Math.floor(Math.random() * unplayedLevels.length);
  const { level, subLevel } = unplayedLevels[randomIndex];

  // Mark this level as played
  const playedLevels = JSON.parse(localStorage.getItem("playedLevels") || "[]");
  playedLevels.push({ level, subLevel });
  localStorage.setItem("playedLevels", JSON.stringify(playedLevels));

  localStorage.setItem(LOCALSTORAGE_CURR_LEVEL, level);
  localStorage.setItem(LOCALSTORAGE_CURR_SUBLEVEL, subLevel);

  console.log(`Randomized Level: ${level}-${subLevel}`);

  return { level, subLevel };
}

// Function to start MQTT correctly with the right level info
function start_mqtt_data_collection() {
  const { level, subLevel } = setLevelBeforeMQTT(); // Ensures correct level is selected

  const watchID = getLocalStorageOrNull(LOCALSTORAGE_WATCHID);
  if (!watchID) {
    console.error("Watch ID not found!");
    return;
  }

  fetch("/start_mqtt", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      watchID: watchID,
      level: level,
      sub_level: subLevel,
      userID: getLocalStorageOrNull(LOCALSTORAGE_USERID),
      location: getLocalStorageOrNull(LOCALSTORAGE_LOCATION),
    }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to start MQTT data collection");
      }
      console.log(`Started MQTT for Level ${level}-${subLevel}`);
    })
    .catch((error) => console.error("MQTT Start Error:", error));
}

// Function to stop MQTT data collection
function stop_mqtt_data_collection() {
  fetch("/stop_mqtt", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      watchID: getLocalStorageOrNull(LOCALSTORAGE_WATCHID),
    }),
  })
    .then(() => {
      console.log("Stopped MQTT data collection");
    })
    .catch((err) => console.error("Stop MQTT Error:", err));
}

// Utility functions for localStorage management
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

function updateProgressToCPT() {
  localStorage.setItem(LOCALSTORAGE_PROGRESS, MINDGAME_PROGRESS_ENUM.CPT);
}

function getRandomNumberInclusive(min, max) {
  min = Math.ceil(min); // Ensure min is rounded up to the nearest whole number
  max = Math.floor(max); // Ensure max is rounded down to the nearest whole number
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
