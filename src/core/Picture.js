import React from "react";
import { debounce, throttle, ObjectUtils } from "utils/GenericUtils";
import clone from "clone";

import Canvas from "components/GroupComponents";
import SnapPoints from "components/SnapPoints";
import Store from "components/Store";

import PropetyPanelStore from "stores/PropertyPanelStore";
import StepStore from "stores/StepStore";
import PropStore from "stores/PropStore";
import SnappingStore from "stores/SnappingStore";
import DataStore from "stores/DataStore";
import ParametersStore from "stores/ParametersStore";
import EventStoreSingleton from "stores/EventStore";
import OperationStoreSingleton from "stores/OperationStore";
import { getComponentIdFromPointId, getPointNameFromPointId,
  getPointId, changePointId } from "utils/PointUtils";
import { getTransformationMatrix } from "utils/TransformUtils";

import drawMutationsGenerator from "core/draw/DrawEventHandler";
import { snapPointTransformer } from "core/draw/DrawEventTransformer";
import { AbortStep } from "components/steps";
import memoize from "memoizee";

/**
 * A picture represents a series of procedural steps for drawing
 * a `picture` onto the canvas. Each picture can be composed of
 * several components, which in turn can be pictures themselves.
 * @class
 */
export default class Picture {
  // *********************************************************
  // Constructor
  // *********************************************************
  constructor(editing, callback) {
    // A boolean prop that decides if picture is in edit mode.
    this.editing = editing;
    this.callback = callback;
    // The render tree
    this.children = [];
    // Store steps in a StepStore
    this.stepStore = new StepStore(this, (step) => {
      this.evaluate(step);
      this.emitChange();
    }, (loopStep, iteration, terminationIndex) => {
      this.runStepLoop(loopStep, iteration, undefined, terminationIndex);
    });
    // All the properties for its subcomponents are stored in PropStore
    this.propStore = new PropStore(this.stepStore.updateStepInfo.bind(this.stepStore));
    this.parametersStore = new ParametersStore();
    // Subscribe
    this.parametersStore.addChangeListener(() => {
      this.evaluate(this.stepStore.getCurrentIndex());
      this.emitChange();
    });
    this.dataStore = new DataStore();
    this.dataStore.addChangeListener(() => {
      this.evaluate(this.stepStore.getCurrentIndex());
      this.emitChange();
    });
    // A store for storing all the snapping points
    this.snappingStore = new SnappingStore(this.propStore);
    // Listen for events on EventStore
    this.handleEvent = this.handleEvent.bind(this);
    this.notify = this.notify.bind(this);
    this.handleEventStoreChange = this.handleEventStoreChange.bind(this);
    EventStoreSingleton.addChangeListener(this.handleEventStoreChange);
    // this.runStep = memoize(this.runStep);
    this.handleEventStoreChange = throttle(this.handleEventStoreChange, 16, this);
    this.debouncedPointSnap = debounce(this.debouncedPointSnap.bind(this), 100);
  }

