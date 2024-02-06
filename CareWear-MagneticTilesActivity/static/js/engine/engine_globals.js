//====================================
//          Canvas Settings
//====================================

/**
 * @type {HTMLElement}
 */
const canvas = document.getElementById("canvas");

/** @type {CanvasRenderingContext2D} */
const ctx = canvas.getContext("2d");

/**
 * @type {HTMLElement}
 */
const container = document.getElementById("container");

// canvas.width = container.clientWidth + 450;
// canvas.height = container.clientHeight + 450;

canvas.width = window.innerWidth + 420;
canvas.height = window.innerHeight + 420;

//Used for creating the levels of the game realtive to the center
let LEVEL_X = canvas.width / 2;
let LEVEL_Y = canvas.height / 2;

//Used in the mouse move event listener
//When the progress bar is 100% then we know the level is done so we send the data
//The problem is when the user keeps moving the mouse the data is sent more than once
//This variable prevents that
let isDataSentAlready = false;

//====================================
//          Global Variables
//====================================

//Shape Stuff
let shapes = [];
let current_shape_index = null;
let closest_shape_to_current = null;

// Time When User hit the Start Button for the level
const user_start_timestamp = Date.now();

//Level Data
let current_level = 1;
let current_sub_level = 1;

//Text to show when wrong shape
/**
 * @type {HTMLElement}
 */
const shapeFeedbackText = document.querySelector(".shapeFeedbackText");

//Progress Bar
const progressBar = document.getElementById("progressBar");
const progressBarPercent = document.getElementById("progress-bar-percent");

//Mouse Data
let mouse_motion_array = [];
let lastCollectionTime = 0;
const throttlingInterval = 150; // 150 milliseconds

//  -> Mouse Acceleration
//      -> Define variables to store previous mouse position and timestamp
let prevMouseX = 0;
let prevMouseY = 0;
let prevTimestamp = 0;
