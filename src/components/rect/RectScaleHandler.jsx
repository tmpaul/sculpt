import { ObjectUtils } from "utils/GenericUtils";
import { detectSnapping, toSourcePoint, closestSelfControlPoint, 
  getPointNameFromPointId, getComponentIdFromPointId } from "utils/PointUtils";

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
 * @param  {Number} options.x The x coordinate of the point where user clicked in the canvas
 * @param  {Number} options.y The y coordinate of the point where user clicked in the canvas
 * @return {Object} The updated step
 */
export function onScaleStart(picture, step, { x, y }) {
  // Find the snapping point on the rectangle that closely matches (x, y)
  let info = picture.propStore.getInfo(step.componentId);
  let controlPoint = closestSelfControlPoint(info.type, info.props, { x, y });
  // Get the corresponding snap point version
  step.source = toSourcePoint(step.componentId, controlPoint);
  if (step.source && step.source.pointId) {
    let pointName = getPointNameFromPointId(step.source.pointId);
    let otherPoint = pointName.split(" ").map((d) => opposite[d] || d).join(" ");
    let pt = info.type.getSnappingPoint(info.props, otherPoint);
    step.target = {
      pointId: picture.snappingStore.getPointId(step.componentId, otherPoint),
      x: pt.x,
      y: pt.y
    };
  }
  return step;
};

/**
 * Handle scaling a component via a source point
 * @param  {Object} picture        The picture we are drawing
 * @param  {Object} step           The scale step
 * @param  {Number} options.deltaX The delta x movement of the control point
 * @param  {Number} options.deltaY The delta y movement of the control point
 * @return {Object} The updated step
 */
export function onScale(picture, step, { deltaX, deltaY }) {
  let scaleX, scaleY;
  if (step.source.pointId && step.target.pointId) {
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
      newHeight = Math.max(step.target.y - step.source.y - deltaY, 0);
    } else if (sourcePointName === "top right") {
      // deltaX is negative
      newWidth = Math.max(step.source.x + deltaX - step.target.x, 0);
      newHeight = Math.max(step.target.y - deltaY - step.source.y, 0);
    } else if (sourcePointName === "mid right") {
      newWidth = Math.max(step.source.x + deltaX - step.target.x, 0);
    } else if (sourcePointName === "bottom right") {
      newWidth = Math.max((step.source.x + deltaX - step.target.x), 0);
      newHeight = Math.max((step.source.y - step.target.y + deltaY), 0);
    } else if (sourcePointName === "bottom mid") {
      newHeight = Math.max((step.source.y + deltaY - step.target.y), 0);
    } else if (sourcePointName === "bottom left") {
      // deltaX is positive, deltaY is negative
      newWidth = Math.max((originalWidth - deltaX), 0);
      newHeight = Math.max((originalHeight + deltaY), 0);
    } else if (sourcePointName === "mid left") {
      // deltaX is positive
      newWidth = Math.max((step.target.x - step.source.x - deltaX), 0);
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
 * @param  {Number} options.x The x coordinate of the mouse pointer relative to canvas
 * @param  {Number} options.y The y coordinate of the mouse pointer relative to canvas
 * @return {Object} The updated step
 */
export function onScaleEnd(picture, step, { x, y } = {}) {
  // TODO: Tharun Handle the case of scale `until` a point, and also
  // scale until the dragged point meets a surface (i.e the intersection point with canvas
  // edges, line edges, rectangle edges etc.). So each drawing exposes points as well as edges (as line
  // segments.)
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
  if (step && step.source.pointId) {
    let pointId = step.source.pointId;
    let name = getPointNameFromPointId(pointId);
    let scaleX = step.scaleX === undefined ? 1 : step.scaleX;
    let scaleY = step.scaleY === undefined ? 1 : step.scaleY;
    let sourcePoint, targetPoint;
    let source = step.source;
    if (source.pointId) {
      // Then get the x and y coordinates from picture.snappingStore.
      let sourceInfo = picture.propStore.getInfo(getComponentIdFromPointId(source.pointId));
      sourcePoint = sourceInfo.type.getSnappingPoint(sourceInfo.props, getPointNameFromPointId(source.pointId));
    } else {
      sourcePoint = source;
    }
    let target = step.target;
    if (target) {
      if (target.pointId) {
        let targetInfo = picture.propStore.getInfo(getComponentIdFromPointId(target.pointId));
        targetPoint = targetInfo.type.getSnappingPoint(targetInfo.props, getPointNameFromPointId(target.pointId));
      } else {
        targetPoint = target;
      }
    } else {
      targetPoint = sourcePoint;
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
  }
};

export function getScalingStepSlots(info, sourcePoint, targetPoint, step) {
  let slots = [ {
    type: "text",
    value: "Scale"
  }, {
    type: "text",
    value: info.name
  } ];

  if (targetPoint.pointId !== undefined) {
    // so that sourcePoint meets targetPoint!
    slots = slots.concat([ {
      type: "text",
      value: "about"
    }, {
      type: "point",
      value: targetPoint
    }, {
      type: "text",
      value: "by"
    } ]);
  }

  if (step.scaleX !== undefined) {
    slots.push({
      type: "text",
      value: (step.scaleX).toFixed(3)
    });
  }

  if (step.scaleY !== undefined) {
    if (step.scaleX !== undefined) {
      slots.push({
        type: "text",
        value: ","
      });
    }
    slots.push({
      type: "text",
      value: (step.scaleY).toFixed(3)
    });
  }
  return slots;
};
