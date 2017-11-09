import { EventEmitter } from "events";

export default class ParametersStore extends EventEmitter {

  // ***********************************************
  // Static fields
  // ***********************************************

  // ***********************************************
  // Constructor
  // ***********************************************
  constructor() {
    super();
    this.parameters = [];
  }

  // ***********************************************
  // Public methods
  // ***********************************************
  getParameterByIndex(index) {
    return this.parameters[index];
  }

  setParameter(index, parameter) {
    this.parameters[index] = parameter;
    this.emit("PARAMETERS_EVENT_CHANGE");
  }

  getParameters() {
    return this.parameters;
  }

  addChangeListener(callback) {
    this.on("PARAMETERS_EVENT_CHANGE", callback);
  }

  removeChangeListener(callback) {
    this.removeListener("PARAMETERS_EVENT_CHANGE", callback);
  }
};
