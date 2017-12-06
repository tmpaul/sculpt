/**
 * @module OperationsReducer
 */

/**
 * A reducer that updates root state depending on toolbar insert component
 * mutation
 *
 * @function markComponentInsertion
 * @memberOf Reducers
 * 
 * @param  {Object} state   The root state of the picture
 * @param  {Object} payload The event payload
 *
 * @throws {Error} If componentType is empty or not a function
 * @return {Object}         Updated root state
 */
export function markComponentInsertion(state = {}, payload) {
  let componentType = payload.componentType;
  // Assert that it is function (React.Component)
  if (typeof componentType !== "function") {
    throw new Error("Expected component type to be a function. Instead got " + JSON.stringify(componentType));
  }
  // We do not really insert the component here. That is done by the DRAW step.
  // Here we simply earmark the picture global state to insert the right kind of
  // component when a draw operation is started.
  if (state.operations && state.operations.activeOperationType === "DRAW") {
    state.operations = {};
  } else {
    state.operations = {
      componentToBeInserted: componentType,
      activeOperationType: "DRAW"
    };
  }
  return state;
};

const adjustmentReducerGeneratorScope = {};

/**
 * A reducer that sets up a move operation
 *
 * @function moveComponent
 * @memberOf Reducers
 * 
 * @param  {Object} state   The root state
 * @return {Object}         The updated root state
 */
export function moveComponent(state = {}) {
  return adjustmentReducerGenerator.call(adjustmentReducerGeneratorScope, "MOVE")(state);
};


/**
 * A reducer that sets up a scale operation
 *
 * @function scaleComponent
 * @memberOf Reducers
 * 
 * @param  {Object} state   The root state
 * @return {Object}         The updated root state
 */
export function scaleComponent(state = {}) {
  return adjustmentReducerGenerator.call(adjustmentReducerGeneratorScope, "SCALE")(state);
};

/**
 * A reducer that sets up a rotate operation
 *
 * @function rotateComponent
 * @memberOf Reducers
 * 
 * @param  {Object} state   The root state
 * @return {Object}         The updated root state
 */
export function rotateComponent(state = {}) {
  return adjustmentReducerGenerator.call(adjustmentReducerGeneratorScope, "ROTATE")(state);
};


/**
 * Non public function which generates the reducers for move, scale, rotate
 * etc
 *
 * @function adjustmentReducerGenerator
 * 
 * @param  {String} op The operation to generate a reducer for
 * @return {Function}    A reducer function
 */
function adjustmentReducerGenerator(op) {
  if (this[op] === undefined) {
    let func = function(state = {}) {
      if (state.operations && state.operations.activeOperationType === op) {
        // Cancel the move operation
        state.operations = {};
        return state;
      }
      state.operations = {
        activeOperationType: op
      };
      return state;
    };
    Object.defineProperty(func, "name", {
      value: op.toLowerCase() + "Component"
    });
    this[op] = func;
    return func;
  } else {
    return this[op];
  }
}
