# Development Guide

## Testing the Extension

### Chrome/Chromium Browsers

1. **Open Chrome Extensions Page**
   - Navigate to `chrome://extensions/`
   - Or go to Chrome menu → More tools → Extensions

2. **Enable Developer Mode**
   - Toggle the "Developer mode" switch in the top right corner

3. **Load the Extension**
   - Click "Load unpacked"
   - Select the project directory: `/Users/lancehebert/Coding/Giga-Speed-ad-Skipper`
   - Click "Select Folder"

4. **Test the Extension**
   - Go to [YouTube](https://youtube.com)
   - Play any video
   - Press the backtick key (`) to toggle between normal and 2x speed
   - Press Ctrl + ` for 3x speed
   - Press number keys (0-9) to jump to different parts of the video

### Firefox

1. **Open Firefox Extensions Page**
   - Navigate to `about:debugging`
   - Click "This Firefox" tab

2. **Load the Extension**
   - Click "Load Temporary Add-on"
   - Select the `manifest.json` file from the project directory

3. **Test the Extension**
   - Same testing steps as Chrome

### Edge

1. **Open Edge Extensions Page**
   - Navigate to `edge://extensions/`
   - Toggle "Developer mode"

2. **Load the Extension**
   - Click "Load unpacked"
   - Select the project directory

## Development Workflow

### Making Changes

1. **Edit the code** in `src/javascript/script.js`
2. **Reload the extension**:
   - Go to `chrome://extensions/`
   - Click the refresh icon on your extension
3. **Test the changes** on YouTube

### Debugging

- **Console Logs**: Open browser dev tools (F12) to see console output
- **Extension Errors**: Check the extension page for any error messages
- **Network Issues**: Use the Network tab in dev tools to debug any API calls

### Common Issues

- **Extension not working**: Make sure you're on a YouTube page
- **Key not responding**: Check if focus is on an input field
- **Speed not changing**: Verify the video element exists on the page

## File Structure

```
Giga-Speed-ad-Skipper/
├── manifest.json          # Extension configuration
├── src/
│   ├── javascript/
│   │   └── script.js      # Main extension logic
│   ├── css/
│   │   └── styles.css     # Extension styles
│   └── images/            # Extension icons
└── README.md
```

## Testing Checklist

- [ ] Extension loads without errors
- [ ] Speed toggle works (backtick key)
- [ ] 3x speed works (Ctrl + backtick)
- [ ] Seek controls work (number keys)
- [ ] Works on different YouTube pages (home, watch, search)
- [ ] Works with different video types (regular videos, live streams)
- [ ] No conflicts with YouTube's native controls 