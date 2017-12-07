import { INSERT_COMPONENT, ADJUST_COMPONENT, SEED_STEP, STEP_LOOP } from "mutation-types/MutationTypes";
import { getSelectedComponentIds, isGuide } from "selectors/ComponentSelectors";

export default function toolbarMutationsGenerator(event, state = {}) {
  switch (event.type) {
    case "DRAW":
      // Update op store operation
      return [ {
        type: INSERT_COMPONENT,
        payload: {
          componentType: event.payload
        }
      } ];
    case "MOVE":
    case "SCALE":
    case "ROTATE":
      return [ {
        type: ADJUST_COMPONENT,
        payload: event.type
      } ];
    case "GUIDE":
      // Find out all of the selected components
      let selectedComponentIds = getSelectedComponentIds(state);
      return selectedComponentIds.map((id) => {
        return {
          type: SEED_STEP,
          payload: {
            info: {
              guide: isGuide(state, id)
            }
          }
        };
      });
    case "LOOP":
      // For now, do not send an active payload. In the future, based on expression
      // bindings, we will be able to figure out the currently active dataset. It's
      // just a matter of setting it in server hydrated state.
      return [ {
        type: STEP_LOOP,
        payload: null
      } ];
  }
};
