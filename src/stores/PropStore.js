import { ObjectUtils } from "utils/GenericUtils";

export default class PropStore {
  // ***********************************************
  // Constructor
  // ***********************************************
  constructor(stepUpdateCallback) {
    this._cache = {};
    this._callbacks = {};
    this.stepUpdateCallback = stepUpdateCallback;
  }

  /**
   * Clear cache for children
   */
  reset() {
    Object.keys(this._cache).forEach((key) => {
      if (key !== "0") {
        this._cache[key] = {};
      }
    });
  }

  remove(id) {
    delete this._cache[id];
  }

  /**
   * Get the complete information about a component given the id
   * @param  {String} componentRefId The id of the component in the tree
   * @return {Object}                Complete information about the component
   */
  getInfo(componentRefId) {
    // Get the complete info about component including selection state, props,
    // childType etc.
    return this._cache[componentRefId] || {};
  }

  /**
   * Run over each component in cache
   * @param  {Function} callback Function to call when iterating
   */
  iterate(callback) {
    Object.keys(this._cache).forEach((key) => {
      callback(key, this._cache[key]);
    });
  }

  /**
   * Return if a component is selected or not
   * @param  {String}  componentRefId The id of the component being queried
   * @return {Boolean}                True if selected else false
   */
  isSelected(componentRefId) {
    let info = this._cache[componentRefId];
    return info.mode === "select";
  }

  /**
   * Set the selection state of the given component to the given target value
   * @param {[type]} componentRefId [description]
   * @param {[type]} targetValue    [description]
   */
  setSelectionState(componentRefId, targetValue) {
    let info = this._cache[componentRefId];
    // Deselect every other component (We need multi-select implementation using 
    // Command key or shift key)
    this.iterate((id, info) => {
      if (this.isSelected(id)) {
        this._cache[id].mode = null;
      }
    });
    if (info) {
      info.mode = targetValue ? "select" : null;
    }
  }

  /**
   * Set the component's info in the tree
   * @param {String} componentRefId The component to set info for
   * @param {Object} info           The information to set for the given component
   * @return {Object}               The updated info
   */
  setInfo(componentRefId, info) {
    // Maybe do some validation checks here ?
    this._cache[componentRefId] = ObjectUtils.extend({}, this._cache[componentRefId] || {}, info);
    return this._cache[componentRefId];
  }

  /**
   * Get the props for a given component id in the tree
   * @param  {String} componentRefId The id of the component in the tree
   * @return {Object}                The props for the given component
   */
  getProps(componentRefId) {
    return (this._cache[componentRefId] || {}).props || {};
  }

  /**
   * Set the props for a given component id.
   * @param {String} componentRefId The component's id
   * @param {Object} props          The props to merge in
   * @return {Object}               The updated props
   */
  setProps(componentRefId, props) {
    if (!props) {
      return this._cache[componentRefId].props;
    }
    this._cache[componentRefId] = this._cache[componentRefId] || {};
    // Will merging functions work ? Test this theory.
    this._cache[componentRefId].props = ObjectUtils.extend({}, this._cache[componentRefId].props || {}, props);
    return this._cache[componentRefId].props;
  }

  onChange(componentRefId, callback) {
    this._callbacks[componentRefId] = callback;
  }

  removeCallback(componentRefId) {
    this._callbacks[componentRefId] = ObjectUtils.NOOP;
  }
};
