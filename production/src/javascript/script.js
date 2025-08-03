/*global console */
// Version: 1.4.0 - Optimized and Secure
// Giga-Speed YouTube Ad Skipper - Enhanced Edition

(function () {
  "use strict";

  // Configuration
  const CONFIG = {
    DEBUG: false, // Set to false for production
    AD_DETECTION_INTERVAL: 2000, // 2 seconds for regular detection
    AD_DETECTION_INTERVAL_ACTIVE: 500, // 0.5 seconds during ads
    VALID_PLAYBACK_RATES: [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 3, 15],
    AD_SPEED: 15,
    DISPLAY_DURATION: 1500,
    FADE_INTERVAL: 50,
  };

  // State management
  let state = {
    speedup: false,
    previousSpeed: 1,
    adCurrentlyPlaying: false,
    adDetectionInterval: null,
    cachedVideo: null,
    cachedMediaElement: null,
    keyTimeout: null,
    mutationObserver: null,
  };

  // Key mappings
  const KEYCODES = {
    SPACEBAR: 32,
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
    SPEEDUP: 18, // Alt key
  };

  const SEEK_JUMP_KEYCODE_MAPPINGS = {
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

  // Utility functions
  function log(message, ...args) {
    if (CONFIG.DEBUG) {
      console.log(`[Giga-Speed] ${message}`, ...args);
    }
  }

  function getVideo() {
    if (!state.cachedVideo) {
      state.cachedVideo = document.getElementsByTagName("video")[0];
    }
    return state.cachedVideo;
  }

  function getMediaElement() {
    if (!state.cachedMediaElement) {
      state.cachedMediaElement = document.getElementById("movie_player");
    }
    return state.cachedMediaElement;
  }

  function setPlaybackRate(video, rate) {
    if (video && CONFIG.VALID_PLAYBACK_RATES.includes(rate)) {
      video.playbackRate = rate;
      return true;
    }
    return false;
  }

  function inputActive(currentElement) {
    if (!currentElement) return false;

    return (
      currentElement.tagName.toLowerCase() === "input" ||
      currentElement.tagName.toLowerCase() === "textarea" ||
      currentElement.isContentEditable ||
      currentElement.classList.contains("ytp-chrome-controls") ||
      currentElement.closest(".ytp-chrome-controls")
    );
  }

  // Secure DOM manipulation
  function createSpeedDisplay(speed) {
    const elementId = "youtube-extension-text-box";
    const element = document.getElementById(elementId);

    if (!element) {
      const newElement = document.createElement("div");
      newElement.id = elementId;
      newElement.textContent = `${speed}x`; // Secure: use textContent instead of innerHTML
      return newElement;
    } else {
      element.textContent = `${speed}x`; // Secure: use textContent
      return element;
    }
  }

  function fadeout(element, startOpacity) {
    if (!element) return;

    let opacity = startOpacity;
    const timer = setInterval(function () {
      if (opacity <= 0.1) {
        clearInterval(timer);
        element.style.display = "none";
        return;
      }
      element.style.opacity = opacity;
      element.style.filter = `alpha(opacity=${opacity * 100})`;
      opacity -= opacity * 0.1;
    }, CONFIG.FADE_INTERVAL);
  }

  function displayText(speed, boundingElement) {
    if (!boundingElement) return;

    const element = createSpeedDisplay(speed);

    if (!document.getElementById(element.id)) {
      boundingElement.insertAdjacentElement("afterbegin", element);
    }

    element.style.display = "block";
    element.style.opacity = 0.8;
    element.style.filter = "alpha(opacity=80)";

    setTimeout(function () {
      fadeout(element, 0.8);
    }, CONFIG.DISPLAY_DURATION);
  }

  // Optimized ad detection
  function detectAdPlaying() {
    const video = getVideo();
    if (!video) return false;

    // Method 1: Check for ad-related classes (most reliable)
    const adIndicators = [
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

    for (const selector of adIndicators) {
      if (document.querySelector(selector)) {
        log("Ad detected via DOM element:", selector);
        return true;
      }
    }

    // Method 2: Check for specific ad text (more precise)
    const adTexts = [
      "Skip Ad",
      "Skip Ads",
      "Ad will end in",
      "Ad will end shortly",
    ];

    const pageText = document.body.innerText.toLowerCase();
    for (const text of adTexts) {
      if (pageText.includes(text.toLowerCase())) {
        log("Ad detected via text:", text);
        return true;
      }
    }

    // Method 3: Check for ad-specific attributes
    const adElements = document.querySelectorAll(
      "[data-ad-format], [data-ad-slot], .ytp-ad-player-overlay"
    );
    if (adElements.length > 0) {
      log("Ad detected via ad attributes");
      return true;
    }

    // Method 4: Check for ad-related URLs in iframes
    const iframes = document.querySelectorAll("iframe");
    for (const iframe of iframes) {
      const src = iframe.src || "";
      if (
        src.includes("doubleclick.net") ||
        src.includes("googlesyndication.com") ||
        src.includes("googleads")
      ) {
        log("Ad detected via iframe URL:", src);
        return true;
      }
    }

    return false;
  }

  // Debounced event handler
  function debouncedKeyHandler(e) {
    clearTimeout(state.keyTimeout);
    state.keyTimeout = setTimeout(() => handleSpeedControl(e), 50);
  }

  function handleAdSpeed() {
    const video = getVideo();
    if (!video) return;

    const currentlyAdPlaying = detectAdPlaying();

    // Debug logging
    if (currentlyAdPlaying !== state.adCurrentlyPlaying) {
      log("Ad state changed:", {
        currentlyAdPlaying,
        adCurrentlyPlaying: state.adCurrentlyPlaying,
      });
    }

    if (currentlyAdPlaying && !state.adCurrentlyPlaying) {
      // Ad just started - save current speed and set to 15x
      state.previousSpeed = video.playbackRate;
      if (setPlaybackRate(video, CONFIG.AD_SPEED)) {
        state.adCurrentlyPlaying = true;
        displayText(`${CONFIG.AD_SPEED}x (Ad)`, getMediaElement());
        log(
          "Ad detected - speeding up to 15x, previous speed was:",
          state.previousSpeed
        );
      }
    } else if (!currentlyAdPlaying && state.adCurrentlyPlaying) {
      // Ad just ended - restore previous speed
      if (setPlaybackRate(video, state.previousSpeed)) {
        state.adCurrentlyPlaying = false;
        displayText(`${state.previousSpeed}x`, getMediaElement());
        log("Ad ended - restored speed to", state.previousSpeed);
      }
    }
  }

  function handleSpeedControl(e) {
    const code = e.keyCode;
    const video = getVideo();
    const mediaElement = getMediaElement();
    const activeElement = document.activeElement;

    // Validation
    if (!video || !mediaElement) return;
    if (inputActive(activeElement)) return;

    // Playback speeds - cycle through 1x, 2x, 3x
    if (code === KEYCODES.SPEEDUP) {
      const currentSpeed = video.playbackRate;
      let newSpeed = 1;

      // Cycle through speeds: 1x → 2x → 3x → 1x
      // Use Math.round to handle floating-point precision issues
      const roundedSpeed = Math.round(currentSpeed);

      if (roundedSpeed === 1) {
        newSpeed = 2;
        state.previousSpeed = 2;
        state.speedup = true;
      } else if (roundedSpeed === 2) {
        newSpeed = 3;
        state.previousSpeed = 3;
        state.speedup = true;
      } else {
        newSpeed = 1;
        state.previousSpeed = 1;
        state.speedup = false;
      }

      if (setPlaybackRate(video, newSpeed)) {
        displayText(newSpeed, mediaElement);
        log(`Speed changed from ${currentSpeed} to ${newSpeed}`);
      }
    }

    // Seek controls
    if (SEEK_JUMP_KEYCODE_MAPPINGS[code] !== undefined) {
      const seekPosition =
        (SEEK_JUMP_KEYCODE_MAPPINGS[code] / 10) * video.duration;
      if (seekPosition >= 0 && seekPosition <= video.duration) {
        video.currentTime = seekPosition;
      }
    }
  }

  // Event listeners with proper cleanup
  function setupEventListeners() {
    // Key events
    window.addEventListener("keydown", function (e) {
      if (e.keyCode === KEYCODES.SPEEDUP) {
        e.preventDefault();
        debouncedKeyHandler(e);
      }
    });

    window.addEventListener("keyup", function (e) {
      if (SEEK_JUMP_KEYCODE_MAPPINGS[e.keyCode] !== undefined) {
        handleSpeedControl(e);
      }
    });

    // Focus events
    window.addEventListener("focus", function () {
      const video = getVideo();
      if (video && state.speedup) {
        setPlaybackRate(video, state.speedup ? 2 : 1);
      }
    });

    document.addEventListener("focusin", function (e) {
      if (inputActive(e.target)) {
        log("Input element focused:", e.target);
      }
    });

    // Cleanup on page unload
    window.addEventListener("beforeunload", cleanup);
  }

  // Ad detection management
  function startAdDetection() {
    if (state.adDetectionInterval) {
      clearInterval(state.adDetectionInterval);
    }

    const interval = state.adCurrentlyPlaying
      ? CONFIG.AD_DETECTION_INTERVAL_ACTIVE
      : CONFIG.AD_DETECTION_INTERVAL;

    state.adDetectionInterval = setInterval(handleAdSpeed, interval);
    log("Ad detection started with interval:", interval);
  }

  function stopAdDetection() {
    if (state.adDetectionInterval) {
      clearInterval(state.adDetectionInterval);
      state.adDetectionInterval = null;
    }
    log("Ad detection stopped");
  }

  // Cleanup function
  function cleanup() {
    stopAdDetection();
    if (state.mutationObserver) {
      state.mutationObserver.disconnect();
      state.mutationObserver = null;
    }
    if (state.keyTimeout) {
      clearTimeout(state.keyTimeout);
      state.keyTimeout = null;
    }
    // Clear cached elements
    state.cachedVideo = null;
    state.cachedMediaElement = null;
  }

  // Navigation detection
  function setupNavigationDetection() {
    let lastUrl = location.href;
    state.mutationObserver = new MutationObserver(function () {
      const url = location.href;
      if (url !== lastUrl) {
        lastUrl = url;
        // Clear cache on navigation
        state.cachedVideo = null;
        state.cachedMediaElement = null;
        setTimeout(startAdDetection, 1000);
      }
    });

    state.mutationObserver.observe(document, {
      subtree: true,
      childList: true,
    });
  }

  // Initialization
  function initialize() {
    log("Initializing Giga-Speed YouTube Ad Skipper v1.4.0");

    setupEventListeners();
    setupNavigationDetection();
    startAdDetection();

    log("Extension initialized successfully");
  }

  // Start the extension
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize);
  } else {
    initialize();
  }

  // Expose for testing (development only)
  if (CONFIG.DEBUG) {
    window.gigaSpeedExtension = {
      state,
      CONFIG,
      detectAdPlaying,
      handleSpeedControl,
      cleanup,
    };
  }
})();
