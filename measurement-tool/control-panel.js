// Floating control panel for Aviation Map Measurement Tool

class ControlPanel {
  constructor(overlay) {
    this.overlay = overlay;
    this.panel = null;
    this.visible = false;
    this.scaleModal = null;

    // Drag state
    this.isDragging = false;
    this.dragOffsetX = 0;
    this.dragOffsetY = 0;
  }

  /**
   * Create and show the control panel
   */
  show() {
    if (this.panel) {
      this.panel.style.display = 'block';
      this.visible = true;
      return;
    }

    // Create panel container
    this.panel = document.createElement('div');
    this.panel.id = 'measurement-control-panel';
    this.panel.innerHTML = `
      <div class="panel-header">
        <h1>Aviation Map Measurement</h1>
        <button id="panel-close" class="close-btn" title="Close panel">×</button>
      </div>

      <div class="status-section">
        <div id="panel-status-message" class="status-message">Extension ready</div>
        <div class="calibration-status">
          <div class="calibration-item">
            <span class="calibration-label">North:</span>
            <span id="panel-north-status" class="status-value calibrated">Default (up)</span>
          </div>
          <div class="calibration-item">
            <span class="calibration-label">Scale:</span>
            <span id="panel-scale-status" class="status-value">Not calibrated</span>
          </div>
          <div class="calibration-item">
            <span class="calibration-label">Variance:</span>
            <span id="panel-variance-status" class="status-value">Not set</span>
          </div>
        </div>
      </div>

      <div class="section">
        <h2>Calibration</h2>
        <button id="panel-calibrate-north" class="btn btn-calibrate">
          <span class="btn-icon">🧭</span>
          Calibrate North
        </button>
        <button id="panel-calibrate-scale" class="btn btn-calibrate">
          <span class="btn-icon">📏</span>
          Calibrate Scale
        </button>
        <div class="variance-calibration">
          <span class="variance-label">🧲 Mag Variance:</span>
          <input type="number"
                 id="panel-variance-value"
                 class="variance-input-inline"
                 placeholder="0"
                 step="0.5"
                 min="-180"
                 max="180"
                 title="Enter signed degrees: + for East, - for West">
        </div>
      </div>

      <div class="section">
        <h2>Measurement</h2>
        <button id="panel-measure" class="btn btn-measure">
          <span class="btn-icon">📏</span>
          Measure
        </button>
      </div>

      <div class="section">
        <h2>Actions</h2>
        <button id="panel-clear-all" class="btn btn-danger">
          <span class="btn-icon">🗑️</span>
          Clear Measurements
        </button>
        <button id="panel-reset-calibrations" class="btn btn-secondary">
          <span class="btn-icon">🔄</span>
          Reset Calibrations
        </button>
        <div style="font-size: 11px; color: #666; text-align: center; margin-top: 4px;">
          Press <strong>Escape</strong> to exit mode or clear measurements
        </div>
      </div>
    `;

    document.body.appendChild(this.panel);

    // Create scale modal
    this.createScaleModal();

    // Add event listeners
    this.attachEventListeners();

    // Update status
    this.updateStatus();

    this.visible = true;
  }

  /**
   * Hide the control panel
   */
  hide() {
    if (this.panel) {
      this.panel.style.display = 'none';
    }
    if (this.scaleModal) {
      this.scaleModal.style.display = 'none';
    }
    this.visible = false;
  }

  /**
   * Toggle panel visibility
   */
  toggle() {
    if (this.visible) {
      this.hide();
    } else {
      this.show();
    }
    return this.visible;
  }

