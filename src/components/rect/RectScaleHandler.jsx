import { ObjectUtils } from "utils/GenericUtils";
import { detectSnapping, toSourcePoint, closestSelfControlPoint, 
  getPointNameFromPointId, getComponentIdFromPointId } from "utils/PointUtils";
import { isNumeric } from "utils/TypeUtils";

const opposite = {
  left: "right",
  right: "left",
  top: "bottom",
  bottom: "top"
};
/**
 * Handle the start of a scale operation
 * @param  {Object} picture                The picture being drawn
 * @param  {Object} step                   The scale step
 * @param  {String} pointId                The id of the point the user clicked on
 * @return {Object} The updated step
 */
export function onScaleStart(picture, step, { pointId }) {
  // Find the snapping point on the rectangle that closely matches (x, y)
  let info = picture.propStore.getInfo(step.componentId);
  // Get the corresponding snap point version so that we know its x,y coords in
  // the transformed space
  let snapPoint = info.type.getSnappingPoint(info.props, getPointNameFromPointId(pointId));
  /*
    Terminology: `source` is the point being moved/scaled.
   */
  step.source = {
    pointId,
    x: snapPoint.x,
    y: snapPoint.y
  };
  return step;
};

/**
 * Handle scaling a component via a source point
 * @param  {Object} picture        The picture we are drawing
 * @param  {Object} step           The scale step
 * @param  {Number} options.deltaX The delta x movement of the control point
 * @param  {Number} options.deltaY The delta y movement of the control point
 * @param  {String} pointId        Optional id of the point user moved to
 * @return {Object} The updated step
 */
export function onScale(picture, step, { deltaX, deltaY, pointId }) {
  let scaleX, scaleY;
  // If pointId differs from the one set on scale start, the user moved to a 
  // point and would like the rectangle to get scaled by an amount that would
  // make it reach the target point, instead of specifying an explicit number.
  if (pointId) {
    step.target = {
      pointId
    };
    step.scaleX = undefined;
    step.scaleY = undefined;
    return step;
  }
  // Otherwise just scale normally
  if (step.source.pointId) {
    step.target = {
      x: step.source.x + deltaX,
      y: step.source.y + deltaY
    };
    // Original w, h
    let originalWidth = Math.abs(step.initialProps.width);
    let originalHeight = Math.abs(step.initialProps.height);
    let newWidth, newHeight;
    let sourcePointName = getPointNameFromPointId(step.source.pointId);
    // For each pointName
    if (sourcePointName === "top left") {
      newWidth = Math.max(originalWidth - deltaX, 0);
      newHeight = Math.max(originalHeight - deltaY, 0);
    } else if (sourcePointName === "top mid") {
      // Vertically scale
      newHeight = Math.max(originalHeight - deltaY, 0);
    } else if (sourcePointName === "top right") {
      newWidth = Math.max(originalWidth + deltaX, 0);
      newHeight = Math.max(originalHeight - deltaY, 0);
    } else if (sourcePointName === "mid right") {
      newWidth = Math.max(originalWidth + deltaX, 0);
    } else if (sourcePointName === "bottom right") {
      newWidth = Math.max((originalWidth + deltaX), 0);
      newHeight = Math.max((originalHeight + deltaY), 0);
    } else if (sourcePointName === "bottom mid") {
      newHeight = Math.max((originalHeight + deltaY), 0);
    } else if (sourcePointName === "bottom left") {
      // deltaX is positive, deltaY is negative
      newWidth = Math.max((originalWidth - deltaX), 0);
      newHeight = Math.max((originalHeight + deltaY), 0);
    } else if (sourcePointName === "mid left") {
      // deltaX is positive
      newWidth = Math.max((originalWidth - deltaX), 0);
    }

    if (newWidth !== undefined) {
      scaleX = newWidth / originalWidth;
    }

    if (newHeight !== undefined) {
      scaleY = newHeight / originalHeight;
    }
  }
  // Set scaleX and scaleY
  step.scaleX = scaleX;
  step.scaleY = scaleY;
  return step;
};

/**
 * Handle the scale end event
 * @param  {Object} picture   The picture we are drawing
 * @param  {Object} step      The move step
 * @param  {String} pointId   The id of the point that the user moved to.
 * @return {Object} The updated step
 */
export function onScaleEnd(picture, step, { pointId } = {}) {
  if (pointId) {
    step.target = {
      pointId
    };
  }
  return step;
};


/**
 * Evaluate the results of a scaling step
 * @param  {Object} picture The picture we are drawing
 * @param  {Object} info The information associated with the component
 * @param  {Object} step The description of the step
 * @return {Object} Updated props
 */