  handleEventStoreChange(event) {
    if (event.type === "SELECT") {
      let id = event.source;
      if (!this.propStore.isSelected(id)) {
        this.propStore.setSelectionState(id, true);
      } else {
        this.propStore.setSelectionState(id, false);
      }
      let info = this.propStore.getInfo(id);
      // Update the draw step corresponding to this
      this.stepStore.seedStep(id, {
        mode: info.mode
      });
      return this.emitChange();
    }
    if (event.type === "PROPERTIES") {
      let id = event.source;
      // Show a context menu for the relevant component at event.x, event.y
      let info = this.propStore.getInfo(id);
      if (id && info.type) {
        // Call propertyPanel (which is a ref passed from EditorPage)
        // Get root info
        // let rootProps = this.propStore.getProps("0");
        let { x, y } = event.payload;
        // if (x > rootProps.width / 2) {
        //   x = x - rootProps.width / 2;
        // }
        // if (y > rootProps.height / 2) {
        //   y = y - rootProps.height / 2;
        // }
        // Only show the props that user wants to change via prop panel
        let editableProps = {};
        info.type.editablePropKeys.forEach((propKey) => {
          editableProps[propKey] = info.props[propKey];
        });
        PropetyPanelStore.show(id, editableProps, info.type, {
          x, y
        }, (id, newProps) => {
          // Insert them as initialProps on the DRAw step
          let step = this.stepStore.getComponentDrawStep(id);
          // Set onto initialProps
          // step.initialProps = ObjectUtils.extend({}, step.initialProps || {}, newProps);
          this.stepStore.seedStepProps(id, newProps);
          // Re-run all steps until
          this.evaluate(this.stepStore.getCurrentIndex());
          this.emitChange();
        });
      }
      return;
    }
    // Get current operation
    let currentOperation = OperationStoreSingleton.getCurrentOperation();
    if (!currentOperation) {
      return;
    }
    let updatedStep;
    if (currentOperation.operation === OperationStoreSingleton.OPS.DRAW) {
      // // Run the event through transformers
      // let transformers = [ snapPointTransformer ];
      // transformers.forEach(function(transformer) {
      //   event = transformer(event);
      // });
      // let mutations = drawMutationsGenerator(this.stepStore.getCurrentStep(), event, currentOperation.args);
      // if (event.type === "CANVAS_DRAG_START") {
      //   // For now let's store the activeTransaction on Picture
      //   this.activeTransaction = new Transaction(this.rootState, mutations);
      // } else {
      //   this.activeTransaction.addMutations(mutations);
      // }
      // // If there is an ABORT_STEP it will automatically roll back the step
      // // Another example of transaction is Selecting a SCALE OP
      // this.flushUpdates(this.activeTransaction.applyMutations());
      // // Apply the reducers to get the new root state. The mutations are applied to transaction block.
      // transaction.addMutations(mutations);
      // let newRootState = transaction.applyMutations();
      // // Replace rootState and flush changes
      // console.log();
      updatedStep = this.handleDrawing(event, currentOperation.args);
    } else if (currentOperation.operation === OperationStoreSingleton.OPS.MOVE) {
      updatedStep = this.handleMoving(event);
    } else if (currentOperation.operation === OperationStoreSingleton.OPS.SCALE) {
      updatedStep = this.handleScaling(event);
    } else if (currentOperation.operation === OperationStoreSingleton.OPS.ROTATE) {
      updatedStep = this.handleRotating(event);
    }
    if (!updatedStep) {
      return;
    }
    // Simply update the step
    updatedStep = this.stepStore.updateCurrentStep(updatedStep);
    this.emitChange();
  }

  debouncedPointSnap(event, selfPoint, step) {
    if (event.debounced) {
      return;
    }
    event.debounced = true;
    // We need to prevent a scenario where the point we are locking onto does not exist,
    // this happens when the step is part of a loop, and we should not look at matching
    // points that are not in the loopStep steps.componentId.
    let blacklist = selfPoint ? [ step.componentId ] : [];
    if (step.loopIndex >= 0) {
      let loopStep = this.stepStore.getLoopStep(step.loopIndex);
      blacklist = blacklist.concat(Object.keys(loopStep.componentMap)
        .map((k) => loopStep.componentMap[k]));
    }
    let point = this.snappingStore.getClosestSnappingPoint(event.payload.x, event.payload.y, function(pointId) {
      return blacklist.indexOf(getComponentIdFromPointId(pointId)) === -1;
    });
    if (point && point.pointId && step.active) {
      event.payload.pointId = point.pointId;
      this.snappingStore.highlightPoint(point);
      // this.handleEventStoreChange(event);
    } else {
      this.snappingStore.unhighlightPoint();
    }
  }

  getSelectedComponentIds() {
    let selectedIds = [];
    this.propStore.iterate((id, componentInfo) => {
      if (this.propStore.isSelected(id)) {
        selectedIds.push(id);
      }
    });
    return selectedIds;
  }

  transformEventPayload(payload, props) {
    if (props.transforms && props.transforms.length) {
      let dx = payload.deltaX, dy = payload.deltaY;
      // The deltaX and deltaY provided need to be transformed into
      // the component space.
      let matrix = getTransformationMatrix(props.transforms).inverse();
      payload.deltaX = dx * matrix.a + dy * matrix.c;
      payload.deltaY = dx * matrix.b + dy * matrix.d;
    }
    return payload;
  }

