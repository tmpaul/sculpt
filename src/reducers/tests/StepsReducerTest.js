import { describe, it, before, beforeEach, after } from "mocha";
import { expect } from "chai";

import { createRegularStep, updateRegularStep, abortStep, seedStep } from "../StepsReducer";

describe("Steps Reducer", () => {
  describe("create regular step", () => {
    
    it("adds a new step if there is no previous state", function() {
      let result = createRegularStep(undefined, {
        step: {
          type: "DRAW"
        }
      });
      expect(result.steps).to.not.be.undefined;
      expect(result.steps[0]).to.deep.equal({
        type: "DRAW"
      });
    });

    it("returns the same state if step is not an object", function() {
      let state = {
        steps: [{
          type: "DRAW"
        }]
      };
      let result = createRegularStep(state, {
        step: 2
      });
      expect(result.steps.length).to.equal(1);
      expect(result.steps[1]).to.be.undefined;
    });

    it("inserts a step if a step is already present before", function() {
      let result = createRegularStep({
        steps: [{
          type: "DRAW"
        }],
        activeStepIndex: 0
      }, {
        step: {
          type: "DRAW"
        }
      });
      expect(result.steps).to.not.be.undefined;
      expect(result.steps[1]).to.deep.equal({
        type: "DRAW"
      });
    });

    it("inserts a step into the middle of two steps", function() {
      let result = createRegularStep({
        steps: [{
          type: "DRAW"
        }, {
          type: "MEME"
        }, {
          type: "COO"
        }],
        activeStepIndex: 1
      }, {
        step: {
          type: "DRAW"
        }
      });
      expect(result.steps).to.not.be.undefined;
      expect(result.steps.length).to.equal(4);
      expect(result.steps[2]).to.deep.equal({
        type: "DRAW"
      });
      expect(result.steps[3]).to.deep.equal({
        type: "COO"
      });
    });

    it("resets active step index after inserting", function() {
      let result = createRegularStep({
        steps: [{
          type: "DRAW"
        }],
        activeStepIndex: 0
      }, {
        step: {
          type: "DRAW"
        }
      });
      expect(result.activeStepIndex).to.equal(1);
    });

  });

  describe("update regular step", function() {
    it("updates an existing step iff an index is provided", function() {
      let state = {
        steps: [{
          type: "DRAW"
        }]
      };
      let result = updateRegularStep(state, {
        index: null,
        step: {
          type: "MEME"
        }
      });
      expect(result.steps[0]).to.deep.equal({
        type: "DRAW"
      });
      expect(result.steps.length).to.equal(1);
      expect(result.steps[null]).to.be.undefined;
    });

    it("returns the same state if step is not an object", function() {
      let state = {
        steps: [{
          type: "DRAW"
        }]
      };
      let result = updateRegularStep(state, {
        index: 1,
        step: 2
      });
      expect(result.steps.length).to.equal(1);
      expect(result.steps[1]).to.be.undefined;
    });
  });

  describe("abort step", function() {
    it("removes a step from state if step is aborted", function() {
      let steps = [ {
        type: "DRAW"
      } ];
      let result = abortStep({
        steps
      }, {
        index: 0
      });
      expect(result.steps.length).to.equal(0);
    });

    it("changes active step index if the active step is aborted", function() {
      let steps = [ {
        type: "DRAW"
      } ];
      let result = abortStep({
        steps,
        activeStepIndex: 0
      }, {
        index: 0
      });
      expect(result.activeStepIndex).to.equal(-1);
    });
  });

  describe("seed step", function() {
    it("returns same state if an index is not provided", function() {
      expect(seedStep({}, {})).to.deep.equal({});
    });

    it("returns same state if payload info is not an object", function() {
      expect(seedStep({}, {
        info: null
      })).to.deep.equal({});
      expect(seedStep({}, {
        info: [ 1,2,3 ]
      })).to.deep.equal({});
      expect(seedStep({}, {
        info: "abcd"
      })).to.deep.equal({});
      let state = {
        steps: [ {
          type: "DRAW",
          componentId: "0.0",
          info: {
            a: 1
          }
        } ]
      };
      expect(seedStep(state, {
        info: [ 1,2,3 ]
      })).to.deep.equal(state);
    });

    it("does not update step if componentId is missing", function() {
      expect(seedStep({
        steps: [ {
          type: "DRAW",
          componentId: "0.0",
          info: {
            a: 1
          }
        } ]
      }, {
        info: {
          b: 2
        }
      })).to.deep.equal({
        steps: [ {
          type: "DRAW",
          componentId: "0.0",
          info: {
            a: 1
          }
        } ]
      });
    });

    it("does not update step if step type is not DRAW", function() {
      expect(seedStep({
        steps: [ {
          type: "MOVE",
          componentId: "0.0",
          info: {
            a: 1
          }
        } ]
      }, {
        info: {
          b: 2
        }
      })).to.deep.equal({
        steps: [ {
          type: "MOVE",
          componentId: "0.0",
          info: {
            a: 1
          }
        } ]
      });
    });

    it("updates info for a simple step", function() {
      expect(seedStep({
        steps: [ {
          type: "DRAW",
          componentId: "0.0",
          info: {
            a: 1
          }
        } ]
      }, {
        componentId: "0.0",
        info: {
          b: 2
        }
      })).to.deep.equal({
        steps: [ {
          type: "DRAW",
          componentId: "0.0",
          info: {
            a: 1,
            b: 2
          }
        } ]
      });
    });

    it("updates info for a loop step", function() {
      expect(seedStep({
        steps: [ {
          type: "LOOP_STEP",
          steps: [ {
            type: "DRAW",
            componentId: "0.0",
            info: {
              a: 1
            }
          } ]
        } ]
      }, {
        componentId: "0.0",
        info: {
          b: 2
        }
      })).to.deep.equal({
        steps: [ {
          type: "LOOP_STEP",
          steps: [ {
            type: "DRAW",
            componentId: "0.0",
            info: {
              a: 1,
              b: 2
            }
          } ]
        } ]
      });
    });
  });
});
