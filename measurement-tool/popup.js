// Popup script - toggles the control panel on the page

document.addEventListener('DOMContentLoaded', () => {
  // Send message to toggle control panel
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'togglePanel' }, (response) => {
        if (chrome.runtime.lastError) {
          document.body.innerHTML = `
            <h1>Aviation Map Measurement</h1>
            <p style="color: #ffeb3b;">Please refresh the page and try again</p>
          `;
        }
      });
    }
  });

  // Close popup after a short delay
  setTimeout(() => {
    window.close();
  }, 1000);
});
