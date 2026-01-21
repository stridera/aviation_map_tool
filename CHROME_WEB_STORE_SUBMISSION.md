# Chrome Web Store Submission Guide

## Permission Justifications

When submitting to the Chrome Web Store, you'll need to provide justifications for the permissions your extension requests.

### 1. activeTab Permission

**Requested:** `"activeTab"`

**Justification:**
```
The Aviation Map Measurement Tool requires the activeTab permission to inject a measurement overlay onto maps, charts, and PDF documents that users are currently viewing. This permission allows the extension to:

1. Add an interactive canvas overlay for drawing measurement lines
2. Display measurement results (headings and distances) on top of the user's map
3. Respond to user clicks for placing measurement points

This is a core feature of the extension - users click the extension icon to activate measurements on their current tab. The activeTab permission is the minimal permission needed for this functionality and only grants access when the user explicitly clicks the extension icon.
```

### 2. Content Scripts on All URLs

**Requested:** Content scripts with matches: `["file:///*", "http://*/*", "https://*/*"]`

**Justification:**
```
The extension needs to inject content scripts on all URLs to support measuring any type of map or chart, including:

1. Aviation sectional charts (PDFs or images)
2. Nautical charts from various websites
3. Topographic maps
4. Local PDF files (file:/// protocol)
5. Web-based mapping applications

The extension does not collect, transmit, or store any user data. It only:
- Creates a visual overlay canvas for measurements
- Performs mathematical calculations (heading angles, distances) locally in the browser
- Responds to user clicks for placing measurement points

Users in aviation, maritime navigation, and outdoor recreation need to measure on maps from diverse sources, which is why broad URL matching is required. The extension is purely a visual measurement tool with no data collection or network access.
```

### 3. all_frames: true

**Requested:** `"all_frames": true` in content_scripts

**Justification:**
```
The all_frames permission is needed to support measuring maps that are embedded in iframes, which is common for:

1. Web-based chart viewers that use iframe embedding
2. PDF viewers embedded in web pages
3. Interactive mapping applications using iframe architecture

This ensures the measurement overlay works consistently across different chart hosting methods.
```

## Additional Submission Requirements

### Privacy Policy

Your extension should include a privacy policy. Here's a suggested statement:

```markdown
# Privacy Policy for Aviation Map Measurement Tool

Last updated: January 21, 2026

## Data Collection
The Aviation Map Measurement Tool does NOT collect, store, or transmit any user data. All measurements and calculations are performed locally in your browser.

## Permissions
- **activeTab**: Required to display measurement overlays on the maps you're viewing
- **Content Scripts**: Required to work with maps from any website or local PDF files

## Data Storage
The extension does not use chrome.storage or any persistent storage. All calibration data and measurements exist only during your current browser session and are cleared when you close the tab.

## Third-Party Services
The extension does not communicate with any external servers or third-party services. All functionality is completely local.

## Contact
For questions about this privacy policy, please open an issue at:
https://github.com/stridera/aviation_map_tool/issues
```

### Store Listing Information

**Single Purpose Description:**
"Measure headings and distances on aviation charts, nautical maps, and any image with a scale bar"

**Detailed Description:**
Use the content from your README.md, highlighting:
- Measurement capabilities (true/magnetic headings, distances)
- Calibration features (north, scale, magnetic variance)
- Use cases (aviation, maritime, hiking, etc.)
- No data collection

**Category:**
"Productivity" or "Developer Tools"

**Screenshots Required:**
- At least 1 screenshot showing the extension in action (you already have measure_tool.png)
- Recommended: 3-5 screenshots showing different features

## Host Permissions (Currently Removed)

~~**Previous:** `"host_permissions": ["<all_urls>"]`~~

**Status:** ✅ REMOVED - Not needed since the extension doesn't make network requests.

Content script matches are sufficient for injecting the overlay without requesting additional host permissions.

## Pre-Submission Checklist

- [ ] Remove unused `storage` permission ✅ (Done)
- [ ] Remove unnecessary `host_permissions` ⚠️ (Recommended)
- [ ] Test extension thoroughly on various map types
- [ ] Prepare 3-5 screenshots for store listing
- [ ] Write privacy policy (see above)
- [ ] Review manifest.json for any sensitive permissions
- [ ] Ensure all icons are high quality (16x16, 48x48, 128x128)
- [ ] Write detailed store description
- [ ] Set up developer account ($5 one-time fee)

## Sensitive Permissions Review

Your extension requests broad content script access, which Chrome Web Store will scrutinize. Make sure to:

1. **Clearly explain WHY** all_urls access is needed (any map from any source)
2. **Emphasize privacy** - no data collection, no network requests
3. **Show screenshots** demonstrating legitimate use cases
4. **Provide source code link** - your GitHub repo adds credibility

## Common Rejection Reasons to Avoid

❌ Overly broad permissions without justification
❌ Vague permission justifications
❌ Missing privacy policy
❌ Poor quality icons or screenshots
❌ Requesting permissions not actually used

✅ Your extension is well-positioned because:
- It has a clear, specific purpose (measurement tool)
- No data collection or network access
- Broad URL access is justified (maps from any source)
- Open source on GitHub
- Professional UI and documentation

## Submission Process

1. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Pay $5 one-time registration fee (if not already registered)
3. Click "New Item"
4. Upload your `measurement-tool` folder as a ZIP file
5. Fill in store listing details
6. Provide permission justifications when prompted
7. Submit for review (typically 1-3 business days)

## Post-Submission

After approval:
- Monitor reviews and respond to user feedback
- Fix any reported bugs promptly
- Update version number in manifest.json for each release
- Keep your GitHub repo updated
