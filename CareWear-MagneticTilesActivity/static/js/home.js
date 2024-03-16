/*
    This file contatins needed functions for the landing/home page of the MindGame Application
    Event liseners and use of these functions can be found in the "landing_page.html"


    Table Of Contents:

        - Section 0) Global Variables
        - Section 1) Check the status of the Samsung MQTT Watch Application 
        - Section 2) Handle Input validation for Watch and UserID inputs
        - Section 3) Other Useful Helper Functions
        - Section 4) Event Listeners / Starting the Application
*/

/*
  =======================================================================
  ==================   Section 0 - Globals   ===================
  =======================================================================
*/

// Inputs
const g_userID_input = document.getElementById("identifier");

//Starting Buttions
const g_inlab_btn = document.getElementById("in_lab_btn");
const g_athome_btn = document.getElementById("at_home_btn");

/*
  =======================================================================
  ================= Section 3 - Useful Helper Functions   ===============
  =======================================================================
*/

function getLocalStorageOrNull(key) {
  try {
    const value = localStorage.getItem(key);
    return value !== null ? value : null;
  } catch (error) {
    console.error("Error retrieving from local storage:", error);
    return null;
  }
}

//Auto fills if already present
function prefillInputsWithLocalStorage() {
  const userID = getLocalStorageOrNull("userID");
  g_userID_input.value = userID;
}

/*
  =======================================================================
  =================   Section 4 - Event Listeners  / App Start  =====================
  =======================================================================
*/

g_inlab_btn.addEventListener("click", async () => {
  if (!g_userID_input.value.match(/\S/)) {
    alert("Identifier is empty");
    return;
  }

  window.location = `/start_application/inlab`;
});

g_athome_btn.addEventListener("click", async () => {
  if (!g_userID_input.value.match(/\S/)) {
    alert("Identifier is empty");
    return;
  }

  window.location = `/start_application/athome`;
});

prefillInputsWithLocalStorage();
