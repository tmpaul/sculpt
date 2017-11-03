import { EventEmitter } from "events";

class OperationStore extends EventEmitter {
  // ***********************************************
  // Constructor
  // ***********************************************
  constructor() {
    super();
    this.currentOperation = null;
    this.OPS = {
      DRAW: Symbol("DRAW"),
      MOVE: Symbol("MOVE"),
      SCALE: Symbol("SCALE")
    };
  }

  // ***********************************************
  // Public methods
  // ***********************************************
  notify(operation, args) {

  }

  getCurrentOperation() {
    return this.currentOperation;
  }

  clear() {
    this.currentOperation = null;
  }

  setCurrentOperation(operation, args) {
    this.currentOperation = {
      operation,
      args
    };
    // let found = false;
    // Object.keys(this.OPS).forEach((k) => {
    //   if (operation === this.OPS[k]) {
    //     found = true;
    //   }
    // });
    // if (!found) {
      
    // }
    // this.currentOperation = operation;
  }
}

export default new OperationStore();