  /**
   * Handle events that `draw` a component into the canvas
   * @param  {Object} event         The event object
   * @param  {String} componentType The type of component to draw
   * @return {Object} Updated step
   */
  handleDrawing(event, componentType) {
    let currentStep = this.stepStore.getCurrentStep();
    if (event.type === "CANVAS_DRAG_START") {
      this.stepStore.nextStep();
      // Show snapping points!
      this.snappingStore.show();
      let selectedIds = this.getSelectedComponentIds();
      // Find out if there is a point close to event coords
      let point = this.snappingStore.getClosestSnappingPoint(event.payload.x,
        event.payload.y);
      if (point && point.pointId) {
        this.snappingStore.highlightPoint(point);
        event.payload.pointId = point.pointId;
      }
      // Call drawStart handler to get updated step
      currentStep = componentType.onDrawStart({
        type: "DRAW",
        info: {
          type: componentType
        }
      }, event.payload);
      // Run the draw step to insert component into renderTree
      currentStep = this.runStep(currentStep, {});
      currentStep.active = true;
      // Select the newly drawn component
      this.propStore.setSelectionState(currentStep.componentId, true);
    }
    if (event.type === "CANVAS_DRAG_MOVE") {
      let info = this.propStore.getInfo(currentStep.componentId);
      let componentType = currentStep.info.type;
      event.payload = this.transformEventPayload(event.payload, info.props);
      currentStep = this.runStep(componentType.onDraw(currentStep, event.payload), info);
      // Debounce and find out if the mouse pointer is close to a snapping point.
      // Exclude any points from same component
      this.debouncedPointSnap(event, false, currentStep);
    }
    if (event.type === "CANVAS_DRAG_END") {
      let info = this.propStore.getInfo(currentStep.componentId);
      let componentType = currentStep.info.type;
      let point = this.snappingStore.getClosestSnappingPoint(event.payload.x,
        event.payload.y);
      if (point && point.pointId) {
        this.snappingStore.highlightPoint(point);
        event.payload.pointId = point.pointId;
      }
      let componentId = currentStep.componentId;
      currentStep = this.runStep(componentType.onDrawEnd(currentStep, event.payload), info);
      // If an AbortStep is received, then abort abort!
      if (currentStep === AbortStep) {
        this.children = this.children.slice(0, -1);
        this.propStore.remove(componentId);
        this.snappingStore.removeSnappingPoints(componentId);
      } else {
        this.snappingStore.setSnappingPoints(currentStep.componentId,
          info.type.getSnappingPoints(info.props));
        currentStep.active = false;
        // Hide snappingPoints
        this.snappingStore.hide();
        OperationStoreSingleton.clear();
      }
    }
    return currentStep;
  }

  /**
   * Handle events that `rotate` a component in the canvas
   * @param  {Object} event         The event object
   * @return {Object} Updated step
   */
  handleRotating(event) {
    // Return early if event does not match any of these events
    const ROTATE_EVENTS = {
      "CANVAS_DRAG_START": true,
      "CANVAS_DRAG_MOVE": true,
      "CANVAS_DRAG_END": true
    };
    if (!ROTATE_EVENTS[event.type]) {
      return;
    }
    let currentStep = this.stepStore.getCurrentStep();
    let modified = false;
    if (event.type === "CANVAS_DRAG_START") {
      let selectedIds = this.getSelectedComponentIds();
      // Identify if the user clicked on a source point
      let point = this.snappingStore.getClosestSnappingPoint(event.payload.x,
        event.payload.y, function(pointId) {
          return selectedIds.indexOf(getComponentIdFromPointId(pointId)) >= 0;
        });
      let componentId;
      if (point && point.pointId) {
        componentId = getComponentIdFromPointId(point.pointId);
      } else {
        return;
      }
      let info = this.propStore.getInfo(componentId);
      // If control point belongs to root component ignore.
      if (componentId === "0") {
        return;
      }
      // Component is selected
      if (this.propStore.isSelected(componentId)) {
        // Switch to the next step
        this.stepStore.nextStep();

        // Remove these snapping points from snappingStore!
        this.snappingStore.removeSnappingPoints(componentId);

        // Assign values from the payload
        event.payload.pointId = point.pointId;
        event.payload.x = point.pointX;
        event.payload.y = point.pointY;

        // Show snapping points
        this.snappingStore.show();
        // Call the move start handler
        currentStep = info.type.onRotateStart(this, {
          type: "ROTATE",
          componentId,
          info: {
            type: info.type,
            name: info.name
          }
        }, event.payload);
        // Freeze initialProps
        currentStep.initialProps = ObjectUtils.extend({}, info.props);
        currentStep.active = true;
        currentStep.transformId = info.props.transforms.length;
        currentStep = this.runStep(currentStep, info);
        modified = true;
      }
    }
    if (event.type === "CANVAS_DRAG_MOVE") {
      let info = this.propStore.getInfo(currentStep.componentId);
      if (currentStep.active) {
        event.payload = this.transformEventPayload(event.payload, info.props);
        currentStep = info.type.onRotate(this, this.stepStore.getCurrentStep(), event.payload);
        currentStep = this.runStep(currentStep, info);
        modified = true;
        this.debouncedPointSnap(event, false, currentStep);
      }
    }

    if (event.type === "CANVAS_DRAG_END") {
      if (currentStep.active) {
        let info = this.propStore.getInfo(currentStep.componentId);
        // Remove these snapping points from snappingStore!
        this.snappingStore.removeSnappingPoints(currentStep.componentId);
        currentStep = info.type.onRotateEnd(this, this.stepStore.getCurrentStep(), event.payload);
        currentStep = this.runStep(currentStep, info);
        currentStep.active = false;
        modified = true;
        // Set snapping points
        info = this.propStore.getInfo(currentStep.componentId);
        this.snappingStore.setSnappingPoints(currentStep.componentId, info.type.getSnappingPoints(info.props));
        this.snappingStore.hide();
        // Clear the operation store
        OperationStoreSingleton.clear();
      }
    }
    if (modified) {
      return currentStep;
    }
  }

