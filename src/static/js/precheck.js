/*
  =======================================================================
  ==================   Section 0 - Globals  ===================
  =======================================================================
*/

const g_watchID_input = document.getElementById("watchID_input");
const g_watch_status_text = document.getElementById("watch_status_text");
const g_watch_check_watch_status_btn = document.getElementById("watch_status_check_btn");
const g_watch_status_loading = document.getElementById("watch_status_loading");
const g_mindgame_start_btn = document.getElementById("mindgame_start_btn");
const g_show_user_id = document.getElementById("pregame_id");

// Indicates if watch is connected
let g_watch_status = false;
let g_is_watch_status_loading = false;

/*
  =======================================================================
  ==================   Section 1 - Watch App Status   ===================
  =======================================================================
*/

/**
 * Handles the process of checking and displaying the watch's status.
 * It makes a server request to check if a watch, identified by its ID, is online or offline.
 */
async function handleWatchStatusCheck(callback) {
  const watchID = g_watchID_input.value;

  //No watchID provided
  if (!watchID.match(/\S/)) {
    alert("Watch ID is empty");
    return;
  }

  toggleLoadingIndicator(true);
  g_is_watch_status_loading = true;

  try {
    // Get and handle watch status
    const watchStatus = await fetchWatchStatus(watchID);
    // watchStatus == "online" ? (g_watch_status = true) : (g_watch_status = false);
    displayWatchStatus(watchStatus);
  } catch (error) {
    console.error("Watch Status Error: ", error);
    displayWatchStatus("offline"); // Default to 'offline' in case of error
  } finally {
    toggleLoadingIndicator(false);
    g_is_watch_status_loading = false;
  }
}

/**
 * Toggles the visibility of the loading indicator and the watch status text.
 * @param {boolean} isLoading True to show the loading indicator, false to hide it.
 */
function toggleLoadingIndicator(isLoading) {
  g_watch_status_loading.style.display = isLoading ? "block" : "none";
  g_watch_status_text.style.display = isLoading ? "none" : "block";
}

/**
 * Makes a request to the server to check the watch's status.
 * @param {string} watchID The ID of the watch to check.
 * @return {Promise<string>} The status of the watch ('online' or 'offline').
 */
async function fetchWatchStatus(watchID) {
  const response = await fetch("/check_mqtt_connection", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ watchID }),
  });
  const data = await response.json();
  return data["status"];
}

/**
 * Updates the UI to display the watch's status.
 * @param {string} status The status of the watch ('online' or 'offline').
 */
function displayWatchStatus(status) {
  const isOnline = status == "online";
  console.log(isOnline);
  g_watch_status_text.innerText = isOnline ? "Online" : "Offline";
  g_watch_status_text.style.color = isOnline ? "green" : "red";

  if (isOnline) {
    g_watch_status = true;
    g_mindgame_start_btn.classList.remove("pregame_disabled");
  } else {
    g_watch_status = false;
    g_mindgame_start_btn.classList.add("pregame_disabled");
  }
}

/*
  =======================================================================
  ==================   Section 2 - Event Listeners   ===================
  =======================================================================


*/

// function getLocalStorageOrNull(key) {
//   try {
//     const value = localStorage.getItem(key);
//     return value !== null ? value : null;
//   } catch (error) {
//     console.error("Error retrieving from local storage:", error);
//     return null;
//   }
// }

// function prefillInputsWithLocalStorage() {
//   const watchID = getLocalStorageOrNull("watchID");
//   g_watchID_input.value = watchID;
// }
// prefillInputsWithLocalStorage();

// // Event listner for the check status button
// g_watch_check_watch_status_btn.addEventListener("click", async () => {
//   // Prevent multiple requests at once
//   if (g_is_watch_status_loading == true) return;

//   const watchID = g_watchID_input.value;
//   if (!watchID.match(/\S/)) {
//     alert("Watch ID is empty");
//     return;
//   }

//   localStorage.setItem("watchID", watchID);
//   await handleWatchStatusCheck();
// });

// // Event listner for the start mindgame button
// g_mindgame_start_btn.addEventListener("click", () => {
//   const watchID = g_watchID_input.value;
//   if (!watchID.match(/\S/)) {
//     alert("Watch ID is empty");
//     return;
//   }

//   if (g_mindgame_start_btn.classList.contains("pregame_disabled")) return;

//   if (getLocalStorageOrNull("userID") == null) {
//     alert("Cannot start MindGame as there is no userID saved to differentiate the data");
//     return;
//   }

//   localStorage.setItem("watchID", watchID);
//   localStorage.setItem("currentLevel", 1); // Start at level 1
//   localStorage.setItem("currentSubLevel", getRandomNumberInclusive(1, 3));
//   window.location = "/tiles_game";
// });

// // Show userID
// g_show_user_id.innerHTML += getLocalStorageOrNull("userID") == null ? "No UserID found" : getLocalStorageOrNull("userID");
