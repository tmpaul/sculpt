import { EventEmitter } from "events";

class EventStore extends EventEmitter {

  // ***********************************************
  // Static fields
  // ***********************************************

  // ***********************************************
  // Constructor
  // ***********************************************
  constructor() {
    super();
    this.event = {};
  }

  // ***********************************************
  // Public methods
  // ***********************************************
  notify(event) {
    this.event = event;
    this.emit("EVENT_CHANGE", this.event);
  }

  addChangeListener(callback) {
    this.on("EVENT_CHANGE", callback);
  }

  removeChangeListener(callback) {
    this.removeListener("EVENT_CHANGE", callback);
  }
}

export default new EventStore();