  /**
   * Handle events related to moving a component
   * @param  {Object} event The event raised from editor or control point
   * @return {Object} The updated step or undefined if event is not relevant
   */
  handleMoving(event) {
    // Return early if event does not match any of these events
    const MOVE_EVENTS = {
      "CANVAS_DRAG_START": true,
      "CANVAS_DRAG_MOVE": true,
      "CANVAS_DRAG_END": true
    };
    if (!MOVE_EVENTS[event.type]) {
      return;
    }
    let currentStep = this.stepStore.getCurrentStep();
    let modified = false;
    if (event.type === "CANVAS_DRAG_START") {
      let selectedIds = this.getSelectedComponentIds();
      // Identify if the user clicked on a source point
      let point = this.snappingStore.getClosestSnappingPoint(event.payload.x,
        event.payload.y, function(pointId) {
          return selectedIds.indexOf(getComponentIdFromPointId(pointId)) >= 0;
        });
      let componentId;
      if (point && point.pointId) {
        componentId = getComponentIdFromPointId(point.pointId);
      } else {
        return;
      }
      let info = this.propStore.getInfo(componentId);
      // If control point belongs to root component ignore.
      if (componentId === "0") {
        return;
      }
      // Component is selected
      if (this.propStore.isSelected(componentId)) {
        // Switch to the next step
        this.stepStore.nextStep();

        // Remove these snapping points from snappingStore!
        this.snappingStore.removeSnappingPoints(componentId);

        // Assign values from the payload
        event.payload.pointId = point.pointId;
        event.payload.x = point.pointX;
        event.payload.y = point.pointY;
        // Show snapping points
        this.snappingStore.show();
        // Call the move start handler
        currentStep = info.type.onMoveStart(this, {
          type: "MOVE",
          componentId,
          info: {
            type: info.type,
            name: info.name
          }
        }, event.payload);
        // Freeze initialProps
        currentStep.initialProps = ObjectUtils.extend({}, info.props);
        currentStep.active = true;
        currentStep = this.runStep(currentStep, info);
        modified = true;
      }
    }
    if (event.type === "CANVAS_DRAG_MOVE") {
      if (currentStep.active) {
        let info = this.propStore.getInfo(currentStep.componentId);
        // Modify payload by applying transforms from actual coordinates to SVG coordinates
        event.payload = this.transformEventPayload(event.payload, info.props);
        currentStep = info.type.onMove(this, this.stepStore.getCurrentStep(), event.payload);
        currentStep = this.runStep(currentStep, info);
        modified = true;
        this.debouncedPointSnap(event, false, currentStep);
      }
    }

    if (event.type === "CANVAS_DRAG_END") {
      let info = this.propStore.getInfo(currentStep.componentId);
      if (currentStep.active) {
        let point = this.snappingStore.getClosestSnappingPoint(event.payload.x,
          event.payload.y, function(pointId) {
            return getComponentIdFromPointId(pointId) !== currentStep.componentId;
          });
        if (point && point.pointId) {
          event.payload.pointId = point.pointId;
        }
        // Remove these snapping points from snappingStore!
        this.snappingStore.removeSnappingPoints(currentStep.componentId);
        currentStep = info.type.onMoveEnd(this, this.stepStore.getCurrentStep(), event.payload);
        currentStep = this.runStep(currentStep, info);
        currentStep.active = false;
        modified = true;
        // Set snapping points
        info = this.propStore.getInfo(currentStep.componentId);
        this.snappingStore.setSnappingPoints(currentStep.componentId, 
          info.type.getSnappingPoints(info.props));
        this.snappingStore.hide();
        // Clear the operation store
        OperationStoreSingleton.clear();
      }
    }
    if (modified) {
      return currentStep;
    }
  }

