import { getTransformationMatrix } from "utils/TransformUtils";
import { getClosestSnappingPoint } from "selectors/points/SnapPointSelectors";

/**
 * @namespace Transformers
 */

/**
 * @module Transformers
 */


/**
 * Transform delta coordinates from move events into the component space.
 * The deltaX and deltaY values are from Canvas coordinate space, not
 * component space. In order to correctly calculate width, height etc,
 * the components need the deltas transformed into their coordinate space.
 *
 * @function componentSpaceTransformer
 * @memberOf Transformers
 
 * @param  {Object} payload            The event payload
 * @param  {Number} options.deltaX The delta movement in x direction
 * @param  {Number} options.deltaY The delta movement in y direction
 * @param  {Array}  transforms     An array of transforms that are applied to the element
 * @return {Object}                The transformed payload containing deltas in component space
 */
export function componentSpaceTransformer(payload = {}, transforms = []) {
  let { deltaX = 0, deltaY = 0 } = payload;
  if (transforms && transforms.length) {
    // The deltaX and deltaY provided need to be transformed into
    // the component space.
    let matrix = getTransformationMatrix(transforms).inverse();
    payload.deltaX = deltaX * matrix.a + deltaY * matrix.c;
    payload.deltaY = deltaX * matrix.b + deltaY * matrix.d;
  }
  return payload;
}

/**
 * A transformer that detects snapping points close to the event payload
 * coordinates
 *
 * @function snapPointTransformer
 * @memberOf Transformers
 *
 * @param  {Object} payload            The event payload
 * @param  {Number} payload.x          The x coordinate
 * @param  {Number} payload.y          The y coordinate
 * @param  {Number} payload.cycleIndex The cycling index in event payload. Allows user to
 *                                     cycle through overlapping snap points
 * @param  {Object} state              The editor state
 * @return {Object}                    Updated payload if a snapping point is found
 */
export function snapPointTransformer(payload = {}, state) {
  let { x, y, cycleIndex } = payload;
  let point = getClosestSnappingPoint(state, { x, y }, cycleIndex || 0);
  if (point) {
    // Do not mutate in place
    payload = { ...payload, ...point };
  }
  return payload;
};

