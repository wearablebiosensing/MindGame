
function isPlaygroundModeEnabled() {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);

  // Example - www.test.com/game?playground=true
  const enabled = urlParams.get("playground");

  return enabled ? true : false;
}

// Playground mode flag
const isPlaygroundMode = isPlaygroundModeEnabled();

// Change title of the game when in playground mode
if (isPlaygroundMode) {
  document.querySelector(".level_indicator").innerHTML = "Playground Mode";
} else {
  // Only collect MQTT data when not in playground mode
  start_mqtt_data_collection();
}

// Stop watch data collection if user leaves the page before finishing level
window.addEventListener("beforeunload", function (e) {
  stop_mqtt_data_collection();
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
