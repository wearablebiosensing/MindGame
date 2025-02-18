import { updateRandomLevelSelectionWithoutRepeats } from "./helper_functions.js";

// Global Constants
const userID = getLocalStorageOrNull("userID");
const level = getLocalStorageOrNull("currentLevel");

// Update localStorage so that the next level is randomly selected
const nextLevelBtn = document.getElementById("next_level");
nextLevelBtn.addEventListener("click", () => {
  const { randomLevel, randomSubLevel } = updateRandomLevelSelectionWithoutRepeats();
  localStorage.setItem("currentLevel", randomLevel); // Update to new random level
  localStorage.setItem("currentSubLevel", randomSubLevel); // Update to new random sublevel
  window.location.href = "/tiles_game"; // Navigate to tiles game page
});

// Fetch and load graph data from the server
function loadImage(url, container) {
  const loadingElement = container.querySelector(".loading");
  const errorElement = container.querySelector(".error");
  const imageElement = container.querySelector(".image");

  // Start with loading
  loadingElement.style.display = "block";

  fetch(url)
    .then((response) => {
      if (!response.ok) {
        // Error
        loadingElement.style.display = "none";
        errorElement.style.display = "block";

        throw new Error("Network response was not ok");
      }
      return response.blob();
    })
    .then((blob) => {
      // Success
      loadingElement.style.display = "none";
      errorElement.style.display = "none";
      imageElement.style.display = "block";

      const imageURL = URL.createObjectURL(blob);
      imageElement.src = imageURL;
    })
    .catch((error) => {
      // Error
      loadingElement.style.display = "none";
      errorElement.style.display = "block";
      console.error("Error loading image:", error);
    });
}
