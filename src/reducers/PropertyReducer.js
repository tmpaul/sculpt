// PropertyReducer operates on the `props` sent down to
// each component. A component will receive `props` and
// pass it to individual components.
export default function PropertyReducer(state = {}, action) {
  switch (action.type) {
    case "UPDATE_PROPERTY": {
      return {
        [action.id]: {
          props: Object.assign({}, state[action.id].props || {}, {
            [action.id]: action.props
          })
      }
    }
  }
};
