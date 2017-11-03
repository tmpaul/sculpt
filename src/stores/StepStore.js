import { ObjectUtils } from "sculpt/utils/GenericUtils";
import { EventEmitter } from "events";
import clone from "clone";
import { changePointId } from "sculpt/utils/PointUtils";
import { AbortStep } from "sculpt/components/steps";

export default class StepStore extends EventEmitter {

  // ***********************************************
  // Static fields
  // ***********************************************

  // ***********************************************
  // Constructor
  // ***********************************************
  constructor(picture, stepEvaluator, loopStepEvaluator) {
    super();
    this.steps = [];
    this._index = -1;
    this._selected = [];
    this._loops = [];
    this.picture = picture;
    this.stepEvaluator = stepEvaluator;
    this.loopStepEvaluator = loopStepEvaluator;
  }

  // ***********************************************
  // Public methods
  // ***********************************************
  getCurrentStep() {
    return this.steps[this._index];
  }

  getCurrentIndex() {
    return this._nextInsertIndex;
  }

  getSteps(start, end) {
    return this.steps.slice(start === undefined ? 0 : start, end === undefined ? this.steps.length : end);
  }

  getComponentDrawStep(id) {
    for (let i = 0; i < this.steps.length; i++) {
      let step = this.steps[i];
      if (step.type === "DRAW" && step.componentId === id) {
        return step;
      }
    }
  }

  updateStepInfo(id, info) {
    // Find a DRAW step with componentId === id
    // this.steps.forEach((step) => {
    //   if (step.componentId === id && step.type === "DRAW") {
    //     step.info = {
    //       id: info.id,
    //       type: info.type,
    //       name: info.name
    //     };
    //   }
    // });
  }

  getLoopContext() {
    return this._currentLoopIndex !== undefined && this._currentLoopIndex !== null;
  }

  insertEvaluatedLoopSteps(loopStep, steps, endIndex) {
    this.steps = this.steps.slice(0, loopStep.startIndex)
      .concat(steps);
    if (endIndex < Infinity && endIndex > 0) {
      this._index = endIndex;
    } else {
      this._index = loopStep.endIndex;
    }
    this.notify();
  }

  remapStep(step, targetComponentId, existingComponentMap) {
    let componentMap = {
      [step.componentId]: targetComponentId
    };
    Object.keys(existingComponentMap).map((key) => {
      componentMap[existingComponentMap[key]] = key;
    });
    step.componentId = targetComponentId;
    switch (step.type) {
      case "DRAW":
        // Map points based on componentMap
        if (step.source && step.source.pointId) {
          step.source.pointId = changePointId(step.source.pointId, componentMap);
        }
        if (step.target && step.target.pointId) {
          step.target.pointId = changePointId(step.target.pointId, componentMap);
        }
        break;
      case "MOVE":
        if (step.source && step.source.pointId) {
          step.source.pointId = changePointId(step.source.pointId, componentMap);
        }
        if (step.target && step.target.pointId) {
          step.target.pointId = changePointId(step.target.pointId, componentMap);
        }
        break;
      case "SCALE":
        if (step.source.pointId) {
          step.source.pointId = changePointId(step.source.pointId, componentMap);
        }
        if (step.target.pointId) {
          step.target.pointId = changePointId(step.target.pointId, componentMap);
        };
        break;
    }
    return step;
  }

