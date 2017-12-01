import { describe, it, before, beforeEach, after } from "mocha";
import { expect } from "chai";

import { createRegularStep, updateRegularStep } from "../StepsReducer";

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
      expect(result === state).to.be.true;
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
      expect(result === state).to.be.true;
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
      expect(result === state).to.be.true;
      expect(result.steps.length).to.equal(1);
      expect(result.steps[1]).to.be.undefined;
    });
  });
});