  handleScaling(event) {
    // Return early if event does not match any of these events
    const SCALE_EVENTS = {
      "CANVAS_DRAG_START": true,
      "CANVAS_DRAG_MOVE": true,
      "CANVAS_DRAG_END": true
    };
    if (!SCALE_EVENTS[event.type]) {
      return;
    }
    let currentStep = this.stepStore.getCurrentStep();
    let modified = false;
    if (event.type === "CANVAS_DRAG_START") {
      let selectedIds = this.getSelectedComponentIds();
      // Identify if the user clicked on a source point
      let point = this.snappingStore.getClosestSnappingPoint(event.payload.x,
        event.payload.y, function(pointId) {
          return selectedIds.indexOf(getComponentIdFromPointId(pointId)) >= 0;
        });
      let componentId;
      if (point && point.pointId) {
        componentId = getComponentIdFromPointId(point.pointId);
      } else {
        return;
      }
      let info = this.propStore.getInfo(componentId);
      // If control point belongs to root component ignore
      if (componentId === "0") {
        return;
      }
      if (this.propStore.isSelected(componentId)) {
        // Switch to the next step
        this.stepStore.nextStep();

        // Remove these snapping points from snappingStore!
        this.snappingStore.removeSnappingPoints(componentId);

        // Show snapping points
        this.snappingStore.show();

        // Assign values from the payload
        event.payload.pointId = point.pointId;
        event.payload.x = point.pointX;
        event.payload.y = point.pointY;

        // Call the move start handler
        currentStep = info.type.onScaleStart(this, {
          type: "SCALE",
          componentId,
          info: {
            type: info.type,
            name: info.name
          }
        }, event.payload);
        // Freeze initialProps
        currentStep.initialProps = ObjectUtils.extend({}, info.props);
        currentStep.active = true;
        currentStep = this.runStep(currentStep, info);
        modified = true;
      }
    }
    if (event.type === "CANVAS_DRAG_MOVE") {
      if (currentStep.active) {
        let info = this.propStore.getInfo(currentStep.componentId);
        // Modify payload by applying transforms from actual coordinates to SVG coordinates
        event.payload = this.transformEventPayload(event.payload, info.props);
        currentStep = info.type.onScale(this, this.stepStore.getCurrentStep(), event.payload);
        currentStep = this.runStep(currentStep, info);
        modified = true;
        this.debouncedPointSnap(event, false, currentStep);
      }
    }

    if (event.type === "CANVAS_DRAG_END") {
      if (currentStep.active) {
        let info = this.propStore.getInfo(currentStep.componentId);
        let point = this.snappingStore.getClosestSnappingPoint(event.payload.x,
          event.payload.y, function(pointId) {
            return getComponentIdFromPointId(pointId) !== currentStep.componentId;
          });
        if (point && point.pointId) {
          event.payload.pointId = point.pointId;
        }
        // Remove these snapping points from snappingStore!
        this.snappingStore.removeSnappingPoints(currentStep.componentId);
        currentStep = info.type.onScaleEnd(this, this.stepStore.getCurrentStep(), event.payload);
        OperationStoreSingleton.clear();
        currentStep = this.runStep(currentStep, info, undefined, false);
        currentStep.active = false;
        // Set snapping points
        info = this.propStore.getInfo(currentStep.componentId);
        this.snappingStore.setSnappingPoints(currentStep.componentId, 
          info.type.getSnappingPoints(info.props));
        this.snappingStore.hide();
        modified = true;
      }
    }
    if (modified) {
      return currentStep;
    }
  }

  /**
   * Notify any "external" events to the Picture
   * @param  {Object} event External event from canvas
   */
  notify(event) {
    let op = OperationStoreSingleton.getCurrentOperation() || {};
    switch (event.type) {
      case "INSERT_COMPONENT":
        if (op && op.operation === OperationStoreSingleton.OPS.DRAW) {
          OperationStoreSingleton.clear();
          break;
        }
        // Check if there is a pending component being drawn. If that is the case, remove
        // that from child and propStore
        let lastInsertedId = this.children[this.children.length - 1];
        let info = this.propStore.getInfo(lastInsertedId);
        if (info && info.drawing) {
          // Remove it
          this.removeChild(lastInsertedId);
        }
        // Deselect everybody
        this.propStore.iterate((id, componentInfo) => {
          if (this.propStore.isSelected(id)) {
            this.propStore.setSelectionState(id, false);
          }
        });
        this.snappingStore.show();
        // Set current operation in OperationStore
        OperationStoreSingleton.setCurrentOperation(OperationStoreSingleton.OPS.DRAW, event.payload);
        break;
      case "MOVE":
        if (op && op.operation === OperationStoreSingleton.OPS.MOVE) {
          OperationStoreSingleton.clear();
          break;
        }
        this.snappingStore.hide();
        OperationStoreSingleton.setCurrentOperation(OperationStoreSingleton.OPS.MOVE);
        break;
      case "ROTATE":
        if (op && op.operation === OperationStoreSingleton.OPS.ROTATE) {
          OperationStoreSingleton.clear();
          break;
        }
        this.snappingStore.hide();
        OperationStoreSingleton.setCurrentOperation(OperationStoreSingleton.OPS.ROTATE);
        break;
      case "GUIDE":
        // Run over each component in PropStore and set selected ones to guides
        this.propStore.iterate((id, componentInfo) => {
          if (this.propStore.isSelected(id)) {
            let info = this.propStore.getInfo(id);
            // Find the DRAW step corresponding to this id and update mode to guide
            // so that info is `set` when a new draw step is evaluated.
            this.stepStore.seedStep(id, {
              guide: !info.guide
            });
            this.evaluate(this.stepStore.steps.length);
          }
        });
        break;
      case "LOOP":
        this.stepStore.runSelected(this, this.dataStore.getItemCount(), this.emitChange.bind(this));
        break;
      case "SCALE":
        if (op && op.operation === OperationStoreSingleton.OPS.SCALE) {
          OperationStoreSingleton.clear();
          break;
        }
        this.snappingStore.hide();
        OperationStoreSingleton.setCurrentOperation(OperationStoreSingleton.OPS.SCALE);
        break;
    }
  }

