import { ObjectUtils } from "utils/GenericUtils";
import { EventEmitter } from "events";
import clone from "clone";
import { changePointId } from "utils/PointUtils";
import { AbortStep } from "components/steps";

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
    return this._nextInsertIndex >= 0 ? this._nextInsertIndex : this._index;
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
    let componentMap = {};
    if (targetComponentId) {
      componentMap[step.componentId] = targetComponentId;
      step.componentId = targetComponentId;
    }
    Object.keys(existingComponentMap).map((key) => {
      componentMap[existingComponentMap[key]] = key;
    });
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
      case "ROTATE":
        if (step.source && step.source.pointId) {
          step.source.pointId = changePointId(step.source.pointId, componentMap);
        }
        if (step.target && step.target.pointId) {
          step.target.pointId = changePointId(step.target.pointId, componentMap);
        }
        break;
      case "SCALE":
        if (step.source && step.source.pointId) {
          step.source.pointId = changePointId(step.source.pointId, componentMap);
        }
        if (step.target && step.target.pointId) {
          step.target.pointId = changePointId(step.target.pointId, componentMap);
        };
        break;
    }
    return step;
  }


  seedStep(componentId, info) {
    this.steps.forEach((step, i) => {
      if (step.componentId === componentId && step.type === "DRAW") {
        // There are two options: either its part of a loop step,
        // or it is a plain step.
        if (step.loopIndex !== undefined) {
          // Then update all steps that are looped across iterations
          let loopStep = this.getLoopStep(step.loopIndex);
          // Find out all of steps corresponding to this step.
          // 0 1 2 3 4 5 6 7
          let subStepIndex = (i - loopStep.startIndex) % (loopStep.steps.length);
          for (let iter = 0; iter < loopStep.iteration; iter ++) {
            let k = loopStep.startIndex + subStepIndex + iter * (loopStep.steps.length);
            this.steps[k].info = ObjectUtils.extend({}, this.steps[k].info, info);
          }
        } else {
          step.info = ObjectUtils.extend({}, step.info, info);
        }
      }
    });
  }

  seedStepProps(componentId, props) {
    this.steps.forEach((step, i) => {
      if (step.componentId === componentId && step.type === "DRAW") {
        // There are two options: either its part of a loop step,
        // or it is a plain step.
        if (step.loopIndex !== undefined) {
          // Then update all steps that are looped across iterations
          let loopStep = this.getLoopStep(step.loopIndex);
          // Find out all of steps corresponding to this step.
          // 01 2 3 4 5 6 7
          let subStepIndex = (i - loopStep.startIndex) % (loopStep.steps.length);
          loopStep.steps[subStepIndex].initialProps = ObjectUtils.extend({}, loopStep.steps[subStepIndex].initialProps, props);
          for (let iter = 0; iter < loopStep.iteration; iter ++) {
            let k = loopStep.startIndex + subStepIndex + iter * (loopStep.steps.length);
            this.steps[k].initialProps = ObjectUtils.extend({}, this.steps[k].initialProps, props);
          }
        } else {
          step.initialProps = ObjectUtils.extend({}, step.initialProps, props);
        }
      }
    });
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
            // Count the number of DRAW steps in loopSteep
            let drawStepCount = loopStep.steps.filter((step) => step.type === "DRAW").length;
            firstComponentId = "0." + (Number(step.componentId.split(".")[1]) - (loopStep.iteration - 1) * drawStepCount);
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
        this.picture.evaluate(next);
        this._selected = [ next ];
        this._nextInsertIndex = null;
      } else {
        let index = this._index;
        // Update the current step and all corresponding steps in previous iterations
        let substepIndex = index - (loopStep.startIndex + (loopStep.iteration - 1) * loopStep.steps.length);
        let fresh = true;
        if (loopStep.steps[substepIndex] && loopStep.componentMap[loopStep.steps[substepIndex].componentId] === step.componentId) {
          // We already inserted the step, do not set _index.
          fresh = false;
        }
        if (fresh) {
          // Grand new entry
          if (loopStep.iteration > 1) {
            // We need to re-map the step so that it is inserted correctly in the loop substep
            let firstComponentId;
            if (step.type === "DRAW") {
              // Count the number of DRAW steps in loopSteep
              let drawStepCount = loopStep.steps.filter((step) => step.type === "DRAW").length;
              firstComponentId = "0." + (Number(step.componentId.split(".")[1]) - (loopStep.iteration - 1) * drawStepCount);
            } else {
              // There is no equivalent step in first iteration, we need to map the current
              // componentId
              let reverseComponentMap = {};
              Object.keys(loopStep.componentMap).map((key) => {
                reverseComponentMap[loopStep.componentMap[key]] = key;
              });
              firstComponentId = reverseComponentMap[step.componentId];
            }
            // Remap the componentId of step as well as `source` and `target` depending on the
            // type of the step.
            step = this.remapStep(step, firstComponentId, loopStep.componentMap);
          }
        } else {
          // We need to re-map the step so that it is inserted correctly in the loop substep
          step = this.remapStep(step, loopStep.steps[substepIndex].componentId, loopStep.componentMap); 
        }
        // When setting it, do it as if we are doing it for the first component.
        loopStep.steps[substepIndex] = ObjectUtils.extend({}, loopStep.steps[substepIndex] || {}, step);
        let newIndex = (index + loopStep.iteration - 1);
        // Run and evaluate till `next` index, then render onto screen
        let steps = this.picture.runStepLoop(loopStep, loopStep.iteration, undefined, fresh ? newIndex : index);
        // Only upto index is inserted
        this.insertEvaluatedLoopSteps(loopStep, steps, fresh ? newIndex : index);
        this._selected = [ fresh ? newIndex : index ];
        this.picture.evaluate(fresh ? newIndex : index);
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
  }

  toggleSelected(index) {
    let i = this._selected.indexOf(index);
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
      // The iteration is 0
      iteration: picture.dataStore.getItemCount(),
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
    this.runIteration(loopStep.loopIndex, loopStep.iteration);
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
