function isPlaygroundModeEnabled() {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);

  //Example - www.test.com/game?playground=true
  const enabled = urlParams.get("playground");

  return enabled ? true : false;
}

//When goign through the tutorial we need some way
//in the code to determine if we should not collect
//and post data if in a certain mode
const isPlaygroundMode = isPlaygroundModeEnabled();

//Change title of game when in playground mode
if (isPlaygroundMode) {
  document.querySelector(".level_indicator").innerHTML = "Playground Mode";
} else {
  //Only collect mqtt data when not in playground mode
  start_mqtt_data_collection();
}

//Stop watch data collection if user leaves page before finishing level
window.addEventListener("beforeunload", function (e) {
  stop_mqtt_data_collection();
});

const userID_display = document.getElementById("userID");
const currentLevel_display = document.getElementById("level");

/*This function comes from drag_drop.js
  Make sure it is included before this is called*/
//This function will change the specific level user is on
const currentLevel = Number(getLocalStorageOrNull("currentLevel"));
const currentSubLevel = Number(getLocalStorageOrNull("currentSubLevel"));

changeCurrentLevel(currentLevel, currentSubLevel); //NOTHING WILL WORK WITHOUT THIS

//Update text on page
// userID_display.innerText = getLocalStorageOrNull("userID") ?? "";
currentLevel_display.innerText = currentLevel ?? "";
