// Overlay module for Aviation Map Measurement Tool
// Handles canvas creation, drawing, and click handling

class MeasurementOverlay {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.visible = false;
    this.currentMode = null;
    this.measurements = [];
    this.measurementCounter = 0;
    this.tempPoint = null; // Temporary point for two-click measurements
    this.labels = []; // Array to store label DOM elements

    // Calibration data
    this.northOffset = 0;
    this.northCalibrated = true; // Default to true with north = up
    this.northCustomCalibrated = false; // Track if user has custom calibrated
    this.scalePixels = 0;
    this.scaleNM = 0;
    this.scaleCalibrated = false;

    // Magnetic variance data
    this.magneticVariance = 0; // Positive=East, Negative=West
    this.magneticVarianceSet = false;

    // Calibration points for display
    this.northCalibrationLine = null;
    this.scaleCalibrationLine = null;
  }

  /**
   * Initialize the overlay canvas
   */
  init() {
    if (this.canvas) {
      return; // Already initialized
    }

    // Create canvas element
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'measurement-overlay';
    this.canvas.style.position = 'fixed';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.zIndex = '999999';
    this.canvas.style.pointerEvents = 'none'; // Start with pointer events disabled
    this.canvas.style.cursor = 'default';

    // Set canvas size to window size
    this.resize();

    // Get 2D context
    this.ctx = this.canvas.getContext('2d');

    // Add canvas to document
    document.body.appendChild(this.canvas);

    // Add event listeners
    this.canvas.addEventListener('click', this.handleClick.bind(this));
    window.addEventListener('resize', this.resize.bind(this));
    window.addEventListener('scroll', this.redraw.bind(this));
    document.addEventListener('keydown', this.handleKeyDown.bind(this));

    this.visible = true;
    console.log('Measurement overlay initialized');
  }

  /**
   * Resize canvas to match window
   */
  resize() {
    if (!this.canvas) return;

    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.redraw();
  }

  /**
   * Toggle overlay visibility
   */
  toggle() {
    this.visible = !this.visible;
    if (this.canvas) {
      this.canvas.style.display = this.visible ? 'block' : 'none';

      // Also toggle label visibility
      this.labels.forEach(label => {
        label.style.display = this.visible ? 'block' : 'none';
      });
    }
    return this.visible;
  }

  /**
   * Show overlay
   */
  show() {
    this.visible = true;
    if (this.canvas) {
      this.canvas.style.display = 'block';
      this.labels.forEach(label => {
        label.style.display = 'block';
      });
    }
  }

  /**
   * Hide overlay
   */
  hide() {
    this.visible = false;
    if (this.canvas) {
      this.canvas.style.display = 'none';
      this.labels.forEach(label => {
        label.style.display = 'none';
      });
    }
  }

  /**
   * Set measurement mode
   */
  setMode(mode) {
    this.currentMode = mode;
    this.tempPoint = null; // Reset temp point when changing modes

    // Show overlay when setting a mode (in case it was hidden by Escape)
    if (mode) {
      this.show();
      // Enable pointer events when in a mode
      if (this.canvas) {
        this.canvas.style.pointerEvents = 'all';
        this.canvas.style.cursor = 'crosshair';
      }
    } else {
      // Disable pointer events when not in a mode (let clicks pass through)
      if (this.canvas) {
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.cursor = 'default';
      }
    }

    this.redraw();
  }

  /**
   * Handle canvas click
   */
  handleClick(event) {
    if (!this.currentMode) return;

    const point = {
      x: event.clientX,
      y: event.clientY
    };

    switch (this.currentMode) {
      case 'calibrate-north':
        this.handleNorthCalibration(point);
        break;
      case 'calibrate-scale':
        this.handleScaleCalibration(point);
        break;
      case 'measure':
        this.handleMeasurement(point);
        break;
    }
  }

  /**
   * Handle keyboard events
   */
  handleKeyDown(event) {
    if (event.key === 'Escape') {
      // If in a mode, exit the mode first (allows interaction with page)
      if (this.currentMode) {
        this.setMode(null);
        console.log('Mode cancelled - page interaction enabled');
        window.dispatchEvent(new CustomEvent('calibrationUpdate'));
      } else {
        // If not in a mode, clear all measurements and reset
        this.clearAll();
        console.log('All measurements cleared');
        window.dispatchEvent(new CustomEvent('calibrationUpdate'));
      }
    }
  }

  /**
   * Handle north calibration clicks
   */
  handleNorthCalibration(point) {
    if (!this.tempPoint) {
      // First click - center of compass rose
      this.tempPoint = point;
      this.redraw();
      console.log('North calibration: center point set', point);
    } else {
      // Second click - north indicator
      const center = this.tempPoint;
      this.northOffset = calculateNorthOffset(center, point);
      this.northCalibrated = true;
      this.northCustomCalibrated = true;
      this.northCalibrationLine = { point1: center, point2: point };
      this.tempPoint = null;

      // Recalculate all existing measurements with new north offset
      this.recalculateMeasurements();

      this.redraw();
      console.log('North calibrated:', this.northOffset, 'degrees');

      // Notify content script
      window.dispatchEvent(new CustomEvent('calibrationUpdate'));
    }
  }

  /**
   * Handle scale calibration clicks
   */
  handleScaleCalibration(point) {
    if (!this.tempPoint) {
      // First click - start of scale bar
      this.tempPoint = point;
      this.redraw();
      console.log('Scale calibration: start point set', point);
    } else {
      // Second click - end of scale bar
      const point1 = this.tempPoint;
      this.scalePixels = calculatePixelDistance(point1, point);
      this.scaleCalibrationLine = { point1: point1, point2: point };
      this.tempPoint = null;
      this.redraw();
      console.log('Scale calibration: awaiting distance input, pixels=', this.scalePixels);

      // Request distance from control panel
      window.dispatchEvent(new CustomEvent('requestScaleDistance'));
    }
  }

  /**
   * Set scale distance (called from popup after user input)
   */
  setScaleDistance(distance) {
    this.scaleNM = distance;
    this.scaleCalibrated = true;
    console.log('Scale calibrated:', this.scaleNM, 'NM =', this.scalePixels, 'pixels');

    // Recalculate all existing measurements to add distance
    this.recalculateMeasurements();
    this.redraw();

    // Notify content script
    window.dispatchEvent(new CustomEvent('calibrationUpdate'));
  }

  /**
   * Cancel scale calibration
   */
  cancelScale() {
    this.scaleCalibrationLine = null;
    this.tempPoint = null;
    this.scalePixels = 0;
    this.redraw();
  }

  /**
   * Set magnetic variance and recalculate all measurements
   */
  setMagneticVariance(variance) {
    this.magneticVariance = variance;
    this.magneticVarianceSet = true;
    console.log('Magnetic variance set:', variance, variance >= 0 ? 'E' : 'W');
    this.recalculateMeasurements();
    this.redraw();
    window.dispatchEvent(new CustomEvent('calibrationUpdate'));
  }

  /**
   * Clear magnetic variance and recalculate all measurements
   */
  clearMagneticVariance() {
    this.magneticVariance = 0;
    this.magneticVarianceSet = false;
    console.log('Magnetic variance cleared');
    this.recalculateMeasurements();
    this.redraw();
    window.dispatchEvent(new CustomEvent('calibrationUpdate'));
  }

  /**
   * Reset all calibrations (North, Scale, Variance)
   */
  resetCalibrations() {
    this.northOffset = 0;
    this.northCalibrated = true; // Reset to default (up)
    this.northCustomCalibrated = false;
    this.scalePixels = 0;
    this.scaleNM = 0;
    this.scaleCalibrated = false;
    this.magneticVariance = 0;
    this.magneticVarianceSet = false;
    this.northCalibrationLine = null;
    this.scaleCalibrationLine = null;

    console.log('All calibrations reset');
    this.recalculateMeasurements();
    this.redraw();
    window.dispatchEvent(new CustomEvent('calibrationUpdate'));
  }

  /**
   * Handle measurement clicks (combined angle and distance)
   */
  handleMeasurement(point) {
    if (!this.tempPoint) {
      this.tempPoint = point;
      this.redraw();
      console.log('Measurement: first point set', point);
    } else {
      const point1 = this.tempPoint;

      // Calculate true heading
      const trueHeading = calculateBearing(point1, point, this.northOffset);

      // Calculate magnetic heading if variance is set
      let magneticHeading = null;
      if (this.magneticVarianceSet) {
        magneticHeading = calculateMagneticHeading(trueHeading, this.magneticVariance);
      }

      // Calculate distance if scale is calibrated
      let distance = null;
      if (this.scaleCalibrated) {
        const pixels = calculatePixelDistance(point1, point);
        distance = pixelsToNauticalMiles(pixels, this.scalePixels, this.scaleNM);
      }

      // Build label
      const label = this.buildMeasurementLabel(trueHeading, magneticHeading, distance);

      this.measurements.push({
        id: ++this.measurementCounter,
        type: 'measurement',
        point1: point1,
        point2: point,
        trueHeading: trueHeading,
        magneticHeading: magneticHeading,
        distance: distance,
        bearing: trueHeading, // Legacy compatibility
        label: label
      });

      this.tempPoint = null;
      this.redraw();
      console.log('Measurement:', trueHeading, 'T',
                  magneticHeading ? `, ${magneticHeading} M` : '',
                  distance ? `, ${distance} NM` : '');
    }
  }

  /**
   * Build measurement label with true, magnetic, and distance
   */
  buildMeasurementLabel(trueHeading, magneticHeading, distance) {
    let label = formatBearing(trueHeading) + 'T';

    if (magneticHeading !== null) {
      label += ' / ' + formatBearing(magneticHeading) + 'M';
    }

    if (distance !== null) {
      label += ' / ' + formatDistance(distance);
    }

    return label;
  }

  /**
   * Clear all measurements (but keep calibrations)
   */
  clearAll() {
    this.measurements = [];
    this.measurementCounter = 0;
    this.tempPoint = null;
    this.currentMode = null;

    // Keep calibrations (north, scale, variance) intact
    this.northCalibrationLine = null;
    this.scaleCalibrationLine = null;

    // Disable pointer events when clearing all
    if (this.canvas) {
      this.canvas.style.pointerEvents = 'none';
      this.canvas.style.cursor = 'default';
    }

    // Remove all labels
    this.labels.forEach(label => label.remove());
    this.labels = [];

    this.redraw();
    console.log('All measurements cleared (calibrations kept)');
  }

  /**
   * Recalculate all existing measurements with current calibration
   */
  recalculateMeasurements() {
    this.measurements.forEach(measurement => {
      if (measurement.type === 'measurement') {
        // Recalculate true heading
        const trueHeading = calculateBearing(
          measurement.point1,
          measurement.point2,
          this.northOffset
        );
        measurement.trueHeading = trueHeading;

        // Recalculate magnetic heading if variance set
        let magneticHeading = null;
        if (this.magneticVarianceSet) {
          magneticHeading = calculateMagneticHeading(trueHeading, this.magneticVariance);
        }
        measurement.magneticHeading = magneticHeading;

        // Recalculate distance if scale calibrated
        let distance = null;
        if (this.scaleCalibrated) {
          const pixels = calculatePixelDistance(measurement.point1, measurement.point2);
          distance = pixelsToNauticalMiles(pixels, this.scalePixels, this.scaleNM);
        }
        measurement.distance = distance;

        // Rebuild label
        measurement.label = this.buildMeasurementLabel(trueHeading, magneticHeading, distance);
        measurement.bearing = trueHeading; // Legacy compatibility
      }
    });

    console.log('Measurements recalculated with current calibration');
  }

  /**
   * Redraw all measurements on canvas
   */
  redraw() {
    if (!this.ctx || !this.canvas) return;

    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Remove all existing labels
    this.labels.forEach(label => label.remove());
    this.labels = [];

    // Draw calibration lines
    if (this.northCalibrationLine) {
      this.drawCalibrationLine(
        this.northCalibrationLine.point1,
        this.northCalibrationLine.point2,
        '#2196F3',
        'North'
      );
    }

    if (this.scaleCalibrationLine) {
      this.drawCalibrationLine(
        this.scaleCalibrationLine.point1,
        this.scaleCalibrationLine.point2,
        '#FF9800',
        'Scale'
      );
    }

    // Draw temporary point if in progress
    if (this.tempPoint) {
      this.drawPoint(this.tempPoint, '#FFC107', 8);
    }

    // Draw all measurements
    this.measurements.forEach(measurement => {
      this.drawMeasurement(measurement);
    });
  }

  /**
   * Draw a calibration line
   */
  drawCalibrationLine(point1, point2, color, label) {
    this.ctx.save();
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 3;
    this.ctx.setLineDash([5, 5]);

    this.ctx.beginPath();
    this.ctx.moveTo(point1.x, point1.y);
    this.ctx.lineTo(point2.x, point2.y);
    this.ctx.stroke();

    this.ctx.setLineDash([]);
    this.ctx.restore();

    // Draw points
    this.drawPoint(point1, color, 6);
    this.drawPoint(point2, color, 6);

    // Draw label
    const midpoint = getMidpoint(point1, point2);
    this.createLabel(midpoint, label, color);
  }

  /**
   * Draw a measurement
   */
  drawMeasurement(measurement) {
    // Use blue for combined measurements, keep legacy colors for old measurements
    const color = measurement.type === 'measurement' ? '#2196F3' :
                  measurement.type === 'angle' ? '#4CAF50' : '#FF9800';

    // Draw line
    this.ctx.save();
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 2;

    this.ctx.beginPath();
    this.ctx.moveTo(measurement.point1.x, measurement.point1.y);
    this.ctx.lineTo(measurement.point2.x, measurement.point2.y);
    this.ctx.stroke();

    this.ctx.restore();

    // Draw arrow at endpoint
    this.drawArrow(measurement.point1, measurement.point2, color);

    // Draw points
    this.drawPoint(measurement.point1, color, 6);
    this.drawPoint(measurement.point2, color, 6);

    // Draw label
    const midpoint = getMidpoint(measurement.point1, measurement.point2);
    this.createLabel(midpoint, measurement.label, color, measurement.id);
  }

  /**
   * Draw a point
   */
  drawPoint(point, color, radius) {
    this.ctx.save();
    this.ctx.fillStyle = color;
    this.ctx.strokeStyle = 'white';
    this.ctx.lineWidth = 2;

    this.ctx.beginPath();
    this.ctx.arc(point.x, point.y, radius, 0, 2 * Math.PI);
    this.ctx.fill();
    this.ctx.stroke();

    this.ctx.restore();
  }

  /**
   * Draw an arrow at the end of a line
   */
  drawArrow(from, to, color) {
    const angle = Math.atan2(to.y - from.y, to.x - from.x);
    const arrowLength = 15;
    const arrowAngle = Math.PI / 6;

    this.ctx.save();
    this.ctx.fillStyle = color;
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 2;

    // Arrow head
    this.ctx.beginPath();
    this.ctx.moveTo(to.x, to.y);
    this.ctx.lineTo(
      to.x - arrowLength * Math.cos(angle - arrowAngle),
      to.y - arrowLength * Math.sin(angle - arrowAngle)
    );
    this.ctx.lineTo(
      to.x - arrowLength * Math.cos(angle + arrowAngle),
      to.y - arrowLength * Math.sin(angle + arrowAngle)
    );
    this.ctx.closePath();
    this.ctx.fill();

    this.ctx.restore();
  }

  /**
   * Create a label DOM element
   */
  createLabel(position, text, color, measurementId = null) {
    const label = document.createElement('div');
    label.className = 'measurement-label';
    label.textContent = text;
    label.style.left = position.x + 'px';
    label.style.top = (position.y - 20) + 'px';
    label.style.background = color === '#4CAF50' ? 'rgba(76, 175, 80, 0.9)' :
                            color === '#FF9800' ? 'rgba(255, 152, 0, 0.9)' :
                            'rgba(33, 150, 243, 0.9)';

    // Add click to delete for measurements
    if (measurementId) {
      label.style.cursor = 'pointer';
      label.title = 'Click to delete';
      label.addEventListener('click', (e) => {
        e.stopPropagation();
        this.deleteMeasurement(measurementId);
      });
    }

    document.body.appendChild(label);
    this.labels.push(label);
  }

  /**
   * Delete a specific measurement
   */
  deleteMeasurement(id) {
    this.measurements = this.measurements.filter(m => m.id !== id);
    this.redraw();
    console.log('Measurement deleted:', id);
  }

  /**
   * Get calibration status
   */
  getStatus() {
    return {
      northCalibrated: this.northCalibrated,
      northCustomCalibrated: this.northCustomCalibrated,
      scaleCalibrated: this.scaleCalibrated,
      magneticVariance: this.magneticVariance,
      magneticVarianceSet: this.magneticVarianceSet,
      mode: this.currentMode,
      measurementCount: this.measurements.length
    };
  }

  /**
   * Destroy overlay
   */
  destroy() {
    if (this.canvas) {
      this.canvas.remove();
      this.canvas = null;
    }

    this.labels.forEach(label => label.remove());
    this.labels = [];

    window.removeEventListener('resize', this.resize.bind(this));
    window.removeEventListener('scroll', this.redraw.bind(this));
    document.removeEventListener('keydown', this.handleKeyDown.bind(this));
  }
}

// Create global instance
if (typeof window !== 'undefined') {
  window.measurementOverlay = window.measurementOverlay || new MeasurementOverlay();
}
