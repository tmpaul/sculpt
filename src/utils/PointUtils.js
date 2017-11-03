/**
 * Given pointId return the componentId
 * @param  {String} pointId The id of the point in SnappingStore
 * @return {String}         The id of the component
 */
export function getComponentIdFromPointId(pointId) {
  return pointId.split(":")[0];
};

/**
 * Given a pointId return the name of the point
 * @param  {String} pointId The id of the point in SnappingStore
 * @return {String}         The name of the point
 */
export function getPointNameFromPointId(pointId) {
  return pointId.split(":")[1];
};

/**
 * Get the id of the point given componentId and control point name
 * @param  {String} componentId      The id of the component
 * @param  {String} controlPointName The name of the control point
 * @return {String}                  The unique id of the point
 */
export function getPointId(componentId, controlPointName) {
  return componentId + ":" + controlPointName;
}

/**
 * Change the point id by remapping it to a new component
 * @param  {String} pointId      Original pointId
 * @param  {Object} componentMap Object mapping a given component id to another
 * @return {String}              The id of the point
 */
export function changePointId(pointId, componentMap) {
  if (!componentMap) {
    return pointId;
  }
  let componentId = getComponentIdFromPointId(pointId);
  return getPointId(
    componentMap[componentId] || componentId,
    getPointNameFromPointId(pointId)
  );
};

/**
 * Convert a control point into source point
 * @param  {String} componentId The id of the component
 * @param  {Object} controlPoint The control point
 * @return {Object} The converted source point
 */
export function toSourcePoint(componentId, controlPoint) {
  if (!controlPoint) {
    return undefined;
  }
  return {
    pointId: getPointId(componentId, controlPoint.name),
    x: controlPoint.x,
    y: controlPoint.y
  };
}

/**
 * Find the closest control point of a component to a given x, y coord pair
 * @param  {Function} componentType The type of the component
 * @param  {Object} props           The props of the component
 * @param  {Number} options.x       The x coordinate of the target point
 * @param  {Number} options.y       The y coordinate of the target point
 * @return {Object} The closest point
 */
export function closestSelfControlPoint(componentType, props, { x, y } = {}) {
  if (x === undefined || y === undefined) {
    return undefined;
  }
  let snapPoints = componentType.getSnappingPoints(props);
  let minDist = Infinity, point;
  snapPoints.forEach((p) => {
    let dist = Math.abs(p.x - x) + Math.abs(p.y - y);
    if (dist < minDist) {
      point = p;
      minDist = dist;
    }
  });
  return point;
}

/**
 * Detect if a given candidate point is snappable onto a target point
 * @param  {Object} snappingStore  The snap point store
 * @param  {Object} candidatePoint The candidate point
 * @param  {String} selfId         The id of the component whose control point we are trying to snap.
 *                                 If the target point belongs to componentId ignore
 * @return {Object}                The snap point or candidate point if no snap point is found
 */
export function detectSnapping(snappingStore, candidatePoint, selfId) {
  let point = snappingStore.getClosestSnappingPoint(candidatePoint.x, candidatePoint.y, selfId ? function(pointId) { 
    return getComponentIdFromPointId(pointId) !== selfId;
  } : undefined);
  if (point) {
    return Object.assign(candidatePoint, {
      pointId: point.pointId,
      x: point.pointX,
      y: point.pointY
    });
  } else {
    return candidatePoint;
  }
};


/**
 * Sync a point's properties based on propStore
 * @param  {Object} propStore     The property store
 * @param  {Object} snappingStore The store storing snapping points
 * @param  {Object} sourcePoint   The point to sync
 * @return {Object}               The synced point
 */
export function syncPoint(propStore, snappingStore, sourcePoint) {
  if (!sourcePoint) {
    return;
  }
  let result;
  if (sourcePoint.pointId) {
    // Then get the x and y coordinates from picture.snappingStore.
    let sourceInfo = propStore.getInfo(getComponentIdFromPointId(sourcePoint.pointId));
    result = sourceInfo.type.getSnappingPoint(sourceInfo.props, getPointNameFromPointId(sourcePoint.pointId));
  } else {
    result = sourcePoint;
  }
  return result;
}