  /**
   * Insert a child of the given target type
   * @param  {Object} targetType Constructor of the given target type
   * @param  {String} name   The name of the child component to insert (optional)
   * @param {Object} initialProps The initial set of props to seed with
   * @return {String}            The componentId of the inserted child
   */
  insertChild(targetType, name, initialProps) {
    let componentId = "0." + this.children.length;
    // Count number of Rectangles already
    let count = this.children.filter((componentId) => 
      this.propStore.getInfo(componentId).type === targetType).length;
    this.propStore.setInfo(componentId, {
      id: componentId,
      name: name || targetType.displayName + (count + 1),
      type: targetType,
      props: ObjectUtils.extend({}, clone(targetType.defaultProps), initialProps || {})
    });
    this.children.push(componentId);
    return componentId;
  }

  /**
   * Remove a child with a given id
   * @param  {String} id The id of the component to remove
   */
  removeChild(id) {
    let index = this.children.indexOf(id);
    if (index !== -1) {
      this.children.splice(index, 1);
    }
    this.propStore.remove(id);
    this.snappingStore.removeSnappingPoints(id);
    this.stepStore.removeSteps(id);
  }

  /**
   * Given a set of steps loop over them
   * @param  {Object} loopStep The step which contains substeps to run
   * @param {Number}  iteration The number of times the substeps must be executed
   * @param  {String} parentLoopId The id of parent loop index if any 
   * @param {Number} endIndex The index to terminate evaluation
   * @returns {Array} Array of steps as a result of evaluation
   */
  runStepLoop(loopStep, iteration, parentLoopId, endIndex = Infinity) {
    if (iteration < 1) {
      return;
    }
    // Run the steps in loopStep n number of times
    let componentMap = {};
    // First evaluate until startIndex to get to a clean state
    this.evaluate(loopStep.startIndex - 1);

    this.stepStore._index = loopStep.startIndex;
    // Remove the existing steps from stepStore until last
    // this.stepStore.removeStepsAfter(loopStep.startIndex);
    
    // Set iteration on step
    loopStep.iteration = iteration;

    // Reset the endIndex
    let loopEndIndex = loopStep.startIndex - 1;

    let finalSteps = [];
    let originalLoopStep = loopStep;

    // Start looping
    for (let iter = 0; iter < iteration; iter++) {
      loopStep = clone(originalLoopStep);
      let steps = loopStep.steps;
      // For each step, run the step
      for (let j = 0; j < steps.length; j++) {
        let step = steps[j];
        step.iteration = iter;
        // Increment endIndex
        loopEndIndex++;
        // if (loopEndIndex > endIndex) {
        //   // We need evaluate but not change propStore.
        //   finalSteps.push(this.stepStore.steps[loopEndIndex - (iter)]);
        //   continue;
        // }
        step.loopIndex = loopStep.loopIndex;

        // Set the loopId used for grouping, based on parentLoopIndex
        step.loopId = parentLoopId ? parentLoopId + "." + loopStep.loopIndex : String(loopStep.loopIndex);

        // Run the step by grabbing the component id.
        let originalComponentId = step.componentId;
        // Figure out the step type
        // if (step.type === "LOOP") {
        //   // Run all the iterations!
        //   this.runStepLoop(step, step.iteration, step.loopId, endIndex);
        // }
        if (step.type === "DRAW") {
          step = this.runStep(step, step.info, componentMap);
          if (iter > 0) {
            // Find out the mirroring DRAW step and update componentMap
            componentMap[finalSteps[j].componentId] = step.componentId;
          }
        }
        // Replace the componentId based on mapping
        step.componentId = componentMap[originalComponentId] || originalComponentId;
        // Get info from PropStore using componentMap to map over any replaceable components
        let info = this.propStore.getInfo(componentMap[originalComponentId] || originalComponentId);
        if (step.type === "SCALE") {
          step = this.runStep(step, info, componentMap);
        }
        if (step.type === "MOVE") {
          step = this.runStep(step, info, componentMap);
        }
        if (step.type === "ROTATE") {
          step = this.runStep(step, info, componentMap); 
        }
        finalSteps.push(step);
      }
    }
    originalLoopStep.endIndex = loopEndIndex;
    // Update the loopStep
    originalLoopStep.componentMap = componentMap;
    this.stepStore.updateLoopStep(originalLoopStep);
    return finalSteps;
  }

