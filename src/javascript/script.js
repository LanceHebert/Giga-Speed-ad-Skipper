(function () {
    "use strict";

    var speedup = false,
        originalPlaybackRate = 1, // To store the playback speed before an ad starts
        KEYCODES = {
            "SPACEBAR": 32,
            "LEFT": 37,
            "UP": 38,
            "RIGHT": 39,
            "DOWN": 40,
            "SPEEDUP": 18 // Now using Alt (keycode 18) for speed toggle
        },
        SEEK_JUMP_KEYCODE_MAPPINGS = {
            // 0 to 9
            "48": 0,
            "49": 1,
            "50": 2,
            "51": 3,
            "52": 4,
            "53": 5,
            "54": 6,
            "55": 7,
            "56": 8,
            "57": 9,
            // 0 to 9 on numpad
            "96": 0,
            "97": 1,
            "98": 2,
            "99": 3,
            "100": 4,
            "101": 5,
            "102": 6,
            "103": 7,
            "104": 8,
            "105": 9
        };

    function inputActive(currentElement) {
        return ["input", "textarea"].includes(currentElement.tagName.toLowerCase()) || currentElement.isContentEditable;
    }

    function fadeout(element, startOpacity) {
        var op = startOpacity;
        var timer = setInterval(function () {
            if (op <= 0.1) {
                clearInterval(timer);
                element.style.display = 'none';
            }
            element.style.opacity = op;
            element.style.filter = 'alpha(opacity=' + op * 100 + ")";
            op -= op * 0.1;
        }, 50);
    }

    function displayText(speed, boundingElement) {
        var elementId = "youtube-extension-text-box",
            HTML = '<div id="' + elementId + '">' + speed + 'x</div>',
            element = document.getElementById(elementId);

        if (!element) {
            boundingElement.insertAdjacentHTML('afterbegin', HTML);
            element = document.getElementById(elementId);
        } else {
            element.innerHTML = speed + "x";
        }

        element.style.display = 'block';
        element.style.opacity = 0.8;
        element.style.filter = 'alpha(opacity=' + (0.8 * 100) + ")";
        setTimeout(function () {
            fadeout(element, 0.8);
        }, 1500);
    }

    function handleAdSpeed(video, mediaElement) {
        var player = document.getElementById("movie_player");

        // Monitor for ad-related class changes
        setInterval(() => {
            if (player && player.classList.contains("ad-showing")) {
                // Ad detected
                originalPlaybackRate = video.playbackRate || 1; // Default to 1x if undefined
                video.playbackRate = 15; // Automatically set ad speed to 15x
                displayText("15x (Ad)", mediaElement);
                console.log("Ad detected, speed set to 15x");
            } else {
                // Ad ended, restore original speed
                video.playbackRate = originalPlaybackRate; // Restore original speed
                displayText(originalPlaybackRate + "x", mediaElement);
                console.log("Ad ended, speed restored to " + originalPlaybackRate + "x");
            }
        }, 500); // Check every 5 seconds
    }

    window.onkeyup = function (e) {
        var code = e.keyCode,
            ctrlKey = e.ctrlKey,
            video = document.getElementsByTagName("video")[0],
            mediaElement = document.getElementById("movie_player"),
            mediaElementChildren = mediaElement.getElementsByTagName("*"),
            activeElement = document.activeElement,
            i;

        if (inputActive(activeElement)) {
            return;
        }

        if (code === KEYCODES.SPEEDUP) {
            var player = document.getElementById("movie_player");

            // Check if an ad is showing
            if (player && player.classList.contains("ad-showing")) {
                // Keep speed at 15x during the ad
                video.playbackRate = 15;
            } else {
                // Toggle speed between 1x, 2x, and 3x
                if (video.playbackRate === 1) {
                    video.playbackRate = 2;
                } else if (video.playbackRate === 2) {
                    video.playbackRate = 3;
                } else {
                    video.playbackRate = 1;
                }
            }

            displayText(video.playbackRate, mediaElement);
        }

        for (i = 0; i < mediaElementChildren.length; i++) {
            if (mediaElementChildren[i] === activeElement) {
                return;
            }
        }

        if (mediaElement === activeElement) {
            return;
        }

        if (SEEK_JUMP_KEYCODE_MAPPINGS[code] !== undefined) {
            video.currentTime = (SEEK_JUMP_KEYCODE_MAPPINGS[code] / 10) * video.duration;
        }
    };

    // Initialize the ad speed handler
    document.addEventListener("DOMContentLoaded", function () {
        var video = document.getElementsByTagName("video")[0];
        var mediaElement = document.getElementById("movie_player");
        if (video && mediaElement) {
            handleAdSpeed(video, mediaElement);
        }
    });

}());
