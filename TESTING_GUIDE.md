# Testing Guide - Giga-Speed YouTube Ad Skipper

## 🧪 **How to Test the Extension**

### **Quick Test Setup**

1. **Load the extension** in Chrome (`chrome://extensions/`)
2. **Go to YouTube** and play any video
3. **Open Developer Tools** (F12) and go to Console tab
4. **Run the test suite** by pasting the test code

### **Running the Test Suite**

Copy and paste this into the browser console on YouTube:

```javascript
// Load the test suite
fetch('https://raw.githubusercontent.com/LanceHebert/Giga-Speed-ad-Skipper/windows-compatibility-fix/tests/test-suite.js')
  .then(response => response.text())
  .then(code => {
    eval(code);
  })
  .catch(() => {
    console.log('Test suite loaded from local file');
  });
```

Or manually run individual tests:

```javascript
// Test speed controls
window.gigaSpeedTests.testSpeedControls();

// Test ad detection
window.gigaSpeedTests.testAdDetection();

// Test DOM manipulation
window.gigaSpeedTests.testDOMManipulation();
```

## 🎯 **Manual Testing Checklist**

### **Speed Controls Testing**
- [ ] **Alt key cycling**: Press Alt → 1x → 2x → 3x → 1x
- [ ] **Speed indicator**: Shows current speed on screen
- [ ] **Number keys**: Press 0-9 to jump to video positions
- [ ] **Input focus**: Speed controls disabled when typing in search box

### **Ad Detection Testing**
- [ ] **Ad detection**: Automatically speeds up to 15x when ad starts
- [ ] **Speed restoration**: Returns to previous speed when ad ends
- [ ] **Ad indicator**: Shows "15x (Ad)" during ads
- [ ] **False positive prevention**: Doesn't trigger on regular videos

### **Cross-Platform Testing**
- [ ] **Windows**: Works with window not maximized
- [ ] **Mac**: Works with window focus changes
- [ ] **Linux**: Works with different window managers
- [ ] **Different browsers**: Chrome, Edge, Firefox

### **Performance Testing**
- [ ] **Memory usage**: No memory leaks over time
- [ ] **CPU usage**: Low CPU usage during normal operation
- [ ] **Responsiveness**: No lag when pressing keys
- [ ] **Page load**: Doesn't slow down YouTube page load

## 🔍 **Security Testing**

### **XSS Prevention**
```javascript
// Test XSS prevention
const maliciousSpeed = '<script>alert("XSS")</script>';
// The extension should safely handle this
```

### **Input Validation**
```javascript
// Test invalid playback rates
video.playbackRate = 999; // Should be rejected
video.playbackRate = -1;  // Should be rejected
```

### **DOM Safety**
```javascript
// Test null element handling
const nullElement = null;
// Extension should handle gracefully
```

## 📊 **Performance Benchmarks**

### **Expected Performance**
- **DOM Queries**: < 100ms for 100 queries
- **String Operations**: < 10ms for 1000 operations
- **Memory Usage**: Stable over 1 hour of use
- **CPU Usage**: < 5% during normal operation

### **Load Testing**
```javascript
// Simulate heavy usage
for (let i = 0; i < 1000; i++) {
  // Simulate key presses
  const event = new KeyboardEvent('keydown', { keyCode: 18 });
  window.dispatchEvent(event);
}
```

## 🐛 **Common Issues & Debugging**

### **Extension Not Working**
1. Check if extension is enabled in `chrome://extensions/`
2. Reload the extension (refresh icon)
3. Check console for error messages
4. Verify you're on a YouTube page

### **Speed Controls Not Responding**
1. Check if focus is on an input field
2. Verify Alt key is working (try in text editor)
3. Check console for JavaScript errors
4. Try refreshing the page

### **Ad Detection Issues**
1. Check if ads are actually playing
2. Look for ad detection logs in console
3. Verify ad detection selectors are still valid
4. Test with different types of ads

### **Performance Issues**
1. Check memory usage in Task Manager
2. Monitor CPU usage during operation
3. Look for memory leaks in DevTools
4. Test with different video lengths

## 🚀 **Advanced Testing**

### **Automated Testing**
```javascript
// Run automated test suite
function runAutomatedTests() {
  const tests = [
    testSpeedControls,
    testAdDetection,
    testDOMManipulation,
    testVideoControls,
    testErrorHandling,
    testPerformance
  ];
  
  tests.forEach(test => {
    try {
      test();
      console.log(`✅ ${test.name} passed`);
    } catch (error) {
      console.error(`❌ ${test.name} failed:`, error);
    }
  });
}
```

### **Stress Testing**
```javascript
// Stress test the extension
function stressTest() {
  let iterations = 0;
  const maxIterations = 1000;
  
  const interval = setInterval(() => {
    // Simulate user interactions
    const event = new KeyboardEvent('keydown', { keyCode: 18 });
    window.dispatchEvent(event);
    
    iterations++;
    if (iterations >= maxIterations) {
      clearInterval(interval);
      console.log('Stress test completed');
    }
  }, 10);
}
```

## 📈 **Test Results Template**

```
Test Date: ___________
Extension Version: ___________
Browser: ___________
OS: ___________

✅ PASSED TESTS:
- Speed controls working
- Ad detection functional
- Cross-platform compatibility
- Performance acceptable

❌ FAILED TESTS:
- [Describe any failures]

📊 PERFORMANCE METRICS:
- Memory Usage: ___ MB
- CPU Usage: ___ %
- Load Time: ___ ms
- Response Time: ___ ms

🐛 BUGS FOUND:
- [List any bugs discovered]

💡 IMPROVEMENTS SUGGESTED:
- [List any improvements]
```

## 🎯 **Quality Assurance Checklist**

- [ ] All manual tests pass
- [ ] Automated test suite passes
- [ ] Performance benchmarks met
- [ ] Security tests pass
- [ ] Cross-platform compatibility verified
- [ ] No console errors
- [ ] No memory leaks
- [ ] User experience is smooth
- [ ] Documentation is complete
- [ ] Code review completed 