  updateCurrentStep(step) {
    if (step === AbortStep) {
      // Remove the current step
      this.steps = this.steps.slice(0, -1);
      this._index -= 1;
      return step;
    }

    // Get the index to insert the next step into
    let next = this._nextInsertIndex;

    // Check if we are trying to update within a `loop`
    if (this.getLoopContext()) {
      // Get the active looping step
      let loopStep = this._loops[this._currentLoopIndex];

      // Set the loop index on the current step
      step.loopIndex = loopStep.loopIndex;

      // Check if there is a `next` position is defined.
      if (next !== undefined && next !== null) {
        // Figure out the location to insert the step
        let insertLocation = next - (loopStep.startIndex + (loopStep.iteration - 1) * loopStep.steps.length);
        // Since a new step is going to be added everywhere across all iterations, +1 is
        // carried across all iterations
        next = next + loopStep.iteration - 1;
        // Find the closest previous step that is a DRAW step with same componentId
        // as this step.
        if (loopStep.iteration > 1) {
          // We need to re-map the step so that it is inserted correctly in the loop substep
          let firstComponentId;
          if (step.type === "DRAW") {
            firstComponentId = "0." + (Number(step.componentId.split(".")[1]) - (loopStep.iteration - 1));
          } else {
            // Simply wind back to first iteration and get its componentId
            let firstStep = this.steps[insertLocation + loopStep.startIndex - 1];
            firstComponentId = firstStep.componentId;
          }
          // Remap the componentId of step as well as `source` and `target` depending on the
          // type of the step.
          step = this.remapStep(step, firstComponentId, loopStep.componentMap);
        }
        // Insert the step at the right location
        loopStep.steps = loopStep.steps.slice(0, insertLocation).concat(step)
          .concat(loopStep.steps.slice(insertLocation));
        // Run the previous steps so that other iterations update.
        this._loops[this._currentLoopIndex] = loopStep;
        // Select all of the previous steps in each iteration and run until `next` index.
        this._selected = [];
        // Run and evaluate till `next` index, then render onto screen
        let steps = this.picture.runStepLoop(loopStep, loopStep.iteration, undefined, next);
        this.insertEvaluatedLoopSteps(loopStep, steps, next);
        this._selected = [ next ];
        this._nextInsertIndex = null;
      } else {
        let index = this._index;
        // Update the current step and all corresponding steps in previous iterations
        let substepIndex = index - (loopStep.startIndex + (loopStep.iteration - 1) * loopStep.steps.length);
        // If the step already exists such as from the `if` block above, then re-map the step
        // and merge in
        if (loopStep.steps[substepIndex] !== undefined) {
          step = this.remapStep(step, loopStep.steps[substepIndex].componentId, loopStep.componentMap);
          // step.componentId = "0.2";
          // step.info.id = "0.2";
          // step.drawing = false;
          // step.moving = false;
          // step.scaling = false;
        }
        // When setting it, do it as if we are doing it for the first component.
        loopStep.steps[substepIndex] = ObjectUtils.extend({}, loopStep.steps[substepIndex] || {}, step);
        // Run and evaluate till `next` index, then render onto screen
        let steps = this.picture.runStepLoop(loopStep, loopStep.iteration, undefined, index);
        this.insertEvaluatedLoopSteps(loopStep, steps, index);
        this.picture.evaluate(index);
      }
    } else if ((next !== undefined && next !== null)) {
      // We have to insert the step at this index and displace everybody after
      this.steps = this.steps.slice(0, next).concat(step)
        .concat(this.steps.slice(next));
      this._selected = [ next ];
      this._nextInsertIndex = undefined;
      this.picture.evaluate(next);
    } else {
      this.steps[this._index] = Object.assign({}, this.getCurrentStep() || {}, step);
    }
    this.emit("STEP_STORE_EVENT_CHANGE");
    return this.steps[this._index];
  }

  previousStep() {
    this._index--;
  }

  nextStep() {
    this._index++;
    // A step already exists here. Therefore make room for a new one
    // If inside a loop, then insert this step for all iterations.
    if (this.steps[this._index]) {
      this._nextInsertIndex = this._index;
    }
  }

  isSelected(index) {
    return this._selected.indexOf(index) !== -1;
  }

  getLoopStep(index) {
    return this._loops[index];
  }

  removeSteps(id) {
    this.steps = this.steps.filter((step) => {
      step.componentId !== id;
    });
    this._index = this.steps.length - 1;
  }

  removeStepsAfter(index) {
    this.steps = this.steps.slice(0, index);
    this._index = this.steps.length - 1;
  }

  runIteration(loopStepIndex, iteration) {
    if (iteration <= 0) {
      return;
    }
    let loopStep = this._loops[loopStepIndex];
    let steps = this.picture.runStepLoop(loopStep, iteration);
    this.insertEvaluatedLoopSteps(loopStep, steps);
    this.picture.emitChange();
    // if (iteration <= 1) {
    //   return;
    // }
    // // Run the steps in loopStep n number of times
    // // First evaluate until startIndex
    // let componentMap = {};
    // let propStore = this.picture.propStore;
    // let snappingStore = this.picture.snappingStore;
    // let picture = this.picture;
    // this.picture.evaluate(loopStep.startIndex - 1);
    // this.steps = this.steps.slice(0, loopStep.startIndex);
    // this._index = this.steps.length - 1;
    // loopStep.endIndex = loopStep.startIndex - 1;
    // loopStep.iteration = iteration;
    // for (let iter = 0; iter < iteration; iter++) {
    //   loopStep.steps.forEach((step) => {
    //     loopStep.endIndex++;
    //     step = ObjectUtils.extend({}, step);
    //     step.loopIndex = loopStep.loopIndex;
    //     // Run the step
    //     let componentId = step.componentId;
    //     // Get info from PropStore
    //     let info = propStore.getInfo(componentMap[componentId] || componentId);
    //     step.componentId = componentMap[componentId] || componentId;
    //     if (step.type === "DRAW") {
    //       step = picture.runStep(step, componentMap);
    //       // Any time componentId is encountered, in this local scope it will be replaced
    //       // with childId
    //       componentMap[componentId] = step.componentId;
    //     }
    //     if (step.type === "SCALE") {
    //       step.scaleY = Math.random();
    //       picture.runStep(step, componentMap);
    //     }
    //     if (step.type === "MOVE") {
    //       picture.runStep(step, componentMap);
    //     }
    //     this.nextStep();
    //     this.steps[this._index] = step;
    //   });
    // }
    // this._index = this.steps.length - 1;
    // this._loops[loopStep.loopIndex] = loopStep;
    // this.picture.emitChange();
  }

