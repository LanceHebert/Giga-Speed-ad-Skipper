/*global console */

(function () {
  "use strict";

  var speedup = false,
    KEYCODES = {
      SPACEBAR: 32,
      LEFT: 37,
      UP: 38,
      RIGHT: 39,
      DOWN: 40,
      SPEEDUP: 192,
    },
    SEEK_JUMP_KEYCODE_MAPPINGS = {
      // 0 to 9
      48: 0,
      49: 1,
      50: 2,
      51: 3,
      52: 4,
      53: 5,
      54: 6,
      55: 7,
      56: 8,
      57: 9,
      // 0 to 9 on numpad
      96: 0,
      97: 1,
      98: 2,
      99: 3,
      100: 4,
      101: 5,
      102: 6,
      103: 7,
      104: 8,
      105: 9,
    };

  function inputActive(currentElement) {
    // If on an input or textarea
    if (
      currentElement &&
      (currentElement.tagName.toLowerCase() === "input" ||
        currentElement.tagName.toLowerCase() === "textarea" ||
        currentElement.isContentEditable ||
        currentElement.classList.contains("ytp-chrome-controls") ||
        currentElement.closest(".ytp-chrome-controls"))
    ) {
      return true;
    } else {
      return false;
    }
  }

  // https://stackoverflow.com/questions/6121203/how-to-do-fade-in-and-fade-out-with-javascript-and-css
  function fadeout(element, startOpacity) {
    var op = startOpacity; // initial opacity
    var timer = setInterval(function () {
      if (op <= 0.1) {
        clearInterval(timer);
        element.style.display = "none";
      }
      element.style.opacity = op;
      element.style.filter = "alpha(opacity=" + op * 100 + ")";
      op -= op * 0.1;
    }, 50);
  }

  function displayText(speed, boundingElement) {
    var elementId = "youtube-extension-text-box",
      HTML = '<div id="' + elementId + '">' + speed + "x</div>",
      element = document.getElementById(elementId);

    // If the element doesn't exist, append it to the body
    // must check if it already exists
    if (!element) {
      boundingElement.insertAdjacentHTML("afterbegin", HTML);
      element = document.getElementById(elementId);
    } else {
      element.innerHTML = speed + "x";
    }

    element.style.display = "block";
    element.style.opacity = 0.8;
    element.style.filter = "alpha(opacity=" + 0.8 * 100 + ")";
    setTimeout(function () {
      fadeout(element, 0.8);
    }, 1500);
  }

  function handleSpeedControl(e) {
    var code = e.keyCode,
      ctrlKey = e.ctrlKey,
      video = document.getElementsByTagName("video")[0],
      mediaElement = document.getElementById("movie_player"),
      activeElement = document.activeElement;

    // If no video found, return
    if (!video || !mediaElement) {
      return;
    }

    // If an input/textarea element is active, don't go any further
    if (inputActive(activeElement)) {
      return;
    }

    // Playback speeds
    if (code === KEYCODES.SPEEDUP) {
      speedup = !speedup;

      if (speedup) {
        video.playbackRate = 2;
      } else {
        video.playbackRate = 1;
      }

      // If ctrl is being pressed turn to x3 speed
      if (ctrlKey) {
        video.playbackRate = 3;
        speedup = true;
      }

      displayText(video.playbackRate, mediaElement);
    }

    // If seek key
    if (SEEK_JUMP_KEYCODE_MAPPINGS[code] !== undefined) {
      video.currentTime =
        (SEEK_JUMP_KEYCODE_MAPPINGS[code] / 10) * video.duration;
    }
  }

  // Use both keydown and keyup events for better cross-platform compatibility
  window.addEventListener("keydown", function (e) {
    // Only handle speed control on keydown to prevent multiple triggers
    if (e.keyCode === KEYCODES.SPEEDUP) {
      e.preventDefault();
      handleSpeedControl(e);
    }
  });

  window.addEventListener("keyup", function (e) {
    // Handle seek controls on keyup
    if (SEEK_JUMP_KEYCODE_MAPPINGS[e.keyCode] !== undefined) {
      handleSpeedControl(e);
    }
  });

  // Add focus event listeners to ensure the extension works when window gains focus
  window.addEventListener("focus", function () {
    // Re-initialize if needed when window gains focus
    var video = document.getElementsByTagName("video")[0];
    if (video && speedup) {
      // Maintain current speed state when window regains focus
      video.playbackRate = speedup ? 2 : 1;
    }
  });

  // Also listen for document focus events
  document.addEventListener("focusin", function (e) {
    // If focus moves to an input element, we might need to handle it differently
    if (inputActive(e.target)) {
      // Input is now active, but don't prevent speed controls entirely
      // Just log for debugging
      console.log("Input element focused:", e.target);
    }
  });
})();
