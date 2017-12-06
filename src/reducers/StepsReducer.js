import merge from "deepmerge";

import { isObject } from "utils/TypeUtils";

/**
 * Return early if payload does not contain step index
 * 
 * @param  {Object} payload The object containing step index
 * @return {Boolean}        True if index is well formed, False otherwise
 */
function earlyReturn(payload) {
  let index = payload.index;
  if (index === null || index === undefined || isNaN(payload.index)) {
    return true;
  }
  return false;
}

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
  if (earlyReturn(payload)) {
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
  if (earlyReturn(payload)) {
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

/**
 * Seed a DRAW step with information on the components such as name,
 * info, guide mode, selected etc.
 *
 * @function seedStep
 * @memberOf Reducers
 * 
 * @param  {Object} state   The root state object
 * @param  {Object} payload The payload containing step index and seed info
 * @return {Object}         The updated root state object
 */
export function seedStep(state = {}, payload = {}) {
  if (!payload.componentId) {
    return state;
  }
  if (!isObject(payload.info)) {
    return state;
  }
  // Get the corresponding DRAW step
  let steps = state.steps;
  let len1 = steps.length, len2 = 0;
  let targetStep;
  for (let i = 0; i < steps.length; i++) {
    let step = steps[i];
    // This is a LOOP_STEP, iterate over its substeps and check
    if (step.type === "LOOP_STEP") {
      len2 = step.steps.length;
      for (let j = 0; j < len2; j++) {
        let substep = step.steps[j];
        if (substep.componentId === payload.componentId && substep.type === "DRAW") {
          // Update subStep
          substep.info = merge(substep.info || {}, payload.info);
          break;
        }
      }
    } else if (step.componentId === payload.componentId && step.type === "DRAW") {
      step.info = merge(step.info || {}, payload.info);
      break;
    }
  }
  return state;
};
