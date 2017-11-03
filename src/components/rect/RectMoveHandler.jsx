import { ObjectUtils } from "sculpt/utils/GenericUtils";
import { detectSnapping, toSourcePoint, closestSelfControlPoint, 
  getPointNameFromPointId, getComponentIdFromPointId } from "sculpt/utils/PointUtils";

/**
 * Handle the start of a move operation
 * @param  {Object} picture                The picture being drawn
 * @param  {Object} step                   The move step
 * @param  {Number} options.x The x coordinate of the point where user clicked in the canvas
 * @param  {Number} options.y The y coordinate of the point where user clicked in the canvas
 * @return {Object} The updated step
 */
export function onMoveStart(picture, step, { x, y }) {
  // Find the snapping point on the rectangle that closely matches (x, y)
  step.deltaX = 0;
  step.deltaY = 0;
  let info = picture.propStore.getInfo(step.componentId);
  let controlPoint = closestSelfControlPoint(info.type, info.props, { x, y });
  // Get the corresponding snap point version
  step.source = toSourcePoint(step.componentId, controlPoint);
  return step;
}

/**
 * Handle moving a component via a source point
 * @param  {Object} picture        The picture we are drawing
 * @param  {Object} step           The move step
 * @param  {Number} options.deltaX The delta x movement of the control point
 * @param  {Number} options.deltaY The delta y movement of the control point
 * @return {Object} The updated step
 */
export function onMove(picture, step, { deltaX, deltaY }) {
  // Move from step's source deltaX units horizontally and deltaY units vertically
  if (step.source && step.source.pointId) {
    // The following will give the x, y coordinates of rectangle after movement!
    step.target = {
      x: step.source.x + deltaX,
      y: step.source.y + deltaY
    };
    step.deltaX = deltaX;
    step.deltaY = deltaY;
  }
  return step;
};

/**
 * Handle the movement end event
 * @param  {Object} picture   The picture we are drawing
 * @param  {Object} step      The move step
 * @param  {Number} options.x The x coordinate of the mouse pointer relative to canvas
 * @param  {Number} options.y The y coordinate of the mouse pointer relative to canvas
 * @return {Object} The updated step
 */
export function onMoveEnd(picture, step, { x, y }) {
  // Find out the matrix of the node being modified. We will use
  // data-sculpt-id to select the rect. For the actual drawing,
  // the calculated matrix will be stored on step
  let node = document.querySelector(`[data-sculpt-id="${step.componentId}"]`);
  let matrix = node.getCTM();
  let txPt = getTransformedPoint(picture, matrix, { x, y });
  // Detect snapping now
  step.target = detectSnapping(picture.snappingStore, txPt);
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

export function getMovingStepSlots(info, sourcePoint, targetPoint) {
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
