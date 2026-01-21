// Calculations module for Aviation Map Measurement Tool

/**
 * Calculate the angle between two points, measured clockwise from north (0°)
 *
 * @param {Object} point1 - First point {x, y}
 * @param {Object} point2 - Second point {x, y}
 * @param {number} northOffset - Calibrated north offset in degrees (default 0)
 * @returns {number} - Bearing in degrees (0-360)
 *
 * Angle convention:
 * - 0° = North (up on screen, adjusted by calibration)
 * - 90° = East (right on screen)
 * - 180° = South (down on screen)
 * - 270° = West (left on screen)
 */
function calculateBearing(point1, point2, northOffset = 0) {
  // Calculate angle from point1 to point2
  // atan2(dx, -dy) gives angle from north (positive y is down in screen coordinates)
  const dx = point2.x - point1.x;
  const dy = point2.y - point1.y;

  // Calculate angle in degrees from vertical (screen north)
  // We use -dy because screen y increases downward
  let angle = Math.atan2(dx, -dy) * 180 / Math.PI;

  // Apply calibrated north offset
  angle = angle + northOffset;

  // Normalize to 0-360 range
  angle = ((angle % 360) + 360) % 360;

  return angle;
}

/**
 * Calculate the distance between two points in pixels
 *
 * @param {Object} point1 - First point {x, y}
 * @param {Object} point2 - Second point {x, y}
 * @returns {number} - Distance in pixels
 */
function calculatePixelDistance(point1, point2) {
  const dx = point2.x - point1.x;
  const dy = point2.y - point1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Convert pixel distance to nautical miles using calibration
 *
 * @param {number} pixelDistance - Distance in pixels
 * @param {number} calibratedPixels - Calibrated pixel distance
 * @param {number} calibratedNM - Corresponding distance in nautical miles
 * @returns {number} - Distance in nautical miles
 */
function pixelsToNauticalMiles(pixelDistance, calibratedPixels, calibratedNM) {
  if (calibratedPixels === 0) {
    return 0;
  }
  return (pixelDistance / calibratedPixels) * calibratedNM;
}

/**
 * Calculate the north offset from a compass rose calibration
 *
 * @param {Object} center - Center point of compass rose {x, y}
 * @param {Object} northPoint - North indicator point {x, y}
 * @returns {number} - North offset in degrees
 */
function calculateNorthOffset(center, northPoint) {
  // Calculate the angle from screen vertical (up) to the indicated north
  const dx = northPoint.x - center.x;
  const dy = northPoint.y - center.y;

  // Angle from vertical (screen north) to true north
  let offset = Math.atan2(dx, -dy) * 180 / Math.PI;

  // The offset is the negative of this angle because we want to rotate
  // our measurements to align with the calibrated north
  return -offset;
}

/**
 * Calculate magnetic heading from true heading using magnetic variance
 * Convention: Magnetic = True - Variance (East positive, West negative)
 * @param {number} trueHeading - True heading in degrees (0-360)
 * @param {number} variance - Magnetic variance (positive=East, negative=West)
 * @returns {number} - Magnetic heading in degrees (0-360)
 */
function calculateMagneticHeading(trueHeading, variance) {
  let magnetic = trueHeading - variance;
  magnetic = ((magnetic % 360) + 360) % 360;
  return magnetic;
}

/**
 * Format bearing with degrees symbol
 *
 * @param {number} bearing - Bearing in degrees
 * @returns {string} - Formatted bearing (e.g., "045°")
 */
function formatBearing(bearing) {
  // Pad with zeros to 3 digits
  const rounded = Math.round(bearing);
  return String(rounded).padStart(3, '0') + '°';
}

/**
 * Format distance in nautical miles
 *
 * @param {number} distance - Distance in nautical miles
 * @returns {string} - Formatted distance (e.g., "10.5 NM")
 */
function formatDistance(distance) {
  // Round to 1 decimal place
  const rounded = Math.round(distance * 10) / 10;
  return rounded.toFixed(1) + ' NM';
}

/**
 * Get the midpoint between two points
 *
 * @param {Object} point1 - First point {x, y}
 * @param {Object} point2 - Second point {x, y}
 * @returns {Object} - Midpoint {x, y}
 */
function getMidpoint(point1, point2) {
  return {
    x: (point1.x + point2.x) / 2,
    y: (point1.y + point2.y) / 2
  };
}

/**
 * Calculate a point offset from another point in a given direction
 *
 * @param {Object} point - Base point {x, y}
 * @param {number} distance - Distance to offset
 * @param {number} angle - Angle in degrees (0 = up, 90 = right)
 * @returns {Object} - Offset point {x, y}
 */
function getOffsetPoint(point, distance, angle) {
  const radians = angle * Math.PI / 180;
  return {
    x: point.x + distance * Math.sin(radians),
    y: point.y - distance * Math.cos(radians)
  };
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    calculateBearing,
    calculatePixelDistance,
    pixelsToNauticalMiles,
    calculateNorthOffset,
    calculateMagneticHeading,
    formatBearing,
    formatDistance,
    getMidpoint,
    getOffsetPoint
  };
}
