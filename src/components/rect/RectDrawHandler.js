import { ObjectUtils } from "utils/GenericUtils";
import { AbortStep } from "components/steps";
import { detectSnapping, syncPoint } from "utils/PointUtils";
/**
 * Handle the start of drawing operation for a rectangle
 * 
 * @param  {Object} picture                The picture being drawn
 * @param  {Object} step                   The draw step
 * @param  {Number} options.x              The start point x coordinate
 * @param  {Number} options.y              The start point y coordinate
 * @param  {String} options.pointId        Optional string id of a point that the user clicked on
 * @return {Object} step                   The updated step
 */
export function onDrawStart(picture, step, { x, y, pointId } = {}) {
  step.source = {
    x,
    y,
    pointId
  };
  return step;
}

/**
 * A function that handles drawing a rectangle
 * @param  {Object} picture                The picture being drawn
 * @param  {Object} step                   The draw step
 * @param  {Number} options.deltaX         The delta x of mouse cursor
 * @param  {Number} options.deltaY         The delta y of mouse cursor
 * @param  {String} options.pointId        The id of the point user is drawing close to
 * @return {Object} step                   The updated step
 */
export function onDraw(picture, step, { deltaX, deltaY, pointId }) {
  // deltaX and deltaY take care helps us figure out the direction of drag. The direction
  // can change during movement, e.g -deltaX means the source point is different.
  step.deltaX = deltaX;
  step.deltaY = deltaY;
  // The final point
  step.target = {
    pointId,
    x: step.source.x + deltaX,
    y: step.source.y + deltaY
  };
  return step;
};

/**
 * Handle draw end
 * @param  {Object} picture        The picture being drawn
 * @param  {Object} step           The draw step
 * @param  {Number} options.x      The x point
 * @param  {Number} options.y      The y point
 * @param  {String} options.pointId        The id of the point user is drawing close to
 * @return {Object} step           The updated step
 */
export function onDrawEnd(picture, step, { x, y, pointId } = {}) {
  if (step.deltaX === undefined && step.deltaY === undefined) {
    // Abort the draw operation. We do not have a target point.
    return AbortStep;
  }
  step.deltaX = x - step.source.x;
  step.deltaY = y - step.source.y;
  // Attempt to detect snapping
  step.target = {
    x,
    y,
    pointId
  };
  return step;
}

export function evaluateDrawStep(picture, info, step) {
  if (step.type === "DRAW") {
    /*
      Find out props
     */
    let props = {}, sourcePoint, targetPoint = step.target;
    // Look at the source point and target point.
    sourcePoint = syncPoint(picture.propStore, picture.snappingStore, step.source);
    if (step.deltaX === undefined && step.deltaY === undefined) {
      targetPoint = sourcePoint;
    } else if (targetPoint && targetPoint.pointId) {
      // Get point information
      targetPoint = syncPoint(picture.propStore, picture.snappingStore, targetPoint);
    } else {
      targetPoint = {
        x: sourcePoint.x + (step.deltaX || 0),
        y: sourcePoint.y + (step.deltaY || 0)
      };
    }
    // targetPoint = detectSnapping(picture.snappingStore, targetPoint);
    // Get deltas
    let deltaX = targetPoint.x - sourcePoint.x;
    let deltaY = targetPoint.y - sourcePoint.y;
    let startingPoint, endingPoint;
    props.x = sourcePoint.x;
    props.y = sourcePoint.y;
    if (deltaX > 0) {
      if (deltaY > 0) {
        // Start from top_left
        startingPoint = "top left";
      } else {
        // deltaX > 0 and deltaY < 0
        startingPoint = "bottom left";
      }
    } else {
      if (deltaY > 0) {
        // deltaX < 0 and deltaY > 0
        startingPoint = "top right";
      } else {
        // deltaX < 0 and deltaY < 0
        startingPoint = "bottom right";
      }
    }
    // Now figure out the new properties for rectangle
    if (startingPoint === "top left") {
      // Draw until bottom right
      props.x = sourcePoint.x;
      props.y = sourcePoint.y;
      props.width = targetPoint.x - sourcePoint.x;
      props.height = targetPoint.y - sourcePoint.y;
    } else if (startingPoint === "top right") {
      props.width = sourcePoint.x - targetPoint.x;
      props.height = targetPoint.y - sourcePoint.y;
      props.x = sourcePoint.x - props.width;
      props.y = sourcePoint.y;
    } else if (startingPoint === "bottom right") {
      props.x = targetPoint.x;
      props.y = targetPoint.y;
      props.width = sourcePoint.x - targetPoint.x;
      props.height = sourcePoint.y - targetPoint.y;
    } else if (startingPoint === "bottom left") {
      props.x = sourcePoint.x;
      props.y = targetPoint.y;
      props.width = targetPoint.x - sourcePoint.x;
      props.height = sourcePoint.y - targetPoint.y;
    } else {
      props.width = 0;
      props.height = 0;
      props.x = sourcePoint.x;
      props.y = sourcePoint.y;
    }
    props.width = Math.max(props.width, 0);
    props.height = Math.max(props.height, 0);
    return props;
  }
}

export function getDrawingStepSlots(info, step) {
  let sourcePoint = step.source;
  let targetPoint = step.target;
  let slots = [ {
    type: "text",
    value: "Draw"
  }, {
    type: "name",
    value: info.name
  }, {
    type: "text",
    value: "from"
  }, {
    type: "point",
    value: sourcePoint
  } ];

  if (targetPoint === undefined || targetPoint.pointId !== undefined) {
    slots = slots.concat([ {
      type: "text",
      value: "to"
    }, {
      type: "point",
      value: targetPoint
    } ]);
  } else {
    slots = slots.concat([ {
      type: "text",
      value: (targetPoint.x - sourcePoint.x) + "px horizontally"
    }, {
      type: "text",
      value: (targetPoint.y - sourcePoint.y) + "px vertically"
    } ]);
  }
  return slots;
};
