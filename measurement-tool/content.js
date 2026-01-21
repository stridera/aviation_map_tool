// Content script for Aviation Map Measurement Tool
// Manages the floating control panel and overlay

(function() {
  'use strict';

  // Prevent multiple injections
  if (window.measurementToolInjected) {
    console.log('Measurement tool already injected');
    return;
  }
  window.measurementToolInjected = true;

  console.log('Aviation Map Measurement Tool: Content script loaded');

  // Initialize overlay and control panel
  let overlay = null;
  let controlPanel = null;

  function initOverlay() {
    if (!overlay) {
      overlay = window.measurementOverlay;
      if (overlay) {
        overlay.init();
        console.log('Overlay initialized');
      } else {
        console.error('Overlay class not found');
      }
    }
    return overlay;
  }

  function initControlPanel() {
    if (!controlPanel && overlay) {
      if (window.ControlPanel) {
        controlPanel = new window.ControlPanel(overlay);
        console.log('Control panel initialized');
      } else {
        console.error('ControlPanel class not found');
      }
    }
    return controlPanel;
  }

  /**
   * Handle messages from popup/extension icon
   */
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Content script received message:', message);

    // Initialize if needed
    if (!overlay) {
      overlay = initOverlay();
    }
    if (!controlPanel) {
      controlPanel = initControlPanel();
    }

    if (message.action === 'togglePanel') {
      if (controlPanel) {
        const visible = controlPanel.toggle();
        if (visible && overlay) {
          overlay.show();
        }
        sendResponse({ status: 'success', visible: visible });
      } else {
        sendResponse({ status: 'error', message: 'Control panel not initialized' });
      }
      return true;
    }

    sendResponse({ status: 'success' });
    return true;
  });

  // Ready to initialize on any page
  console.log('Aviation Map Measurement Tool: Content script initialized and ready');
})();
