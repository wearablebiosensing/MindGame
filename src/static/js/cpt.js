console.log("cpt.js loaded")
// CPT Variables
const g_cpt_tutorial = document.getElementById("cpt_tutorial");
const g_cpt_start_btn = document.getElementById("cpt_start");
const g_cpt_container = document.getElementById("cpt_container");
const g_cpt_stimulus = document.getElementById("cpt_stimulus");
const g_cpt_progress = document.getElementById("cpt_progress");
const g_cpt_feedback = document.createElement("div"); // Feedback element for correct/incorrect

// Add feedback element to the DOM
g_cpt_feedback.id = "cpt_feedback";
g_cpt_feedback.style.fontSize = "24px";
g_cpt_feedback.style.fontWeight = "bold";
g_cpt_feedback.style.marginTop = "10px";
g_cpt_feedback.style.color = "Black";
g_cpt_feedback.style.textAlign = "center";
g_cpt_container.appendChild(g_cpt_feedback);

let g_cpt_data = []; // Stores user responses
let g_cpt_timeout_id = null; // Timeout reference for clearing intervals
let g_cpt_stimuli_sequence = []; // Initialize empty sequence to be set later
let g_cpt_current_index = 0;
let g_cpt_start_time = null; // Start time of the current stimulus
let g_cpt_visibility_timeout = null; // Timeout for hiding the stimulus
const CPT_INTERVAL = 1000; // Default interval if not set (used dynamically later)
const STIMULUS_DISPLAY_TIME = 250; // Stimulus visible for 250ms

// Add Event Listener for the Start Button
g_cpt_start_btn.addEventListener("click", () => {
    g_cpt_tutorial.style.display = "none";
    g_cpt_container.style.visibility = "visible";
    g_cpt_stimuli_sequence = generateStimuliSequence(); // Normal mode
    showStimulus(); // Start showing stimuli
});

// Add Event Listener for the "X" key to activate testing mode
document.addEventListener("keyup", (e) => {
    if (e.code === "KeyX") { // Listen for the "X" key
        g_cpt_tutorial.style.display = "none";
        g_cpt_container.style.visibility = "visible";
        g_cpt_stimuli_sequence = generateTestStimuliSequence(); // Testing mode
        showStimulus();
    }
});

// Generate Stimuli Sequence for Testing Mode (36 Trials)
function generateTestStimuliSequence() {
    const targets = Array(30).fill().map(() => randomLetterExcludingX()); // 30 non-X
    const nontargets = Array(6).fill("X"); // 6 X's
    const sequence = shuffleArray([...targets, ...nontargets]);
    return sequence.map((stimulus) => ({
        stimulus,
        isi: [1000, 2000, 4000][Math.floor(Math.random() * 3)] // Random ISI
    }));
}

// Generate Stimuli Sequence for Normal Mode (360 Trials)
function generateStimuliSequence() {
    const targets = Array(324).fill().map(() => randomLetterExcludingX());
    const nontargets = Array(36).fill("X");
    const sequence = shuffleArray([...targets, ...nontargets]);
    return sequence.map((stimulus) => ({
        stimulus,
        isi: [1000, 2000, 4000][Math.floor(Math.random() * 3)] // Random ISI
    }));
}

// Helper to Get Random Letter Excluding X
function randomLetterExcludingX() {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    const filtered = alphabet.filter(letter => letter !== "X");
    return filtered[Math.floor(Math.random() * filtered.length)];
}