  /**
   * Init the picture by giving some canvas bounds
   * @param  {Object} canvas Object with x, y width and height coordinates
   */
  init(canvas) {
    this.snappingStore.setCurrentLayer({
      bounds: [ [ canvas.props.x, canvas.props.y ], [ canvas.props.width, canvas.props.height ] ]
    });
    // The offset points are important when we transform points on the actual drawing surface
    this.offsetX = canvas.props.translateX;
    this.offsetY = canvas.props.translateY;
    this.propStore.setInfo("0", {
      id: "0",
      name: "canvas",
      type: Canvas,
      props: canvas.props
    });
    // Set snapping points
    this.snappingStore.setSnappingPoints("0", Canvas.getSnappingPoints(canvas.props));
  }

  /**
   * Evaluate steps until stepIndex is reached
   * @param  {Number} stepIndex The index of the step to run upto.
   */
  evaluate(stepIndex) {
    if (stepIndex < -1) {
      stepIndex = -1;
    } 
    this.propStore.reset();
    this.snappingStore.reset();
    let steps = this.stepStore.getSteps(0, stepIndex + 1);
    // Reset PropStore, SnappingStore to their starting state.
    this.children = [];
    if (steps && steps.length) {
      steps.forEach((step) => {
        this.runStep(step, this.propStore.getInfo(step.componentId) || {});
      });
    }
  }

  /**
   * Run a given step and update the properties in propStore
   * @param  {Object} step          The step to run
   * @param  {Object} info          Metadata about the component
   * @param  {Object} componentMap  An optional object that handles "re-mapping" steps
   *                                while executing a `loop`.
   * @return {Object}               The updated step.
   */
  runStep(step, info, componentMap) {
    if (step === AbortStep) {
      return step;
    }
    // Initialize props if not present
    info.props = info.props || {};
    // Get the componentId for the step.
    let componentId = step.componentId;
    let handlerProp;
    switch (step.type) {
      case "DRAW":
        handlerProp = "draw";
        // If step is either inactive or its loopIndex is not empty
        if (!step.active || step.loopIndex !== undefined) {
          if (step.info.guide) {
            // Check if existing componentId exists
            if (componentId && this.children.indexOf(componentId) === -1) {
              // Insert and get new componentId
              componentId = this.insertChild(step.info.type, step.info.name, step.initialProps);
            }
          } else {
            // Insert and get new componentId
            componentId = this.insertChild(step.info.type, step.info.name, step.initialProps);
          }

          // Set the componentId on step
          step.componentId = componentId;

          // Copy over stuff from step's info if they exist
          [ "name", "type", "guide", "selected" ].forEach((key) => {
            if (step.info[key] !== undefined) {
              info[key] = step.info[key];
            }
          });
        }
        // Map points based on componentMap
        if (step.source && step.source.pointId) {
          step.source.pointId = changePointId(step.source.pointId, componentMap);
        }

        // Remap the target point
        if (step.target && step.target.pointId) {
          step.target.pointId = changePointId(step.target.pointId, componentMap);
        }

        // If step is not active, then run the pre-hook
        if (!step.active) {
          this.snappingStore.removeSnappingPoints(step.componentId);
        }
        break;
      case "MOVE":
        handlerProp = "move";
        if (!step.active || step.loopIndex !== undefined) {
          step.initialProps = clone(info.props);
          this.snappingStore.removeSnappingPoints(step.componentId);
        }
        if (step.source && step.source.pointId) {
          step.source.pointId = changePointId(step.source.pointId, componentMap);
        }
        if (step.target && step.target.pointId) {
          step.target.pointId = changePointId(step.target.pointId, componentMap);
        }
        break;
      case "ROTATE":
        handlerProp = "rotate";
        if (!step.active || step.loopIndex !== undefined) {
          step.initialProps = clone(info.props);
          step.transformId = info.props.transforms.length;
          this.snappingStore.removeSnappingPoints(step.componentId);
        }
        if (step.source && step.source.pointId) {
          step.source.pointId = changePointId(step.source.pointId, componentMap);
        }
        if (step.target && step.target.pointId) {
          step.target.pointId = changePointId(step.target.pointId, componentMap);
        }
        break;
      case "SCALE":
        handlerProp = "scale";
        if (!step.active  || step.loopIndex !== undefined) {
          step.initialProps = clone(info.props);
          this.snappingStore.removeSnappingPoints(step.componentId);
        }
        if (step.source && step.source.pointId) {
          step.source.pointId = changePointId(step.source.pointId, componentMap);
        }
        if (step.target && step.target.pointId) {
          step.target.pointId = changePointId(step.target.pointId, componentMap);
        }
        break;
    }
    let handlers = info.type.handlers;
    // Run handler and get updated props
    let props = handlers[handlerProp].handle(this, info, step);

    // Update props on `info`
    props = this.propStore.setProps(step.componentId, props);
    info.props = props;

    // Return the updated step and info
    this.propStore.setInfo(step.componentId, info);
    this.propStore.setSelectionState(step.componentId, true);
    // Return the updated step
    // After handlers
    if (!step.active || step.loopIndex !== undefined) {
      switch (step.type) {
        case "DRAW":
        case "SCALE":
        case "ROTATE":
        case "MOVE":
          this.snappingStore.setSnappingPoints(step.componentId, info.type.getSnappingPoints(info.props));
          break;
      }
    }
    return step;
  }

