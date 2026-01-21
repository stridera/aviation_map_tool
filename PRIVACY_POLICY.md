# Privacy Policy for Aviation Map Measurement Tool

**Last updated:** January 21, 2026

## Overview

The Aviation Map Measurement Tool is a Chrome extension designed to help users measure headings and distances on maps, charts, and images. This privacy policy explains our data practices.

## Data Collection

**We do NOT collect, store, or transmit any user data.**

All measurements and calculations are performed entirely locally in your browser. Nothing leaves your computer.

## What the Extension Does

The extension:
- Creates a visual overlay canvas on maps you're viewing
- Performs mathematical calculations (angles, distances) locally in your browser
- Responds to your clicks for placing measurement points
- Temporarily stores calibration data (north orientation, scale, magnetic variance) in browser memory during your session

## What the Extension Does NOT Do

The extension does NOT:
- Collect any personal information
- Track your browsing history
- Send data to external servers
- Use cookies or persistent storage
- Access your files without your explicit action
- Share data with third parties

## Permissions Explained

### activeTab Permission
**Why we need it:** To display measurement overlays on the maps you're currently viewing.

**What it allows:** When you click the extension icon, it can interact with the active tab to draw measurement lines and display results.

**What it does NOT allow:** Access to other tabs, browsing history, or any tabs you haven't explicitly activated the extension on.

### Content Scripts on All URLs
**Why we need it:** To work with maps from any source - aviation charts, nautical maps, PDF files, topographic maps, etc.

**What it allows:** The extension can add its measurement overlay to any webpage or PDF you open.

**What it does NOT do:** The extension only activates when you click the extension icon. It doesn't automatically collect or monitor anything. It's purely a visual tool.

## Data Storage

The extension does NOT use:
- `chrome.storage` (no persistent storage)
- Cookies
- LocalStorage
- IndexedDB
- Any form of data persistence

All calibration data (north orientation, scale bar, magnetic variance) exists only in browser memory during your current session and is automatically cleared when you close the tab or browser.

## Third-Party Services

The extension does NOT:
- Communicate with any external servers
- Use analytics services
- Include advertising
- Connect to third-party APIs

All functionality is 100% local to your browser.

## Open Source

The complete source code is available on GitHub at:
https://github.com/stridera/aviation_map_tool

You can verify that the extension does exactly what we claim and nothing more.

## Changes to This Policy

If we make changes to this privacy policy, we will update the "Last updated" date at the top of this document and push updates to the GitHub repository.

## Contact

If you have questions about this privacy policy or the extension, please:
- Open an issue on GitHub: https://github.com/stridera/aviation_map_tool/issues
- Email: strider@stridera.com

## Compliance

This extension complies with:
- Chrome Web Store policies
- General Data Protection Regulation (GDPR)
- California Consumer Privacy Act (CCPA)

Since we collect no data, there is no data to request, delete, or export.

## Your Rights

Since we don't collect any data about you:
- There is no data to access
- There is no data to delete
- There is no data to export
- There is no data to correct

The extension is a purely local tool that performs calculations in your browser without any data collection whatsoever.
