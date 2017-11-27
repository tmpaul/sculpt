import { CREATE_STEP, UPDATE_STEP, 
  HIGHLIGHT_POINT, SHOW_SNAPPING_POINTS } from "mutation-types/MutationTypes";

/**
 * Handle drawing a component based on input event
 * @param  {Object} step              The step object representing the draw operation.
 *                                    It is undefined if the object is not yet drawn on
 *                                    screen
 * @param  {Object} event             The event raised from canvas
 * @param  {Function} componentType   The type of component being drawn
 * @return {Array}                    The list of intended mutations
 */
export default function handleDraw(step, event = {}, componentType) {
  let mutations = [];
  switch (event.type) {
    case "CANVAS_DRAG_START":
      return handleDrawStart(step, event, componentType);
    default:
      return mutations;
  }
};

/**
 * Handle drawing a component based on input event
 * @param  {Object} step              The step object representing the draw operation.
 *                                    It is undefined if the object is not yet drawn on
 *                                    screen
 * @param  {Object} event             The event raised from canvas
 * @param  {Function} componentType   The type of component being drawn
 * @return {Array}                    The list of intended mutations
 */
function handleDrawStart(step, event, componentType) {
  let mutations = [];
  mutations.push({
    type: SHOW_SNAPPING_POINTS
  });
  // We will do this for DRAWING. All but the one that is being inserted. State
  // tree is fine, but we want state portions to be updated by pure functions.
  if (event.payload && event.payload.pointId) {
    mutations.push({
      type: HIGHLIGHT_POINT,
      payload: event.payload.pointId
    });
  }
  let updatedStep = componentType.onDrawStart(step ? step : {
    type: "DRAW",
    info: {
      type: componentType
    },
    active: true
  }, event.payload);
  // Create a new step if step is undefined. Otherwise re-use step
  if (step === undefined) {
    mutations.push({
      type: CREATE_STEP,
      payload: updatedStep
    });
  } else {
    mutations.push({
      type: UPDATE_STEP,
      payload: updatedStep
    });
  }
  // StepsReducer will apply and update this step.
  return mutations;
}

/**
 * Handle drawing a component based on input event
 * @param  {Object} step              The step object representing the draw operation.
 *                                    It is undefined if the object is not yet drawn on
 *                                    screen
 * @param  {Object} event             The event raised from canvas
 * @param  {Function} componentType   The type of component being drawn
 * @return {Array}                    The list of intended mutations
 */
function handleDrawing(step, event, componentType) {
  let mutations = [];
  // We will do this for DRAWING. All but the one that is being inserted. State
  // tree is fine, but we want state portions to be updated by pure functions.
  if (event.payload && event.payload.pointId) {
    mutations.push({
      type: HIGHLIGHT_POINT,
      payload: event.payload.pointId
    });
  }
  let updatedStep = componentType.onDrawStart(step ? step : {
    type: "DRAW",
    info: {
      type: componentType
    },
    active: true
  }, event.payload);
  // Create a new step if step is undefined. Otherwise re-use step
  if (step === undefined) {
    mutations.push({
      type: CREATE_STEP,
      payload: updatedStep
    });
  } else {
    mutations.push({
      type: UPDATE_STEP,
      payload: updatedStep
    });
  }
  // StepsReducer will apply and update this step.
  return mutations;
}
