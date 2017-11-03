/**
 * A class that represents a tree of steps.
 * A node with children is a looping step.
 * @class
 */
export default class StepTree {
  constructor(step) {
    this._step = step;
    this._children = [];
    // id of the step is the node's position in tree joined with `.`
    // e.g "0.1", "0.2.1" where "0" represents root node.
    this._id = "0";
    // The BFS index
    this._index = 0;
  }

  // *********************************************************
  // Public methods
  // *********************************************************
  /**
   * Return the current active step
   * @return {step} Current step
   */
  getCurrentStep() {
    return this._getStepById(this._index);
  }

  updateCurrentStep(partialStep) {
    let currentStep = this._getStepById(this._index);
    currentStep = Object.assign({}, currentStep, partialStep);
    this._updateStep(currentStep, currentStep._id);
    return currentStep;
  }

  // *********************************************************
  // Private methods
  // *********************************************************
  _getStepById(id, subtree) {
    subtree = subtree || this;
    if (subtree._index === id) {
      return subtree._step;
    } else if (subtree && subtree.children && subtree.children.length) {
      for (let i = 0; i < subtree._children.length; i++) {
        let result = this._getStepById(id, subtree._children[i]);
        if (result) {
          // Break and return early
          return result._step;
        }
      } 
    }
  }

  _insertStep(step, parentId) {
    // Given a step, we need to know which node to insert into
    let idParts = parentId.split(".");
    let node = this;
    idParts.slice(1).forEach((part) => {
      if (node && node.children) {
        node = node.children[part];
      } else {
        // The parent node does not exist
        throw new Error("Parent node " + parentId + " does not exist");
      }
    });
    // Only create the children array if needed.
    node.children = node.children || [];
    let lastChild = node.children[node.children.length - 1];
    node.children.push({
      "_step": step,
      "_index": lastChild._index + 1,
      "_id": parentId + "." + lastChild.length
    });
    return parentId + "." + lastChild.length;
  }
};
