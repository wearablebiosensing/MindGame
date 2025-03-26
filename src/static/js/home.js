/*
  This file contains needed functions for the landing/home page of the MindGame Application
  Event listeners and use of these functions can be found in the "landing_page.html"
*/

/*
  =======================================================================
  ==================   Section 0 - Globals   ===================
  =======================================================================
*/

// Get the input element with the ID "identifier"
const g_userID_input = document.getElementById("identifier");

// Get the button elements with the IDs "in_lab_btn" and "at_home_btn"
const g_inlab_btn = document.getElementById("in_lab_btn");
const g_athome_btn = document.getElementById("at_home_btn");

/*
  =======================================================================
  ================= Section 3 - Useful Helper Functions   ===============
  =======================================================================
*/

// Function to get a value from local storage or return null if it doesn't exist
function getLocalStorageOrNull(key) {
  try {
  const value = localStorage.getItem(key);
  return value !== null ? value : null;
  } catch (error) {
  console.error("Error retrieving from local storage:", error);
  return null;
  }
}

// Function to prefill the input field with the user ID from local storage if it exists
function prefillInputsWithLocalStorage() {
  const userID = getLocalStorageOrNull("userID");
  g_userID_input.value = userID;
}

/*
  =======================================================================
  =================   Section 4 - Event Listeners  / App Start  =====================
  =======================================================================
*/

// Define prefixes for user IDs
const HEALTHLY_PREFIX = "N";
const OTHER_PREFIX = "P";

// Define a regular expression for validating user IDs
const userIDPattern = /^[NP]\d+$/;

// Add an event listener to the "in lab" button
g_inlab_btn.addEventListener("click", async () => {
  // Get the user ID from the input field
  const userID = g_userID_input.value;

  // Check if the user ID is empty
  if (!userID.match(/\S/)) {
  alert("Identifier is empty");
  return;
  }

  // Check if the user ID matches the required pattern
  if (!userIDPattern.test(userID)) {
  alert("Identifier must be either N or P followed by numbers.");
  return;
  }

  // Generate a random sublevel number between 1 and 3
  let sublevel = getRandomNumberInclusive(1, 3);

  // Store the user ID, current level, current sublevel, next level, and next sublevel in local storage
  localStorage.setItem("userID", userID);
  localStorage.setItem("currentLevel", 1);
  localStorage.setItem("currentSubLevel", sublevel);
  localStorage.setItem("mindgame_next_level", 1);
  localStorage.setItem("mindgame_next_sublevel", sublevel);

  // Redirect to a different page based on the prefix of the user ID
  if (userID.startsWith(HEALTHLY_PREFIX)) {
  window.location = `/nogo`;
  } else {
  window.location = `/start_application/inlab`;
  }
});

// Add an event listener to the "at home" button
g_athome_btn.addEventListener("click", async () => {
  // Get the user ID from the input field
  const userID = g_userID_input.value;

  // Check if the user ID is empty
  if (!userID.match(/\S/)) {
  alert("Identifier is empty");
  return;
  }

  // Check if the user ID matches the required pattern
  if (!userIDPattern.test(userID)) {
  alert("Identifier must be either N or P followed by numbers.");
  return;
  }

  // Generate a random sublevel number between 1 and 3
  let sublevel = getRandomNumberInclusive(1, 3);

  // Store the user ID, current level, current sublevel, next level, and next sublevel in local storage
  localStorage.setItem("userID", userID);
  localStorage.setItem("currentLevel", 1);
  localStorage.setItem("currentSubLevel", sublevel);
  localStorage.setItem("mindgame_next_level", 1);
  localStorage.setItem("mindgame_next_sublevel", sublevel);

  // Redirect to a different page based on the prefix of the user ID
  if (userID.startsWith(HEALTHLY_PREFIX)) {
  window.location = `/mindgame_precheck`;
  } else {
  window.location = `/start_application/athome`;
  }
});

// Prefill the input field with the user ID from local storage when the page loads
prefillInputsWithLocalStorage();