// Shuffle Array Utility Function
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Show Stimulus
function showStimulus() {
    if (g_cpt_current_index >= g_cpt_stimuli_sequence.length) {
        cpt_end(); // End task if all stimuli are shown
        return;
    }

    const { stimulus, isi } = g_cpt_stimuli_sequence[g_cpt_current_index];
    g_cpt_stimulus.textContent = stimulus;
    g_cpt_stimulus.dataset.stimulus = stimulus;
    g_cpt_stimulus.style.visibility = "visible"; // Make stimulus visible

    // Record start time for the stimulus
    g_cpt_start_time = Date.now();
    const start_ts = new Date().toISOString(); // Human-readable timestamp

    g_cpt_data.push({
        stimulus, // Letter displayed
        clicked: false, // Default: No response yet
        correct: 0, // Default: Incorrect until a response
        start_ts: start_ts,
        end_ts: null, // To be updated when stimulus changes
        ttc: null, // Time to click (response time)
        isi // Inter-stimulus interval
    });

    g_cpt_progress.textContent = `${g_cpt_current_index + 1}/${g_cpt_stimuli_sequence.length}`;
    g_cpt_current_index++;

    // Hide stimulus after STIMULUS_DISPLAY_TIME
    g_cpt_visibility_timeout = setTimeout(() => {
        g_cpt_stimulus.style.visibility = "hidden";
    }, STIMULUS_DISPLAY_TIME);

    g_cpt_timeout_id = setTimeout(() => {
        const lastEntry = g_cpt_data[g_cpt_data.length - 1];
        if (lastEntry) {
            lastEntry.end_ts = new Date().toISOString(); // End timestamp
            if (lastEntry.stimulus === "X" && !lastEntry.clicked) {
                lastEntry.correct = 1; // Mark ignoring X as correct
            }
        }
        showStimulus(); // Show the next stimulus
    }, isi);
}

// Handle User Response
document.addEventListener("keyup", (e) => {
    if (g_cpt_data.length === 0) return; // No data available yet

    const lastEntry = g_cpt_data[g_cpt_data.length - 1];
    if (!lastEntry || lastEntry.clicked) return; // Ignore if already clicked for this stimulus

    // Calculate response details
    const responseTime = Date.now() - g_cpt_start_time; // Time to click
    const clicked = e.code === "Space"; // Check if the spacebar was pressed
    const isTarget = lastEntry.stimulus !== "X"; // All non-X letters are targets

    // Adjust correctness logic based on the new rules:
    // - Correct: Space pressed for non-X letters or ignored for X.
    // - Incorrect: Space pressed for X or ignored for non-X.
    const correct = (isTarget && clicked) || (!isTarget && !clicked) ? 1 : 0;

    // Update the last entry with response details
    lastEntry.clicked = clicked; // True if space was pressed
    lastEntry.correct = correct; // Correctness based on the adjusted rules
    lastEntry.ttc = clicked ? `${responseTime} ms` : null; // Only set ttc if clicked

    // Hide the stimulus immediately on spacebar press
    g_cpt_stimulus.style.visibility = "hidden";
    clearTimeout(g_cpt_visibility_timeout); // Clear the visibility timeout if user responds

    // Provide visual feedback to the user
    g_cpt_feedback.textContent = clicked
        ? correct
            ? "Correct!"
            : "Incorrect!"
        : ""; // Show feedback if clicked
    g_cpt_feedback.style.color = correct ? "green" : "red";

    // Reset feedback after 500ms
    setTimeout(() => {
        g_cpt_feedback.textContent = ""; // Clear feedback
    }, 500);
});

// End CPT Task
function cpt_end() {
    console.log("CPT Data:", g_cpt_data);
    postCptData();

    // Redirect to the next page after a delay
    setTimeout(() => {
        window.location.href = "/mindgame_precheck";
    }, 1000); // Delay to ensure data submission completes
}

// Submit Data to Backend
function postCptData() {
    const userID = getLocalStorageOrNull("mindgame_userID");
    const location = getLocalStorageOrNull("mindgame_location");
    const watchID = getLocalStorageOrNull("mindgame_watchID");

    // Add error handling if any key is missing
    if (!userID || !location || !watchID) {
        console.error("Required localStorage keys are missing. Data will not be submitted.");
    }      


    fetch("/process-cpt-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            data: g_cpt_data,
            userID,
            location,
            watchID,
            isTest: g_cpt_stimuli_sequence.length === 36 // True for testing mode
        }),
    })
    .then((response) => response.json())
    .then((result) => {
        if (result.success) {
            console.log("CPT data submitted successfully:", result);
        } else {
            console.error("Error submitting CPT data:", result.message);
        }
    })
    .catch((error) => console.error("Fetch error:", error));
}

// Helper Function to Get LocalStorage Value or Null
function getLocalStorageOrNull(key) {
    const value = localStorage.getItem(key);
    return value ? value : null;
}
