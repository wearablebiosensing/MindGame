const g_tutorial = document.getElementById("nogo_tutorial");
const g_start_btn = document.getElementById("nogo_start");
const g_nogo_container = document.getElementById("nogo_container");
const g_nogo_shape = document.getElementById("nogo_shape");
const g_nogo_spinner = document.getElementById("nogo_spinner");
const MAX_SHAPES_SHOWN = 5; //Standard 240
const MAX_TIME = 1000; //ms
const TIME_BETWEEN_SHAPES = 2400; //ms
let g_times_shape_shown = 0;
let g_start_ts = null;
let g_end_ts = null;
let g_nogo_data = [];
let g_timeout_id = null;

//Prevention for space bar in rapid sucession
let g_action_debounce_id = null; // New debounce timer
const ACTION_DEBOUNCE_TIME = 500; // Debounce time in ms
let canPreformAction = true;

g_start_btn.addEventListener("click", nogo_start);

function handleKey(e) {
  if (e.code === "Space" && canPreformAction) {
    nogo_handle_action();
    spacePressed = true;
  }
}

function nogo_start() {
  g_tutorial.style.display = "none";
  g_nogo_container.style.visibility = "visible";

  nogo_show_shape();

  //User has perfomed action
  // g_nogo_container.addEventListener("click", nogo_handle_click);
  document.addEventListener("keyup", (e) => handleKey(e));
}

function nogo_end() {
  console.log(g_nogo_data);
  g_nogo_shape.removeAttribute("class");
  nogo_post_data();
}

function getLocalStorageOrNull(key) {
  try {
    const value = localStorage.getItem(key);
    return value !== null ? value : null;
  } catch (error) {
    console.error("Error retrieving from local storage:", error);
    return null;
  }
}

function nogo_post_data() {
  g_nogo_spinner.style.display = "block";

  //Add in loading circle untill response
  fetch("/process-nogo-data", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      data: g_nogo_data,
      userID: getLocalStorageOrNull("userID"),
    }),
  }).finally(() => {
    window.location.href = "/";
  });
}

function nogo_add_data(shape, wasClicked, correct) {
  const ttcMilliseconds = g_end_ts.getTime() - g_start_ts.getTime();
  g_nogo_data.push({
    type: shape,
    clicked: wasClicked,
    correct: correct,
    start_ts: getTimestamp(g_start_ts),
    end_ts: getTimestamp(g_end_ts),
    ttc: formatTimeDifference(ttcMilliseconds),
  });
}

/**
 * Gets the current shape of the exercise
 * @returns {string} - "square" or "circle"
 */
function nogo_get_current_shape() {
  if (g_nogo_shape.classList.contains("nogo_square")) {
    return "square";
  }

  if (g_nogo_shape.classList.contains("nogo_circle")) {
    return "circle";
  }
}

//Called when the user clicks durring the exercise
function nogo_handle_action() {
  if (!canPerformAction) return;

  clearTimeout(g_timeout_id); //Stop timeout function from being called
  g_end_ts = new Date();

  //Add data
  const shape = nogo_get_current_shape();
  if (shape == "square") {
    nogo_add_data(shape, true, 1); //Action on square
  }
  if (shape == "circle") {
    nogo_add_data(shape, true, 0); //Action on Circle
  }

  // Remove click listener to prevent double registration
  // g_nogo_container.removeEventListener("click", nogo_handle_action);

  canPreformAction = false;
  nogo_show_shape(); //Go again
}

//Called when user does nothing
function nogo_handle_timeout() {
  g_end_ts = new Date();

  //Add data
  const shape = nogo_get_current_shape();
  if (shape == "square") {
    nogo_add_data(shape, false, 0); //No action on Square
  }
  if (shape == "circle") {
    nogo_add_data(shape, false, 1); // No action on Circle
  }

  nogo_show_shape();
}

function nogo_show_shape() {
  //Check if at the end of the exercise
  if (g_times_shape_shown >= MAX_SHAPES_SHOWN) {
    nogo_end();
    return;
  }
  g_times_shape_shown += 1;

  g_nogo_shape.removeAttribute("class");

  canPreformAction = false;

  //delay between each shape being displayed
  setTimeout(() => {
    nogo_set_rand_shape();

    g_start_ts = new Date();
    canPreformAction = true;

    // Reattach the click listener
    // g_nogo_container.addEventListener("click", nogo_handle_click);

    //Start countdown till timeout
    g_timeout_id = setTimeout(nogo_handle_timeout, MAX_TIME);
  }, TIME_BETWEEN_SHAPES);
}

/**
 * Randomly Sets the current shape on the screen
 * @returns {void}
 */
function nogo_set_rand_shape() {
  let oneOrZero = Math.random() >= 0.5 ? 1 : 0;
  if (oneOrZero == 1) g_nogo_shape.classList.add("nogo_square");
  if (oneOrZero == 0) g_nogo_shape.classList.add("nogo_circle");
}

function getTimestamp(currentDate) {
  // Create a new Date object
  //   const currentDate = new Date();

  // Get the individual components of the current timestamp
  const hours = currentDate.getHours().toString().padStart(2, "0");
  const minutes = currentDate.getMinutes().toString().padStart(2, "0");
  const seconds = currentDate.getSeconds().toString().padStart(2, "0");
  const milliseconds = currentDate
    .getMilliseconds()
    .toString()
    .padStart(3, "0");

  // Format the timestamp
  const formattedTimestamp = `${hours}:${minutes}:${seconds}:${milliseconds}`;

  return formattedTimestamp;
}

function formatTimeDifference(milliseconds) {
  let totalSeconds = Math.floor(milliseconds / 1000);
  let hours = Math.floor(totalSeconds / 3600);
  totalSeconds %= 3600;
  let minutes = Math.floor(totalSeconds / 60);
  let seconds = totalSeconds % 60;
  let millisecondsLeft = milliseconds % 1000;

  // Format each component to ensure two digits for hours, minutes, and seconds, and three digits for milliseconds
  hours = hours.toString().padStart(2, "0");
  minutes = minutes.toString().padStart(2, "0");
  seconds = seconds.toString().padStart(2, "0");
  millisecondsLeft = millisecondsLeft.toString().padStart(3, "0");

  return `${hours}:${minutes}:${seconds}:${millisecondsLeft}`;
}
