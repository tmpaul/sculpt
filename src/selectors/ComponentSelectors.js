/**
 * @module ComponentSelectors
 */

/**
 * Given root state return all the ids of all selected components
 *
 * @function getSelectedComponentIds
 * @memberOf Selectors
 * 
 * @param  {Object} state The root state of the picture
 * @return {Array}        The list of component ids
 */
export function getSelectedComponentIds(state = {}) {
  let registry = state.registry || {};
  return Object.keys(registry).filter(function(key) {
    return registry[key].info.selected;
  });
};


/**
 * Test if a given component is a guide
 * 
 * @param  {Object}  state The root state object
 * @param  {String}  id    The id of the component to check for
 * @return {Boolean}       True if it is a guide
 */
export function isGuide(state, id) {
  let registry = state.registry || {};
  let properties = registry[id] || {
    info: {}
  };
  return properties.info.guide === true;
}
