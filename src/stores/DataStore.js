import { EventEmitter } from "events";

function average(args) {
  let sum = 0;
  args.forEach((arg) => {
    sum += arg;
  });
  return sum / args.length;
}

const statNames = {
  "min": "Minimum of ",
  "max": "Maximum of ",
  "# of items": "Number of ",
  "average": "Average of "
};

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
    return this.rowVars.map((rowVar, index) => {
      return this.getRowVariableByIndex(index);
    });
  }

  getRowVariableByIndex(index) {
    let rowVar = this.rowVars[index];
    return {
      name: rowVar,
      stats: [ "min", "max", "average", "# of items" ].map((stat) => {
        return {
          name: statNames[stat] + rowVar,
          type: stat,
          value: this.getRowVariableStatistic(index, stat)
        };
      }) 
    };
  }

  getRowVariableStatistic(index, statVariable) {
    let dataRow = this.data[index];
    switch (statVariable) {
      case "min":
        return Math.min.apply(null, dataRow);
      case "max":
        return Math.max.apply(null, dataRow);
      case "average":
        return average(dataRow);
      case "# of items":
        return dataRow.length;
    }
  }

  getRowVariableStatisticLabel(index, statVariable) {
    return statNames[statVariable] + this.rowVars[index];
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
