/*global console */
// Version: 1.3.1 - Fixed ad detection naming conflicts

(function () {
  "use strict";

  var speedup = false,
    previousSpeed = 1,
    adCurrentlyPlaying = false,
    adDetectionInterval = null,
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

  // Ad detection functions
  function detectAdPlaying() {
    var video = document.getElementsByTagName("video")[0];
    if (!video) return false;

    // Method 1: Check for ad-related classes (most reliable)
    var adIndicators = [
      ".ytp-ad-player-overlay",
      ".ytp-ad-skip-button",
      ".ytp-ad-skip-button-container",
      ".ytp-ad-overlay-container",
      ".ytp-ad-text",
      ".ytp-ad-feedback-dialog-container",
      ".ytp-ad-skip-button-modest",
      ".ytp-ad-skip-button-slot",
      ".ytp-ad-skip-button-text",
      ".ytp-ad-skip-button-icon",
    ];

    for (var i = 0; i < adIndicators.length; i++) {
      if (document.querySelector(adIndicators[i])) {
        console.log("Ad detected via DOM element:", adIndicators[i]);
        return true;
      }
    }

    // Method 2: Check for specific ad text (more precise)
    var adTexts = [
      "Skip Ad",
      "Skip Ads",
      "Ad will end in",
      "Ad will end shortly",
    ];

    var pageText = document.body.innerText.toLowerCase();
    for (var j = 0; j < adTexts.length; j++) {
      if (pageText.includes(adTexts[j].toLowerCase())) {
        console.log("Ad detected via text:", adTexts[j]);
        return true;
      }
    }

    // Method 3: Check for ad-specific attributes (most reliable)
    var adElements = document.querySelectorAll(
      "[data-ad-format], [data-ad-slot], .ytp-ad-player-overlay"
    );
    if (adElements.length > 0) {
      console.log("Ad detected via ad attributes");
      return true;
    }

    // Method 4: Check for ad-related URLs in iframes
    var iframes = document.querySelectorAll("iframe");
    for (var k = 0; k < iframes.length; k++) {
      var src = iframes[k].src || "";
      if (
        src.includes("doubleclick.net") ||
        src.includes("googlesyndication.com") ||
        src.includes("googleads")
      ) {
        console.log("Ad detected via iframe URL:", src);
        return true;
      }
    }

    return false;
  }

  function handleAdSpeed() {
    var video = document.getElementsByTagName("video")[0];
    if (!video) return;

    var currentlyAdPlaying = detectAdPlaying();

    // Debug logging
    if (currentlyAdPlaying !== adCurrentlyPlaying) {
      console.log(
        "Ad state changed - currentlyAdPlaying:",
        currentlyAdPlaying,
        "adCurrentlyPlaying:",
        adCurrentlyPlaying
      );
    }

    if (currentlyAdPlaying && !adCurrentlyPlaying) {
      // Ad just started - save current speed and set to 15x
      previousSpeed = video.playbackRate;
      video.playbackRate = 15;
      adCurrentlyPlaying = true;
      displayText("15x (Ad)", document.getElementById("movie_player"));
      console.log(
        "Ad detected - speeding up to 15x, previous speed was:",
        previousSpeed
      );
    } else if (!currentlyAdPlaying && adCurrentlyPlaying) {
      // Ad just ended - restore previous speed
      video.playbackRate = previousSpeed;
      adCurrentlyPlaying = false;
      displayText(previousSpeed + "x", document.getElementById("movie_player"));
      console.log("Ad ended - restored speed to " + previousSpeed + "x");
    }
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
        previousSpeed = 2;
      } else {
        video.playbackRate = 1;
        previousSpeed = 1;
      }

      // If ctrl is being pressed turn to x3 speed
      if (ctrlKey) {
        video.playbackRate = 3;
        previousSpeed = 3;
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

  // Start ad detection monitoring
  function startAdDetection() {
    if (adDetectionInterval) {
      clearInterval(adDetectionInterval);
    }

    adDetectionInterval = setInterval(function () {
      handleAdSpeed();
    }, 1000); // Check every second

    console.log("Ad detection started");
  }

  // Stop ad detection monitoring
  function stopAdDetection() {
    if (adDetectionInterval) {
      clearInterval(adDetectionInterval);
      adDetectionInterval = null;
    }
    console.log("Ad detection stopped");
  }

  // Initialize ad detection when page loads
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startAdDetection);
  } else {
    startAdDetection();
  }

  // Also start detection when navigating to new videos
  var lastUrl = location.href;
  new MutationObserver(function () {
    var url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      setTimeout(startAdDetection, 1000); // Wait a bit for page to load
    }
  }).observe(document, { subtree: true, childList: true });
})();
