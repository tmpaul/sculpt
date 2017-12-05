/**
 * @namespace  Reducers
 */

import * as StepsReducer from "./StepsReducer";
import * as PointsReducer from "./PointsReducer";

let reducers = [ StepsReducer, PointsReducer ];

// Create root reducer for state slices
export default function applyReducers(rootState, mutation) {
  // Each reducer exports a series of actions that it will handle.
  let actionType = mutation.actionType;

  // For each of the reducers, check who can handle the action first.
  for (let reducer of reducers) {
    if (reducer.actionTypes.indexOf(actionType) !== -1) {
      // After handling return
      rootState[reducer.sliceKey] = 
        reducer.handleMutation(rootState[reducer.sliceKey] || {}, mutation, rootState);
      return rootState;
    }
  }
};