  /**
   * Create scale modal
   */
  createScaleModal() {
    this.scaleModal = document.createElement('div');
    this.scaleModal.id = 'panel-scale-modal';
    this.scaleModal.className = 'modal';
    this.scaleModal.style.display = 'none';
    this.scaleModal.innerHTML = `
      <div class="modal-content">
        <h3>Enter Scale Distance</h3>
        <p>Enter the distance in nautical miles that the line represents:</p>
        <input type="number" id="panel-scale-input" placeholder="e.g., 10" step="0.1" min="0.1">
        <div class="modal-buttons">
          <button id="panel-scale-submit" class="btn btn-primary">Submit</button>
          <button id="panel-scale-cancel" class="btn btn-secondary">Cancel</button>
        </div>
      </div>
    `;
    document.body.appendChild(this.scaleModal);
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Drag functionality for panel header
    const panelHeader = this.panel.querySelector('.panel-header');

    panelHeader.addEventListener('mousedown', (e) => {
      // Don't drag if clicking the close button
      if (e.target.id === 'panel-close' || e.target.closest('#panel-close')) {
        return;
      }

      this.isDragging = true;
      const rect = this.panel.getBoundingClientRect();
      this.dragOffsetX = e.clientX - rect.left;
      this.dragOffsetY = e.clientY - rect.top;

      panelHeader.style.cursor = 'grabbing';
      e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;

      const x = e.clientX - this.dragOffsetX;
      const y = e.clientY - this.dragOffsetY;

      // Keep panel within viewport bounds
      const maxX = window.innerWidth - this.panel.offsetWidth;
      const maxY = window.innerHeight - this.panel.offsetHeight;

      const boundedX = Math.max(0, Math.min(x, maxX));
      const boundedY = Math.max(0, Math.min(y, maxY));

      this.panel.style.left = boundedX + 'px';
      this.panel.style.top = boundedY + 'px';
      this.panel.style.right = 'auto'; // Remove right positioning
    });

    document.addEventListener('mouseup', () => {
      if (this.isDragging) {
        this.isDragging = false;
        const panelHeader = this.panel.querySelector('.panel-header');
        panelHeader.style.cursor = 'grab';
      }
    });

    // Close button
    document.getElementById('panel-close').addEventListener('click', () => {
      this.hide();
    });

    // Calibration buttons
    document.getElementById('panel-calibrate-north').addEventListener('click', () => {
      this.overlay.setMode('calibrate-north');
      this.updateStatus();
    });

    document.getElementById('panel-calibrate-scale').addEventListener('click', () => {
      this.overlay.setMode('calibrate-scale');
      this.updateStatus();
    });

    // Measurement button
    document.getElementById('panel-measure').addEventListener('click', () => {
      this.overlay.setMode('measure');
      this.updateStatus();
    });

    // Action buttons
    document.getElementById('panel-clear-all').addEventListener('click', () => {
      this.overlay.clearAll();
      this.updateStatus();
    });

    document.getElementById('panel-reset-calibrations').addEventListener('click', () => {
      if (confirm('Reset all calibrations (North, Scale, Variance)?')) {
        this.overlay.resetCalibrations();

        // Clear variance input field
        document.getElementById('panel-variance-value').value = '';

        this.updateStatus();
      }
    });

    // Magnetic variance controls - auto-apply on change
    const applyVariance = () => {
      const valueInput = document.getElementById('panel-variance-value');
      const value = parseFloat(valueInput.value);

      // If empty or 0, clear variance
      if (isNaN(value) || value === 0 || valueInput.value === '') {
        this.overlay.clearMagneticVariance();
        this.updateStatus();
        return;
      }

      // Validate range
      if (value < -180 || value > 180) {
        alert('Please enter a variance between -180 and +180 degrees');
        valueInput.value = '';
        this.overlay.clearMagneticVariance();
        this.updateStatus();
        return;
      }

      // Apply variance (already signed)
      this.overlay.setMagneticVariance(value);
      this.updateStatus();
    };

    document.getElementById('panel-variance-value').addEventListener('input', applyVariance);

    // Scale modal buttons
    document.getElementById('panel-scale-submit').addEventListener('click', () => {
      const input = document.getElementById('panel-scale-input');
      const value = parseFloat(input.value);
      if (value > 0) {
        this.overlay.setScaleDistance(value);
        this.scaleModal.style.display = 'none';
        input.value = '';
        this.updateStatus();
      } else {
        alert('Please enter a valid distance greater than 0');
      }
    });

    document.getElementById('panel-scale-cancel').addEventListener('click', () => {
      this.scaleModal.style.display = 'none';
      document.getElementById('panel-scale-input').value = '';
      this.overlay.cancelScale();
      this.updateStatus();
    });

    // Enter key in scale input
    document.getElementById('panel-scale-input').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        document.getElementById('panel-scale-submit').click();
      }
    });

    // Listen for scale distance request from overlay
    window.addEventListener('requestScaleDistance', () => {
      this.scaleModal.style.display = 'flex';
      document.getElementById('panel-scale-input').focus();
    });

    // Listen for calibration updates
    window.addEventListener('calibrationUpdate', () => {
      this.updateStatus();
    });
  }

  /**
   * Update panel status
   */
  updateStatus() {
    if (!this.panel || !this.visible) return;

    const status = this.overlay.getStatus();
    const statusMessage = document.getElementById('panel-status-message');
    const northStatus = document.getElementById('panel-north-status');
    const scaleStatus = document.getElementById('panel-scale-status');
    const measureBtn = document.getElementById('panel-measure');
    const calibrateNorthBtn = document.getElementById('panel-calibrate-north');
    const calibrateScaleBtn = document.getElementById('panel-calibrate-scale');

    // Update status message
    statusMessage.textContent = this.getStatusMessage(status);

    // Update north status
    if (status.northCustomCalibrated) {
      northStatus.textContent = 'Custom ✓';
      northStatus.className = 'status-value calibrated';
    } else if (status.northCalibrated) {
      northStatus.textContent = 'Default (up)';
      northStatus.className = 'status-value calibrated';
    } else {
      northStatus.textContent = 'Not calibrated';
      northStatus.className = 'status-value';
    }

    // Update scale status
    if (status.scaleCalibrated) {
      scaleStatus.textContent = 'Calibrated ✓';
      scaleStatus.className = 'status-value calibrated';
    } else {
      scaleStatus.textContent = 'Not calibrated';
      scaleStatus.className = 'status-value';
    }

    // Update variance status (show absolute value with E/W direction)
    const varianceStatus = document.getElementById('panel-variance-status');
    if (status.magneticVarianceSet) {
      const absValue = Math.abs(status.magneticVariance);
      const direction = status.magneticVariance >= 0 ? 'E' : 'W';
      varianceStatus.textContent = `${absValue}° ${direction} ✓`;
      varianceStatus.className = 'status-value calibrated';
    } else {
      varianceStatus.textContent = 'Not set';
      varianceStatus.className = 'status-value';
    }

    // Update active button state
    [calibrateNorthBtn, calibrateScaleBtn, measureBtn].forEach(btn => {
      btn.classList.remove('active');
    });

    if (status.mode === 'calibrate-north') {
      calibrateNorthBtn.classList.add('active');
    } else if (status.mode === 'calibrate-scale') {
      calibrateScaleBtn.classList.add('active');
    } else if (status.mode === 'measure') {
      measureBtn.classList.add('active');
    }
  }

  /**
   * Get status message based on current mode
   */
  getStatusMessage(status) {
    const mode = status.mode;

    switch (mode) {
      case 'calibrate-north':
        return this.overlay.tempPoint ? 'Click north indicator' : 'Click compass rose center';
      case 'calibrate-scale':
        return this.overlay.tempPoint ? 'Click end of scale bar' : 'Click start of scale bar';
      case 'measure':
        return this.overlay.tempPoint ? 'Click second point' : 'Click first point';
      default:
        return 'Click Measure to start';
    }
  }

  /**
   * Remove panel from DOM
   */
  destroy() {
    if (this.panel) {
      this.panel.remove();
      this.panel = null;
    }
    if (this.scaleModal) {
      this.scaleModal.remove();
      this.scaleModal = null;
    }
    this.visible = false;
  }
}

// Export for use in content script
if (typeof window !== 'undefined') {
  window.ControlPanel = ControlPanel;
}
