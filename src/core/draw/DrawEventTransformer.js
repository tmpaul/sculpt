import { getClosestSnappingPoint } from "selectors/points/SnapPointSelectors";

/**
 * A transformer that detects snapping points close to the event payload
 * coordinates
 * @param  {Object} event   The event sent from the painting surface
 * @param  {Object} state   The editor state
 * @return {Object}         Event with updated payload if a snapping point is found
 */
export function snapPointTransformer(event, state) {
  let { x, y } = event.payload;
  let point = getClosestSnappingPoint(state, { x, y }, event.payload.cycleIndex || 0);
  if (point) {
    // Do not mutate in place
    event.payload = { ...event.payload, ...point };
  }
  return event;
};
