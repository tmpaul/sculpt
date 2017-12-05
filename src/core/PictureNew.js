import Canvas from "components/GroupComponents";

/**
 * A picture object is a container for holding the relevant state and set of procedural
 * steps involved in a drawing.
 */
class Picture {
  /**
   * The class constructor
   *
   * @param  {Object} initialRootState The initial root state to hydrate the picture with
   * @param  {Function} renderCallback The function to call to render the picture.
   */
  constructor(initialRootState = {}, renderCallback) {
    this._renderCallback = renderCallback;
    // The initial rootState.
    this._rootState = this._hydrateInitialState(initialRootState);
  }

  /**
   * A non public function that hydrates the internal root state.
   * TODO: This functions simply returns the initial state, does not
   * process it in any way.
   * 
   * @function _hydrateInitialState
   * 
   * @param  {Object} initialRootState The initial root state to hydrate internal root state
   * @return {Object}                  The hydrated root state
   */
  _hydrateInitialState(initialRootState) {
    return Object.assign({
      registry: {},
      snapPoints: [],
      steps: []
    }, initialRootState);
  }

  /**
   * Initialize the drawing surface with the provided props
   * 
   * @param  {Object} surfaceProps The initial set of properties to initialize the drawing surface
   */
  init(surfaceProps) {
    this.offsetX = surfaceProps.translateX || 0;
    this.offsetY = surfaceProps.translateY || 0;
    // Update _rootState to render a rectangle that will serve as painting surface
    // The component id is "0", which is the local component id.
    
    // We could've crafted a CREATE_STEP mutation to do this. But drawing the canvas itself
    // is special. We don't want that to be a step in the procedure. Therefore there is some
    // duplication here, but that's cool. It's just this one place
    this._rootState.registry["0"] = {
      id: "0",
      type: Canvas,
      props: surfaceProps,
      // Name will be used in steps
      name: "canvas"
    };
    // The registry will house the props, name, type and id of the component to be used.
    // This will feed in directly to the render layer.
    // rootNode -> Canvas, children -> [...ComponentNode, ...ComponentNode]
    // Update its snapping points as well
    this._rootState.snapPoints["0"] = Canvas.getSnappingPoints(surfaceProps);
  }

  /**
   * Public facing API function that when called will flush a virtual representation
   * to the actual rendering surface.
   * 
   * @return {Object} Virtual representation tree
   */
  render() {
    return (
      <Canvas {...this._getProps("0")}>
      </Canvas>
    );
  }

  /**
   * Return the props for a given componentId
   * 
   * @param  {String} componentId The component's id
   * @return {Object}             The props for the given componentId
   */
  _getProps(componentId) {
    return this._rootState.registry[componentId] || {};
  }
};

export default Picture;
