import { ObjectUtils } from "sculpt/utils/GenericUtils";
import { 
  detectSnapping, 
  toSourcePoint, 
  closestSelfControlPoint, 
  getPointNameFromPointId,
  getTransformedPoint,
  reflectPoint,
  getComponentIdFromPointId } from "sculpt/utils/PointUtils";

const opposite = {
  left: "right",
  right: "left",
  top: "bottom",
  bottom: "top"
};

const distance = (pt1, pt2) => Math.sqrt(Math.pow(pt1.x - pt2.x, 2) + Math.pow(pt1.y - pt2.y, 2));

/**
 * Handle the start of a rotate operation
 * @param  {Object} picture                The picture being drawn
 * @param  {Object} step                   The move step
 * @param  {Number} options.x The x coordinate of the point where user clicked in the canvas
 * @param  {Number} options.y The y coordinate of the point where user clicked in the canvas
 * @return {Object} The updated step
 */
export function onRotateStart(picture, step, { x, y }) {
  // Find the snapping point on the rectangle that closely matches (x, y)
  step.rotateAngle = 0;
  step.rotateCenter = null;
  let info = picture.propStore.getInfo(step.componentId);
  let controlPoint = closestSelfControlPoint(info.type, info.props, { x, y });
  // Get the corresponding snap point version
  step.source = toSourcePoint(step.componentId, controlPoint);
  // Given a source point, identify the point we are rotating about
  if (step.source && step.source.pointId) {
    // Get the name of the point from the pointId
    let pointName = getPointNameFromPointId(step.source.pointId);
    let otherPoint = pointName.split(" ").map((d) => opposite[d] || d).join(" ");
    let targetPoint = info.type.getSnappingPoint(info.props, otherPoint);
    step.target = toSourcePoint(step.componentId, targetPoint);
  }
  return step;
}

/**
 * Handle rotation of a component about a target point
 * @param  {Object} picture        The picture we are drawing
 * @param  {Object} step           The rotate step
 * @param  {Number} options.deltaX The delta x movement of the control point
 * @param  {Number} options.deltaY The delta y movement of the control point
 * @return {Object} The updated step
 */
export function onRotate(picture, step, { deltaX, deltaY }) {
  // Move from step's source deltaX units horizontally and deltaY units vertically
  if (step.target && step.target.pointId) {
    // Get the angle of rotation about targetPoint. The targetPoint will not move
    // as we are rotating!
    // To figure out angle of rotation we use deltas
    
    // Find coordinates of source point (the one we are rotating)
    let sourcePoint = step.source;

    // Find coordinates of mouse cursor
    let mousePoint = {
      x: step.source.x + deltaX,
      y: step.source.y + deltaY
    };

    // Find coordinates of target point (the one are rotating about)
    let targetPoint = step.target;

    // Calculate distances between the points
    let a = distance(sourcePoint, targetPoint);

    let b = distance(targetPoint, mousePoint);

    let c = distance(sourcePoint, mousePoint);

    // Use law of cosines
    step.angle = Math.acos((a * a + b * b - c * c) / (2 * a * b));

    // We need to adjust the angle's sign based on position of new
    // targetPoint relative to old targetPoint.
    
    // // Reflect source point around target point
    // let reflectedSourcePoint = reflectPoint(sourcePoint, targetPoint);
    // // Find the quadrant based on deltaX and deltaY with coordinate
    // // axes aligned along reflected line and its perpendicular line.
    // let quadrant = findQuadrant(mousePoint, );
    // Get the sign by evaluating the position of mouse pointer about line
    let sign = (mousePoint.x - targetPoint.x) * (sourcePoint.y - targetPoint.y) -
      (mousePoint.y - targetPoint.y) * (sourcePoint.x - targetPoint.x);

   if (step.angle > Math.PI / 2 && sign > 0) {
      step.angle = 2 * Math.PI - step.angle;
   }
   if (step.angle < Math.PI / 2 && sign > 0) {
      step.angle = -step.angle;
   }
  }
  return step;
};

/**
 * Handle the rotation end event
 * @param  {Object} picture   The picture we are drawing
 * @param  {Object} step      The rotate step
 * @param  {Number} options.x The x coordinate of the mouse pointer relative to canvas
 * @param  {Number} options.y The y coordinate of the mouse pointer relative to canvas
 * @return {Object} The updated step
 */
export function onRotateEnd(picture, step, { x, y }) {
  // Find out the matrix of the node being modified. We will use
  // data-sculpt-id to select the rect. For the actual drawing,
  // the calculated matrix will be stored on step
  let node = document.querySelector(`[data-sculpt-id="${step.componentId}"]`);
  step.matrix = node.getCTM();
  let txPt = getTransformedPoint(picture, step.matrix, { x, y });
  // Detect snapping now
  let point = detectSnapping(picture.snappingStore, txPt);
  if (point && point.pointId) {
    step.source = point;
  }
  return step;
};

export function evaluateRotateStep(picture, info, step) {
  // Look for a source point id
  let sourcePoint, targetPoint, angle = step.angle || 0;
  if (step.target.pointId) {
    if (step.source && step.source.pointId) {
      angle = step.angle * 180 / Math.PI;
    }

    if (angle === undefined) {
      return;
    }
    // Figure out which point we are rotating about (i.e target point name)
    let targetPointName = getPointNameFromPointId(step.target.pointId);
    let props = info.props;
    let rotationPoint = info.type.getSnappingPoint(info.props, targetPointName);
    return {
      rotation: angle,
      rotateX: rotationPoint.x,
      rotateY: rotationPoint.y
    };
  }
}

export function getRotationStepSlots(info, sourcePoint, targetPoint) {
  let slots = [ {
    type: "text",
    value: "Rotate"
  }, {
    type: "name",
    value: info.name
  }, {
    type: "text",
    value: "about"
  }, {
    type: "point",
    value: targetPoint
  }, {
    type: "text",
    value: "by"
  }, {
    type: "text",
    value: (info.props.rotation || 0).toFixed(2) + " degrees"
  } ];
  return slots;
};