export function evaluateScaleStep(picture, info, step) {
  // Find out the scale start point
  let source = step.source;
  let scaleX, scaleY;
  let sourcePointName = getPointNameFromPointId(source.pointId);
  // Find out the name of the point we are scaling about
  let name = sourcePointName;
  let targetPoint;
  if (step.target && step.target.pointId) {
    // The user wants us to move such that scale is automatically set.
    let targetInfo = picture.propStore.getInfo(getComponentIdFromPointId(step.target.pointId));
    // Convert the normal coordinates into the current SVG coordinate space
    targetPoint = targetInfo.type.getSnappingPoint(targetInfo.props, getPointNameFromPointId(step.target.pointId));
  }
  if (targetPoint) {
    let aboutPointName = sourcePointName.split(" ").map((d) => opposite[d] || d).join(" ");
    // Get the point we are scaling about
    let aboutPoint = info.type.getSnappingPoint(info.props, aboutPointName);
    scaleX = Math.abs(aboutPoint.x - targetPoint.x) / step.initialProps.width;
    scaleY = Math.abs(aboutPoint.y - targetPoint.y) / step.initialProps.height;
  } else {
    // There is no target point use scaleX, scaleY
    if (!isNumeric(step.scaleX)) {
      // scaleX is an expression, evaluate it from picture
      scaleX = picture.evaluateExpression(step.scaleX, step.iteration);
      scaleX = scaleX === undefined ? 1 : scaleX;
    } else {
      scaleX = step.scaleX !== undefined ? step.scaleX : 1;
    }
    if (!isNumeric(step.scaleY)) {
      // scaleX is an expression, evaluate it from picture
      scaleY = picture.evaluateExpression(step.scaleY, step.iteration);
      scaleY = scaleY === undefined ? 1 : scaleY;
    } else {
      scaleY = step.scaleY !== undefined ? step.scaleY : 1;
    }
  }
  if (name === "bottom right") {
    return {
      width: step.initialProps.width * scaleX,
      height: step.initialProps.height * scaleY
    };
  } else if (name === "mid right") {
    // Scale width using initialProps.width
    return {
      width: step.initialProps.width * scaleX
    };
  } else if (name === "top right") {
    return {
      y: (step.initialProps.y) + (1 - scaleY) * step.initialProps.height,
      height: step.initialProps.height * scaleY, 
      width: step.initialProps.width * scaleX
    };
  } else if (name === "top mid") {
    return {
      y: (step.initialProps.y) + (1 - scaleY) * step.initialProps.height,
      height: step.initialProps.height * scaleY
    };
  } else if (name === "top left") {
    return {
      x: (step.initialProps.x) + (1 - scaleX) * step.initialProps.width,
      y: (step.initialProps.y) + (1 - scaleY) * step.initialProps.height,
      height: step.initialProps.height * scaleY,
      width: step.initialProps.width * scaleX
    };
  } else if (name === "mid left") {
    return {
      width: step.initialProps.width * scaleX,
      x: (step.initialProps.x) + (1 - scaleX) * step.initialProps.width,
    };
  } else if (name === "bottom left") {
    return {
      x: (step.initialProps.x) + (1 - scaleX) * step.initialProps.width,
      width: step.initialProps.width * scaleX,
      height: step.initialProps.height * scaleY
    };
  } else if (name === "bottom mid") {
    return {
      height: step.initialProps.height * scaleY
    };
  }
};

export function getScalingStepSlots(info, step) {
  let sourcePoint = step.source;
  let targetPoint = step.target;
  let slots = [ {
    type: "text",
    value: "Scale"
  }, {
    type: "point",
    value: sourcePoint
  } ];

  if (targetPoint && targetPoint.pointId !== undefined) {
    // so that sourcePoint meets targetPoint!
    slots = slots.concat([ {
      type: "text",
      value: "such that it meets"
    }, {
      type: "point",
      value: targetPoint
    } ]);
  } else {
    slots.push({
      type: "text",
      value: "by"
    });
    if (step.scaleX !== undefined) {
      if (!isNumeric(step.scaleX)) {
        slots.push({
          type: "expression",
          attribute: "scaleX",
          value: step.scaleX
        });
      } else {
        slots.push({
          type: "number",
          attribute: "scaleX",
          min: 0,
          max: 10,
          editable: true,
          value: (step.scaleX).toFixed(3)
        });
      }
    }

    if (step.scaleY !== undefined) {
      if (step.scaleX !== undefined) {
        slots.push({
          type: "text",
          value: ","
        });
      }
      if (!isNumeric(step.scaleY)) {
        slots.push({
          type: "expression",
          attribute: "scaleY",
          value: step.scaleY
        });
      } else {
        slots.push({
          type: "number",
          attribute: "scaleY",
          min: 0,
          max: 10,
          editable: true,
          value: (step.scaleY).toFixed(3)
        });
      }
    }
  }
  return slots;
};