  updateTitleStep(step) {
    this.stepStore.updateCurrentStep(step);
    this.evaluate(this.stepStore.getCurrentIndex());
    this.emitChange();
  }

  getExpressionLabel(expression) {
    if (Array.isArray(expression)) {
      return expression.map((e) => {
        return this.getExpressionLabel(e);
      }).join("");
    }
    switch (expression.type) {
      case "parameter":
        let parameter = this.parametersStore.getParameterByIndex(expression.value);
        return parameter.name;
      case "rowVariable":
        let rowVariable = this.dataStore.getRowVariableByIndex(expression.index);
        return rowVariable.name;
      case "rowVariableStatistic":
        return this.dataStore.getRowVariableStatisticLabel(expression.index, expression.statVariable);
      default:
        return expression;
    };
  }

  evaluateExpression(expression, loopIndex) {
    if (expression === undefined || expression === null) {
      return undefined;
    }
    if (Array.isArray(expression)) {
      try {
        // Run over each component and fetch value
        let finalExp = expression.map((e) => {
          return this.evaluateExpression(e, loopIndex);
        });
        return eval(finalExp.join(""));
      } catch (e) {
        return;
      }
    }
    switch (expression.type) {
      case "parameter":
        let parameter = this.parametersStore.getParameterByIndex(expression.value);
        // Read in the value and return
        return this.evaluateExpression(parameter.value, loopIndex);
      case "rowVariable":
        let index = loopIndex === undefined ? this.dataStore.getActiveIndex() : loopIndex;
        return this.evaluateExpression(this.dataStore.data[expression.index][index], loopIndex);
      case "rowVariableStatistic":
        return this.evaluateExpression(this.dataStore.getRowVariableStatistic(expression.index, expression.statVariable));
      default:
        return expression;
    };
  }
  /**
   * Render the children using propStore
   * @param  {Array} children Array of children
   * @return {Object}         The rendered children
   */
  _renderTreeChildren(children) {
    return children.map((childId, index) => {
      let childInfo = this.propStore.getInfo(childId);
      let childProps = Object.assign({
        guide: childInfo.guide,
        selected: this.propStore.isSelected(childId)
      }, childInfo.props);
      return (
        <Store 
          componentId={childId}
          childType={childInfo.type}
          key={childId}
          editMode={this.editing}
          propStore={this.propStore}
          snappingStore={this.snappingStore}
          picture={this}
          handleEvent={this.handleEvent}>
          {React.createElement(childInfo.type, childProps)}
        </Store>
      );
    });
  }

  /**
   * Render and return a react tree
   * @return {Object} React element tree
   */
  render() {
    return (
      <Store
        componentId={"0"}
        editMode={this.editing} 
        childType={Canvas}
        propStore={this.propStore}
        snappingStore={this.snappingStore}
        picture={this}
        handleEvent={this.handleEvent}>
        <Canvas>
          {this._renderTreeChildren(this.children)}
          {this.editing && (<SnapPoints
            snappingStore={this.snappingStore} 
            handleEvent={this.handleEvent}/>)}
        </Canvas>
      </Store>
    );
  }

  emitChange() {
    this.callback();
  }

  handleEvent(event) {
    // Notify all Stores using EventStore
    EventStoreSingleton.notify(event);
  }
};
