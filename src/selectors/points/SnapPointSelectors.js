/**
 * Given the root state, return the set of snapping points
 * @param  {Object} state The root store state
 * @return {Array}        The list of snapping points to show
 */
export function getSnappingPoints(state = {}) {
  return state.snapPoints || [];
};

/**
 * Get the snap point that is closest to the given x,y pair
 * @param  {Object} state      The root state object
 * @param  {Object}            The payload with coordinates
 *         {Number} options.x  The x location to match
           {Number} options.y  The y location to match
 * @param  {Number} cycleIndex If there are multiple matching points, which point to select
 *                             (Typically done via Tab key)
 * @param  {Number} threshold  The threshold to apply to distance
 * @return {Point}             The snapping point that is closest to x, y
 */
export function getClosestSnappingPoint(state, { x, y } = {}, cycleIndex = 0, threshold = 5) {
  let matches = [];
  getSnappingPoints(state).forEach(function(point) {
    let d = Math.abs(point.x - x) + Math.abs(point.y - y);
    if (d <= threshold) {
      matches.push(point);
    }
  });
  return matches[cycleIndex % matches.length];
};
