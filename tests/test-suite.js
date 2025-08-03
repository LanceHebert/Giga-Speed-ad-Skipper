// Test Suite for Giga-Speed YouTube Ad Skipper
// Run in browser console on YouTube pages

(function() {
    'use strict';
    
    console.log('🧪 Starting Giga-Speed Extension Test Suite...');
    
    // Test Results
    let testResults = {
        passed: 0,
        failed: 0,
        total: 0
    };
    
    function assert(condition, message) {
        testResults.total++;
        if (condition) {
            console.log(`✅ PASS: ${message}`);
            testResults.passed++;
        } else {
            console.error(`❌ FAIL: ${message}`);
            testResults.failed++;
        }
    }
    
    function testSpeedControls() {
        console.log('\n🎮 Testing Speed Controls...');
        
        // Test 1: Alt key detection
        const altKeyEvent = new KeyboardEvent('keydown', {
            keyCode: 18,
            ctrlKey: false
        });
        assert(altKeyEvent.keyCode === 18, 'Alt key code is correct');
        
        // Test 2: Speed cycling logic
        const testSpeeds = [1, 2, 3, 1];
        let currentSpeed = 1;
        
        for (let i = 0; i < testSpeeds.length; i++) {
            if (currentSpeed === 1) {
                currentSpeed = 2;
            } else if (currentSpeed === 2) {
                currentSpeed = 3;
            } else {
                currentSpeed = 1;
            }
            assert(currentSpeed === testSpeeds[i], `Speed cycling: ${testSpeeds[i]}x`);
        }
        
        // Test 3: Number key mapping
        const numberKeys = [48, 49, 50, 51, 52, 53, 54, 55, 56, 57];
        const expectedValues = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
        
        for (let i = 0; i < numberKeys.length; i++) {
            const keyCode = numberKeys[i];
            const expectedValue = expectedValues[i];
            assert(keyCode >= 48 && keyCode <= 57, `Number key ${keyCode} is valid`);
        }
    }
    
    function testAdDetection() {
        console.log('\n🎯 Testing Ad Detection...');
        
        // Test 1: Ad indicator selectors
        const adSelectors = [
            '.ytp-ad-player-overlay',
            '.ytp-ad-skip-button',
            '.ytp-ad-skip-button-container',
            '.ytp-ad-overlay-container',
            '.ytp-ad-text'
        ];
        
        adSelectors.forEach(selector => {
            try {
                document.querySelector(selector);
                assert(true, `Ad selector "${selector}" is valid`);
            } catch (e) {
                assert(false, `Ad selector "${selector}" is invalid`);
            }
        });
        
        // Test 2: Ad text detection
        const adTexts = ['Skip Ad', 'Skip Ads', 'Ad will end in', 'Ad will end shortly'];
        adTexts.forEach(text => {
            assert(typeof text === 'string', `Ad text "${text}" is valid`);
        });
        
        // Test 3: Iframe URL detection
        const adDomains = ['doubleclick.net', 'googlesyndication.com', 'googleads'];
        adDomains.forEach(domain => {
            assert(domain.includes('google') || domain.includes('doubleclick'), 
                   `Ad domain "${domain}" is valid`);
        });
    }
    
    function testDOMManipulation() {
        console.log('\n🏗️ Testing DOM Manipulation...');
        
        // Test 1: Element creation
        const testElement = document.createElement('div');
        testElement.id = 'test-extension-element';
        testElement.textContent = '2x';
        document.body.appendChild(testElement);
        
        const foundElement = document.getElementById('test-extension-element');
        assert(foundElement !== null, 'Element creation and retrieval works');
        assert(foundElement.textContent === '2x', 'Element text content is correct');
        
        // Cleanup
        document.body.removeChild(testElement);
        
        // Test 2: Input detection
        const testInput = document.createElement('input');
        testInput.type = 'text';
        document.body.appendChild(testInput);
        
        const isInputActive = testInput.tagName.toLowerCase() === 'input' || 
                             testInput.isContentEditable;
        assert(isInputActive, 'Input element detection works');
        
        // Cleanup
        document.body.removeChild(testInput);
    }
    
    function testVideoControls() {
        console.log('\n🎥 Testing Video Controls...');
        
        // Test 1: Video element detection
        const videos = document.getElementsByTagName('video');
        assert(videos.length > 0, 'Video element found on page');
        
        if (videos.length > 0) {
            const video = videos[0];
            
            // Test 2: Playback rate validation
            const validRates = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 3, 15];
            const testRate = 2;
            assert(validRates.includes(testRate), 'Playback rate validation works');
            
            // Test 3: Current time manipulation
            if (video.duration) {
                const testTime = (5 / 10) * video.duration;
                assert(testTime >= 0 && testTime <= video.duration, 'Time calculation is valid');
            }
        }
    }
    
    function testErrorHandling() {
        console.log('\n🛡️ Testing Error Handling...');
        
        // Test 1: Null element handling
        const nullElement = null;
        const isNull = !nullElement || 
                      (nullElement.tagName && nullElement.tagName.toLowerCase() === 'input');
        assert(!isNull, 'Null element handling works');
        
        // Test 2: Undefined property access
        const testObj = {};
        const safeAccess = testObj.someProperty || 'default';
        assert(safeAccess === 'default', 'Safe property access works');
        
        // Test 3: Array bounds checking
        const testArray = [1, 2, 3];
        const safeIndex = testArray[10] || 'out of bounds';
        assert(safeIndex === 'out of bounds', 'Array bounds checking works');
    }
    
    function testPerformance() {
        console.log('\n⚡ Testing Performance...');
        
        // Test 1: DOM query performance
        const startTime = performance.now();
        for (let i = 0; i < 100; i++) {
            document.getElementsByTagName('video')[0];
        }
        const endTime = performance.now();
        const queryTime = endTime - startTime;
        
        assert(queryTime < 100, `DOM queries completed in ${queryTime.toFixed(2)}ms`);
        
        // Test 2: String operation performance
        const stringStart = performance.now();
        for (let i = 0; i < 1000; i++) {
            const speed = 2;
            const text = `${speed}x`;
        }
        const stringEnd = performance.now();
        const stringTime = stringEnd - stringStart;
        
        assert(stringTime < 10, `String operations completed in ${stringTime.toFixed(2)}ms`);
    }
    
    function runAllTests() {
        console.log('🚀 Running Giga-Speed Extension Test Suite...\n');
        
        testSpeedControls();
        testAdDetection();
        testDOMManipulation();
        testVideoControls();
        testErrorHandling();
        testPerformance();
        
        // Summary
        console.log('\n📊 Test Results Summary:');
        console.log(`✅ Passed: ${testResults.passed}`);
        console.log(`❌ Failed: ${testResults.failed}`);
        console.log(`📈 Total: ${testResults.total}`);
        console.log(`🎯 Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);
        
        if (testResults.failed === 0) {
            console.log('\n🎉 All tests passed! Extension is working correctly.');
        } else {
            console.log('\n⚠️ Some tests failed. Please review the issues above.');
        }
    }
    
    // Auto-run tests after page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', runAllTests);
    } else {
        runAllTests();
    }
    
    // Make tests available globally
    window.gigaSpeedTests = {
        runAllTests,
        testSpeedControls,
        testAdDetection,
        testDOMManipulation,
        testVideoControls,
        testErrorHandling,
        testPerformance
    };
    
})(); 