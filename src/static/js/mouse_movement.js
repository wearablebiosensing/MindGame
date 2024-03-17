var prevEvent, currentEvent;

// Mouse event
document.documentElement.onmousemove = function (event) {
  currentEvent = event;
};

// Touch event
document.documentElement.ontouchmove = function (event) {
  currentEvent = event.touches[0]; // Consider the first touch
};

var maxSpeed = 0,
  prevSpeed = 0,
  maxPositiveAcc = 0,
  maxNegativeAcc = 0;

let pMouseX = 0;
let pMouseY = 0;
let pTimestamp = 0;

setInterval(function () {
  if (prevEvent && currentEvent) {
    const x = currentEvent.screenX;
    const y = currentEvent.screenY;
    const prev_x = prevEvent ? prevEvent.screenX : 0;
    const prev_y = prevEvent ? prevEvent.screenY : 0;
    var movementX = Math.abs(x - prev_x);
    var movementY = Math.abs(y - prev_y);
    var movement = Math.sqrt(movementX * movementX + movementY * movementY);

    document.getElementById("mouse_analytics_xpos").innerText = currentEvent.clientX;
    document.getElementById("mouse_analytics_ypos").innerText = currentEvent.clientY;

    const dx = x - prev_x;
    const dy = y - prev_y;

    let currentTime = Date.now();
    const dt = currentTime - pTimestamp;

    // Calculate the acceleration
    const accelerationX = dx / dt;
    const accelerationY = dy / dt;

    const accelerationX_in_px_per_s_squared = accelerationX * 1000;
    const accelerationY_in_px_per_s_squared = accelerationY * 1000;

    pMouseX = x;
    pMouseY = y;
    pTimestamp = currentTime;

    document.getElementById("mouse_analytics_xacc").innerText = Math.round(accelerationX_in_px_per_s_squared);
    document.getElementById("mouse_analytics_yacc").innerText = Math.round(accelerationY_in_px_per_s_squared);
  }

  prevEvent = currentEvent;
}, 50);
