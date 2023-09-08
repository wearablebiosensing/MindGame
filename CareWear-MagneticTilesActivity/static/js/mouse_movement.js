var prevEvent, currentEvent;
document.documentElement.onmousemove = function (event) {
  currentEvent = event;
};

var maxSpeed = 0,
  prevSpeed = 0,
  maxPositiveAcc = 0,
  maxNegativeAcc = 0;

// Define variables to store previous mouse position and timestamp
let pMouseX = 0;
let pMouseY = 0;
let pTimestamp = 0;

setInterval(function () {
  if (prevEvent && currentEvent) {
    const x = currentEvent.screenX;
    const y = currentEvent.screenY;
    const prev_x = prevEvent.screenX;
    const prev_y = prevEvent.screenY;
    var movementX = Math.abs(x - prev_x);
    var movementY = Math.abs(y - prev_y);
    var movement = Math.sqrt(movementX * movementX + movementY * movementY);

    document.getElementById("mouse_analytics_xpos").innerText =
      currentEvent.clientX;
    document.getElementById("mouse_analytics_ypos").innerText =
      currentEvent.clientY;

    //speed=movement/100ms= movement/0.1s= 10*movement/s
    var speed = 10 * movement; //current speed

    // document.getElementById("speed").innerText = Math.round(speed);
    // document.getElementById("maxSpeed").innerText = Math.round(
    //   speed > maxSpeed ? (maxSpeed = speed) : maxSpeed
    // );

    var acceleration = 10 * (speed - prevSpeed);

    // Calculate the change in position and time
    const dx = x - prev_x;
    const dy = y - prev_y;

    let currentTime = Date.now();
    const dt = currentTime - pTimestamp;

    // Calculate the acceleration
    const accelerationX = dx / dt;
    const accelerationY = dy / dt;

    const accelerationX_in_px_per_s_squared = accelerationX * 1000;
    const accelerationY_in_px_per_s_squared = accelerationY * 1000;

    // Store the current mouse position and timestamp for the next iteration
    pMouseX = x;
    pMouseY = y;
    pTimestamp = currentTime;

    document.getElementById("mouse_analytics_xacc").innerText = Math.round(
      accelerationX_in_px_per_s_squared
    );
    document.getElementById("mouse_analytics_yacc").innerText = Math.round(
      accelerationY_in_px_per_s_squared
    );

    // if (acceleration > 0) {
    //   document.getElementById("maxPositiveAcceleration").innerText = Math.round(
    //     acceleration > maxPositiveAcc
    //       ? (maxPositiveAcc = acceleration)
    //       : maxPositiveAcc
    //   );
    // } else {
    //   document.getElementById("maxNegativeAcceleration").innerText = Math.round(
    //     acceleration < maxNegativeAcc
    //       ? (maxNegativeAcc = acceleration)
    //       : maxNegativeAcc
    //   );
    // }
  }

  prevEvent = currentEvent;
  prevSpeed = speed;
}, 100);
