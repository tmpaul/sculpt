import merge from "deepmerge";
import clone from "clone";

import { isObject } from "utils/TypeUtils";

/**
 * @module PointsReducer
 */


/**
 * Highlight the point sent in via the payload
 *
 * @function highlightPoint
 * @memberOf Reducers
 * 
 * @param  {Object} state     The state slice corresponding to snap points
 * @param  {Object} payload   The mutation payload
 * @param  {Object} rootState The root state of the application
 * @return {Object}           Updated state
 */
export function highlightPoint(state = {}, payload = {}, rootState = {}) {
  let pointId = payload.pointId;
  if (pointId) {
    state.highlightedPoint = pointId;
  }
  return state;
};

/**
 * Show all of the snapping points
 *
 *
 * @function showSnappingPoints
 * @memberOf Reducers
 * 
 * @param  {Object} state     The state slice corresponding to snap points
 * @param  {Object} payload   The mutation payload
 * @param  {Object} rootState The root state of the application
 * @return {Object}           The updated state
 */
export function showSnappingPoints(state = {}, payload = {}, rootState = {}) {
  state.showSnappingPoints = true;
  return state;
};

/**
 * Hide the snapping points
 *
 * @function hideSnappingPoints
 * @memberOf Reducers
 * 
 * @param  {Object} state     The state slice corresponding to snap points
 * @param  {Object} payload   The mutation payload
 * @param  {Object} rootState The root state of the application
 * @return {Object}           The updated state
 */
export function hideSnappingPoints(state = {}, payload = {}, rootState = {}) {
  state.showSnappingPoints = false;
  return state;
};
