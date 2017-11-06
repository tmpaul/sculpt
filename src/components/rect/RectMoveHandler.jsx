import { ObjectUtils } from "utils/GenericUtils";
import { detectSnapping, toSourcePoint, closestSelfControlPoint,
  getTransformedPoint,
  getPointNameFromPointId, getComponentIdFromPointId } from "utils/PointUtils";

/**
 * Handle the start of a move operation
 * @param  {Object} picture                The picture being drawn
 * @param  {Object} step                   The move step
 * @param  {String} options.pointId        The id of the point that user clicked on
 * @return {Object} The updated step
 */
export function onMoveStart(picture, step, { pointId }) {
  // Find the snapping point on the rectangle that closely matches (x, y)
  step.deltaX = 0;
  step.deltaY = 0;
  let info = picture.propStore.getInfo(step.componentId);
  // Get the corresponding snap point version so that we know its x,y coords in
  // the transformed space
  let snapPoint = info.type.getSnappingPoint(info.props, getPointNameFromPointId(pointId));
  step.source = {
    pointId,
    x: snapPoint.x,
    y: snapPoint.y
  };
  return step;
}

/**
 * Handle moving a component via a source point
 * @param  {Object} picture        The picture we are drawing
 * @param  {Object} step           The move step
 * @param  {Number} options.deltaX The delta x movement of the control point
 * @param  {Number} options.deltaY The delta y movement of the control point
 * @param  {String} options.pointId Optional pointId of a point that user moved to
 * @return {Object} The updated step
 */
export function onMove(picture, step, { deltaX, deltaY, pointId }) {
  // Move from step's source deltaX units horizontally and deltaY units vertically
  if (step.source && step.source.pointId) {
    if (pointId) {
      step.target = {
        pointId
      };
      return step;
    } else {
      // The following will give the x, y coordinates of rectangle after movement!
      step.target = {
        x: step.source.x + deltaX,
        y: step.source.y + deltaY
      };
      step.deltaX = deltaX;
      step.deltaY = deltaY;
    }
  }
  step.target.pointId = pointId;
  return step;
};

/**
 * Handle the movement end event
 * @param  {Object} picture   The picture we are drawing
 * @param  {Object} step      The move step
 * @param  {String} options.pointId Optional pointId of a point that user moved to
 * @return {Object} The updated step
 */
export function onMoveEnd(picture, step, { pointId }) {
  if (pointId) {
    step.target.pointId = pointId;
  }
  return step;
};

export function evaluateMoveStep(picture, info, step) {
  // Look for a source point id
  let sourcePoint, targetPoint;
  if (step.source.pointId) {
    // Get target point
    sourcePoint = info.type.getSnappingPoint(info.props, getPointNameFromPointId(
      step.source.pointId
    ));
    if (step.target && step.target.pointId) {
      // We are moving to the new point that belongs to a different component
      let targetInfo = picture.propStore.getInfo(getComponentIdFromPointId(step.target.pointId));
      targetPoint = targetInfo.type.getSnappingPoint(targetInfo.props,
        getPointNameFromPointId(step.target.pointId));
    } else {
      // We are moving to some point (x, y). We need the coordinates of the original point.
      let originalSourcePoint = info.type.getSnappingPoint(step.initialProps, 
        getPointNameFromPointId(step.source.pointId));
      targetPoint = {
        x: originalSourcePoint.x + step.deltaX,
        y: originalSourcePoint.y + step.deltaY
      };
    }

    if (!sourcePoint) {
      return;
    }

    if (!targetPoint) {
      return;
    }
    // Get point type
    let pointType = sourcePoint.name;
    let props = info.props;
    switch (pointType) {
      case "top left":
        // We are moving the top left of rectangle.
        return {
          x: targetPoint.x,
          y: targetPoint.y
        };
      case "top mid":
        return {
          x: targetPoint.x - props.width / 2,
          y: targetPoint.y
        };
      case "top right":
        return {
          x: targetPoint.x - props.width,
          y: targetPoint.y
        };
      case "mid right":
        return {
          x: targetPoint.x - props.width,
          y: targetPoint.y - props.height / 2
        };
      case "bottom right":
        return {
          x: targetPoint.x - props.width,
          y: targetPoint.y - props.height
        };
      case "bottom mid":
        return {
          x: targetPoint.x - props.width / 2,
          y: targetPoint.y - props.height
        };
      case "bottom left":
        return {
          x: targetPoint.x,
          y: targetPoint.y - props.height
        };
      case "mid left":
        return {
          x: targetPoint.x,
          y: targetPoint.y - props.height / 2
        };
      case "center":
        return {
          x: targetPoint.x - props.width / 2,
          y: targetPoint.y - props.height / 2
        };
    }
  }
}

export function getMovingStepSlots(info, step) {
  let sourcePoint = step.source;
  let targetPoint = step.target;
  let slots = [ {
    type: "text",
    value: "Move"
  }, {
    type: "point",
    value: sourcePoint
  } ];

  if (targetPoint === undefined || targetPoint.pointId !== undefined) {
    // so that sourcePoint meets targetPoint!
    slots = slots.concat([ {
      type: "text",
      value: "such that it"
    }, {
      type: "text",
      value: "meets"
    }, {
      type: "point",
      value: targetPoint
    } ]);
  } else {
    slots = slots.concat([ {
      type: "text",
      value: (targetPoint.x - sourcePoint.x).toFixed(2) + "px horizontally"
    }, {
      type: "text",
      value: (targetPoint.y - sourcePoint.y).toFixed(2) + "px vertically"
    } ]);
  }
  return slots;
};
