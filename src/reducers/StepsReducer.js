import merge from "deepmerge";
import clone from "clone";

import { isObject } from "utils/TypeUtils";

/**
 * @module StepsReducer
 */

/**
 * Create a regular step and apply it to steps state
 *
 * @function createRegularStep
 * @memberOf Reducers
 * 
 * @param  {Object} state     The state slice corresponding to steps
 * @param  {Object} payload   The object containing step to create
 * @param  {Object} rootState The entire rootState of the application
 * @return {Object}           Updated state with new step created
 */
export function createRegularStep(state = {}, payload = {}, rootState = {}) {
  // Regular step insert
  let index = state.activeStepIndex === undefined ? - 1 : state.activeStepIndex;
  // Insert after index. If there is another entry,
  // then splice insert
  let steps = state.steps || [];
  let step = payload.step;
  if (!isObject(step)) {
    return state;
  }
  state.steps = steps.slice(0, index + 1)
    .concat([ { ...step } ])
    .concat(steps.slice(index + 1));
  state.activeStepIndex = index + 1;
  return state;
};

/**
 * Update a regular step and apply it to steps state
 *
 * @function updateRegularStep
 * @memberOf Reducers
 * 
 * @param  {Object} state     The state slice corresponding to steps
 * @param  {Object} payload   The index of the step and the step to update
 * @param  {Object} rootState The entire rootState of the application
 * @return {Object}           Updated state with new step created
 */
export function updateRegularStep(state = {}, payload = {}, rootState = {}) {
  // The payload should carry the index of the step to update. This
  // way there is no magic update using latest active step index.
  let index = payload.index;
  if (index === null || index === undefined || isNaN(payload.index)) {
    return state;
  }
  // Insert after index. If there is another entry,
  // then splice insert
  let steps = state.steps || [];
  let step = payload.step;
  if (!isObject(step)) {
    return state;
  }
  steps[index] = merge(steps[index], payload.step);
  state.steps = steps;
  return state;
};

/**
 * Remove a step from steps state
 *
 * @function abortStep
 * @memberOf Reducers
 * 
 * @param  {Object} state     The state slice corresponding to steps
 * @param  {Object} payload   The object containing the index of the step to remove
 * @param  {Object} rootState The entire rootState of the application
 * @return {Object}           Updated state with new step created
 */
export function abortStep(state = {}, payload = {}, rootState = {}) {
  let index = payload.index;
  if (index === null || index === undefined || isNaN(payload.index)) {
    return state;
  }
  let activeStepIndex = state.activeStepIndex === undefined ? - 1 : state.activeStepIndex;
  if (activeStepIndex === index) {
    activeStepIndex--;
  }
  let steps = state.steps || [];
  steps.splice(index, 1);
  state.activeStepIndex = activeStepIndex;
  state.steps = steps;
  return state;
};