  toggleSelected(index) {
    let i = this._selected.indexOf(index);
    // // If there are any selected steps after `index`, remove them
    // this._selected = this._selected.filter((i) => {
    //   return i <= index;
    // });
    // if (i === -1) {
    //   this._selected.push(index);
    //   // If there are any selected steps below index and they are more than 1 index away
    //   // remove them
    //   this._selected = this._selected.filter((i) => {
    //     if (Math.abs(i - index) > 1) {
    //       return false;
    //     }
    //     return true;
    //   });
    //   this._selected.sort();
    //   this.stepEvaluator(index);
    // } else {
    //   this._selected.splice(i, 1);
    //   this._selected.sort();
    //   // Last previous selected
    //   if (this._selected.length === 0) {
    //     this.stepEvaluator(this.steps.length - 1);
    //   } else {
    //     this.stepEvaluator(this._selected[this._selected.length - 1]);
    //   }
    // }
    if (this.shiftKey) {
      // Allow multi-select with auto range coverage
      if (i === -1) {
        // Does not exist, add from min to max
        this._selected.push(index);
      } else {
        this._selected.splice(i, 1);
      }
      let min = Math.min.apply(null, this._selected);
      let max = Math.max.apply(null, this._selected);
      this._selected = [];
      for (let j = min; j <= max; j++) {
        this._selected.push(j);
      }
      if (this._selected.length === 0) {
        this.stepEvaluator(this.steps.length - 1);
      } else {
        this.stepEvaluator(this._selected[this._selected.length - 1]);
      }
    } else {
      if (this._selected[0] === index) {
        this._selected = [];
        this._index = this.steps.length - 1;
        this.stepEvaluator(this.steps.length - 1);
        this._currentLoopIndex = null;
      } else {
        this._selected = [ index ];
        if (this.steps[index].loopIndex !== undefined) {
          this._currentLoopIndex = this.steps[index].loopIndex;
          // Also select all steps across all iterations
          this._selected = [];
          let loopStep = this._loops[this._currentLoopIndex];
          // Get the index offset
          let offset = index - (loopStep.startIndex + loopStep.steps.length * (loopStep.iteration - 1));
          for (let i = 0; i <= loopStep.iteration; i++) {
            this._selected.push(offset + loopStep.steps.length * i + loopStep.startIndex);
          }
        } else {
          this._currentLoopIndex = null;
        }
        this._index = index;
        this.stepEvaluator(index);
      }
    }
    this.notify();
  }

  updateLoopStep(loopStep) {
    this._loops[loopStep.loopIndex] = loopStep;
  }

  runSelected(picture, updateCallback) {
    // Mark them as part of a loop step.
    let propStore = picture.propStore;
    let snappingStore = picture.snappingStore;
    let componentMap = {};
    // Roll back to the state before this._selected
    let min = Math.min.apply(null, this._selected);
    let max = Math.max.apply(null, this._selected);
    // Convert the set of selected steps into a looping step.
    // Then run a single iteration of the loop with relevant context.
    let selectedSteps = this._selected.map((i) => clone(this.steps[i]));
    // Reset to just before the max step so that one iteration is already done.
    // If the length of the bound data is 1, we stop there.
    // Create a loop step that wraps the selected steps into a loop block. This can be
    // done by creating a LOOP style step.
    let loopStep = {
      type: "LOOP",
      loopIndex: this._loops.length,
      // If user selects a step in between this range, then we are in loop context
      startIndex: min,
      // Store the endIndex
      endIndex: max,
      // 1 iteration is already complete, because the sub-steps have already executed
      iteration: 1,
      // These steps will act as templates
      steps: selectedSteps
    };
    // Insert this loopStep into loops
    this._loops.push(loopStep);
    // Mark the existing steps with current loopIndex, so that they will be grouped and shown
    for (let i = min; i <= max; i++) {
      this.steps[i].loopIndex = loopStep.loopIndex;
    }
    this._selected = [];
    // Really nothing happens other than LoopStep being updated. The real action occurs in
    // `runIteration`
    updateCallback();
  }

  getMinMaxSelectedSteps() {
    return {
      min: Math.min.apply(null, this._selected),
      max: Math.max.apply(null, this._selected)
    };
  }

  getSelectedSteps() {
    return this._selected.map((i) => this.steps[i]);
  }

  notify() {
    this.emit("STEP_STORE_EVENT_CHANGE"); 
  }

  addChangeListener(callback) {
    this.on("STEP_STORE_EVENT_CHANGE", callback);
  }

  removeChangeListener(callback) {
    this.removeListener("STEP_STORE_EVENT_CHANGE", callback);
  }
};
