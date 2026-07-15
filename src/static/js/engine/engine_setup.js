
function isPlaygroundModeEnabled() {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);

  // Example - www.test.com/game?playground=true
  const enabled = urlParams.get("playground");

  return enabled ? true : false;
}

// Playground mode flag
const isPlaygroundMode = isPlaygroundModeEnabled();

// Demo mode flag - full 10 minute session (random levels + scoring) without a watch
const isDemoMode = getLocalStorageOrNull("mindgame_demo") === "true";

// Change title of the game when in playground mode
if (isPlaygroundMode) {
  document.querySelector(".level_indicator").innerHTML = "Playground Mode";
} else if (isDemoMode) {
  // Same random level selection as a real session, but no MQTT/watch
  setLevelBeforeMQTT();
} else {
  // Only collect MQTT data when not in playground mode
  start_mqtt_data_collection();
}

// Stop watch data collection if user leaves the page before finishing level
window.addEventListener("beforeunload", function (e) {
  if (!isDemoMode) stop_mqtt_data_collection();
});

const userID_display = document.getElementById("mindgame_userID");
const currentLevel_display = document.getElementById("mindgame_level_txt");

const level = localStorage.getItem("mindgame_level");
const subLevel = localStorage.getItem("mindgame_sublevel");

// Apply the random level and sublevel
changeCurrentLevel(level, subLevel);

console.log(`Initialized Level: ${level}, Sub-Level: ${subLevel}`);

// Update text on the page
currentLevel_display.innerText = `Level ${level}-${subLevel}`;
