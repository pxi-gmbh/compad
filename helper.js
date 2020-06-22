// UNIVERSAL HELPER SCRIPTS

// accessibility helper for elements (other than <buttons>) used as toggle buttons
// call from within HTML-element with onclick="toggleButtonClick()" and onkeypress="toggleButtonKeyPress()"
// don't forget to add role="button" and aria-pressed="false" and tabindex="0" to the element
// also add an aria-label and describe what the button does so that it is accessible by keyboards and screen readers
//
// function to apply changes to element onclick (call in HTML)
function toggleButtonClick() {
  toggleButton(event.target);
}
// function to apply changes to element onkeypress (call in HTML)
function toggleButtonKeyPress() {
  // Check to see if space or enter were pressed
  if (event.key === " " || event.key === "Enter" || event.key === "Spacebar") { // "Spacebar" for IE11 support
    // Prevent the default action to stop scrolling when space is pressed
    event.preventDefault();
    // initiate a click on the element, triggering the function that fires onclick
    event.target.click();
  }
}
// function that is called on either click or onkeypress
function toggleButton() {
  // Check to see if the button is pressed
  var unpressed = (event.target.getAttribute("aria-pressed") === "false");
  // We can add more functionality to this script here. Toggling the aria-pressed attribute for now.
  if(unpressed) {
    // Change aria-pressed to the opposite state
    event.target.setAttribute("aria-pressed", "true");
  } else {
    // Change aria-pressed to the opposite state
    event.target.setAttribute("aria-pressed", "false");
  }
}
