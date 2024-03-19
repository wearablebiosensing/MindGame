/*
  =======================================================================
  ==================   Section 0 - Globals  ===================
  =======================================================================
*/

const g_watchID_input = document.getElementById("watchID_input");
const g_watch_status_text = document.getElementById("watch_status_text");
const g_watch_check_watch_status_btn = document.getElementById("watch_status_check_btn");
const g_watch_status_loading = document.getElementById("watch_status_loading");

// Indicates if watch is loading
let g_is_watch_status_loading = false;

/**
 * Handles the process of checking and displaying the watch's status.
 * It makes a server request to check if a watch, identified by its ID, is online or offline.
 */
async function handleWatchStatusCheck(callback, init_watchID = null) {
  // Prevent multiple requests at once
  if (g_is_watch_status_loading == true) return;

  let watchID = init_watchID;
  if (watchID == null) {
    console.log("DFSDF");
    watchID = g_watchID_input.value;

    //No watchID provided
    if (!watchID.match(/\S/)) {
      alert("Watch ID is empty");
      return;
    }
  }

  toggleLoadingIndicator(true);
  g_is_watch_status_loading = true;

  try {
    console.log(watchID);
    // Get and handle watch status
    const watchStatus = await fetchWatchStatus(watchID);
    callback(watchStatus);
    displayWatchStatus(watchStatus);
  } catch (error) {
    console.error("Watch Status Error: ", error);
    displayWatchStatus("offline"); // Default to 'offline' in case of error
    callback("offline");
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
}
