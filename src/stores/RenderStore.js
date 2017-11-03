export default class RenderStore {
  constructor(rootId, propStore, callback) {
    this.rootId = rootId || "0";
    this.children = [];
    this.propStore = propStore;
    this.callback = callback;
  }

  insertChild(componentType) {
    let componentId = "0." + this.children.length;
    // Count number of Rectangles already
    let count = this.state.children
      .filter((componentId) => this.propStore.getInfo(componentId).type === componentType).length;
    // Get da name.
    let name = componentType.displayName + (count + 1);
    this.children.push({
      id: componentId,
      name: componentType.displayName + (count + 1),
      drawing: true,
      type: componentType,
      props: {}
    });
    this.notify();
  }

  notify() {
    this.callback(this.children);
  }
};
