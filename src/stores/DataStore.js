import { EventEmitter } from "events";

export default class DataStore extends EventEmitter {

  // ***********************************************
  // Static fields
  // ***********************************************

  // ***********************************************
  // Constructor
  // ***********************************************
  constructor() {
    super();
    this.data = [ [
      1,2,3,4,5,6
    ] ];
    this.rowVars = [
      "items"
    ];
    this.activeIndex = 0;
  }

  // ***********************************************
  // Public methods
  // ***********************************************
  getData() {
    return this.data;
  }

  getItemCount() {
    return this.data[0] ? this.data[0].length : 0;
  }

  getActiveIndex() {
    return this.activeIndex;
  }

  setActiveIndex(index) {
    this.activeIndex = index;
    this.emit("DATA_EVENT_CHANGE");
  }

  getRowVariables() {
    return this.rowVars;
  }

  getRowVariableByIndex(index) {
    return this.rowVars[index];
  }

  setRowVariables(value) {
    this.rowVars = value;
    this.emit("DATA_EVENT_CHANGE");
  }

  setData(value) {
    this.data = value;
    this.emit("DATA_EVENT_CHANGE");
  }

  updateRowVariable(index, name) {
    this.rowVars[index] = name;
    this.emit("DATA_EVENT_CHANGE");
  }

  addChangeListener(callback) {
    this.on("DATA_EVENT_CHANGE", callback);
  }

  removeChangeListener(callback) {
    this.removeListener("DATA_EVENT_CHANGE", callback);
  }
};
