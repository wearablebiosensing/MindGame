/*
    This file contatins needed functions for the landing/home page of the MindGame Application
    Event liseners and use of these functions can be found in the "landing_page.html"
*/

/*
  =======================================================================
  ==================   Section 0 - Globals   ===================
  =======================================================================
*/
// Setup Initial local storage if first time on site
let shouldInitialSetup = getLocalStorageOrNull("mindgame_inital_setup");
if (shouldInitialSetup == null) {
  localStorage.setItem("mindgame_inital_setup", true);
  localStorage.setItem(LOCALSTORAGE_CURR_LEVEL, 1);
  localStorage.setItem(LOCALSTORAGE_CURR_SUBLEVEL, 1);
  localStorage.setItem(LOCALSTORAGE_NEXT_LEVEL, 1);
  localStorage.setItem(LOCALSTORAGE_NEXT_SUBLEVEL, 1);
  localStorage.setItem(LOCALSTORAGE_PROGRESS, MINDGAME_PROGRESS_ENUM.HOME);
}

// Inputs
const g_userID_input = document.getElementById("identifier");

//Navagation Buttions
const g_inlab_btn = document.getElementById("in_lab_btn");
const g_athome_btn = document.getElementById("at_home_btn");
const g_navigation_btn_container = document.getElementById("navigation_buttons");

// Restore User Progress back
const g_restore_btn = document.getElementById("restore_btn");
const g_restore_btn_container = document.getElementById("restore_btn_container");

/*
  =======================================================================
  ================= Section 3 - Useful Helper Functions   ===============
  =======================================================================
*/

//Auto fills if already present
function prefillInputsWithLocalStorage() {
  const userID = getLocalStorageOrNull(LOCALSTORAGE_USERID);
  g_userID_input.value = userID;
}

let Show = (element) => (element.style.display = "block");
let Hide = (element) => (element.style.display = "none");
let SetText = (element, txt) => (element.innerHTML = txt);
let SetDst = (element, dst) => element.addEventListener("click", () => (window.location.href = dst));

function handleHomeProgressStatus(status) {
  // Handle which group of buttons to show on home page
  if (status == MINDGAME_PROGRESS_ENUM.HOME) {
    Show(g_navigation_btn_container);
    Hide(g_restore_btn_container);
    return; // Dont need top update restore button info
  } else {
    Hide(g_navigation_btn_container);
    Show(g_restore_btn_container);
  }

  // Update Restore Button info depending on the progress
  if (status == MINDGAME_PROGRESS_ENUM.NOGO) {
    SetText(g_restore_btn, "Restore: NoGo");
    SetDst(g_restore_btn, MINDGAME_ROUTE_ENUM.NOGO);
  }
  if (status == MINDGAME_PROGRESS_ENUM.PRECHECK) {
    let next_level = Number(getLocalStorage(LOCALSTORAGE_NEXT_LEVEL, 1));
    let next_sub = Number(getLocalStorage(LOCALSTORAGE_NEXT_SUBLEVEL, 1));
    SetText(g_restore_btn, `Restore: Level ${next_level}-${next_sub}`);
    SetDst(g_restore_btn, MINDGAME_ROUTE_ENUM.PRECHECK);
  }
}

/*
  =======================================================================
  =================   Section 4 - Event Listeners  / App Start  =====================
  =======================================================================
*/

// User ID prefixes that are allowed
const HEALTHLY_PREFIX = "N";
const OTHER_PREFIX = "P";

// Regular expression for user ID validation
const userIDPattern = /^[NP]\d+$/;

g_inlab_btn.addEventListener("click", async () => {
  const userID = g_userID_input.value;

  if (!userID.match(/\S/)) {
    alert("Identifier is empty");
    return;
  }

  // Check if userID matches the required pattern
  if (!userIDPattern.test(userID)) {
    alert("Identifier must be either N or P followed by numbers.");
    return;
  }

  // let sublevel = getRandomNumberInclusive(1, 3);
  localStorage.setItem(LOCALSTORAGE_USERID, userID);
  // localStorage.setItem("currentLevel", 1);
  // localStorage.setItem("currentSubLevel", sublevel);
  // localStorage.setItem("mindgame_next_level", 1);
  // localStorage.setItem("mindgame_next_sublevel", sublevel);

  if (userID.startsWith(HEALTHLY_PREFIX)) {
    window.location = `/nogo`;
  } else {
    window.location = `/start_application/inlab`;
  }
});

g_athome_btn.addEventListener("click", async () => {
  const userID = g_userID_input.value;

  if (!userID.match(/\S/)) {
    alert("Identifier is empty");
    return;
  }

  // Check if userID matches the required pattern
  if (!userIDPattern.test(userID)) {
    alert("Identifier must be either N or P followed by numbers.");
    return;
  }

  // let sublevel = getRandomNumberInclusive(1, 3);
  localStorage.setItem(LOCALSTORAGE_USERID, userID);
  // localStorage.setItem("currentLevel", 1);
  // localStorage.setItem("currentSubLevel", sublevel);
  // localStorage.setItem("mindgame_next_level", 1);
  // localStorage.setItem("mindgame_next_sublevel", sublevel);

  if (userID.startsWith(HEALTHLY_PREFIX)) {
    window.location = `/mindgame_precheck`;
  } else {
    window.location = `/start_application/athome`;
  }
});

document.getElementById("reset_ls_btn").addEventListener("click", () => {
  localStorage.setItem(LOCALSTORAGE_CURR_LEVEL, 1);
  localStorage.setItem(LOCALSTORAGE_CURR_SUBLEVEL, 1);
  localStorage.setItem(LOCALSTORAGE_NEXT_LEVEL, 1);
  localStorage.setItem(LOCALSTORAGE_NEXT_SUBLEVEL, 1);
  localStorage.setItem(LOCALSTORAGE_PROGRESS, MINDGAME_PROGRESS_ENUM.HOME);
  window.location.reload();
});

// Fills UserID input with localstorage value if it exists
prefillInputsWithLocalStorage();

// Update the homepage based on the progress of the user
const current_mindgame_status = getLocalStorageOrNull(LOCALSTORAGE_PROGRESS) == null ? MINDGAME_PROGRESS_ENUM.HOME : getLocalStorageOrNull(LOCALSTORAGE_PROGRESS);
handleHomeProgressStatus(current_mindgame_status);
