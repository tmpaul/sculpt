import { describe, it, before, beforeEach, after } from "mocha";
import { expect } from "chai";

import handleDrawing from "../DrawHandler";
import { CREATE_STEP, UPDATE_STEP, 
  HIGHLIGHT_POINT, SHOW_SNAPPING_POINTS } from "mutation-types/MutationTypes";

function findMutation(mutations, mutationType) {
  return mutations.filter((m) => m.type === mutationType)[0];
}

describe("Handle drawing picture operations", () => {
  /*
    Handle draw start
   */
  describe("Handle draw start", () => {
    const DummyType = function DummyType() {};

    DummyType.onDrawStart = (step) => step;
    it("returns empty mutations for no event", () => {
      expect(handleDrawing().length).to.equal(0);
    });

    it("returns a mutation to show snapping points", () => {
      let mutations = handleDrawing(undefined, {
        type: "CANVAS_DRAG_START"
      }, DummyType);
      expect(mutations.length).to.not.equal(0);
      let showSnappingMutations = findMutation(mutations, SHOW_SNAPPING_POINTS);
      expect(showSnappingMutations).to.not.be.undefined;
    });

    it("returns a create new step if step is undefined", () => {
      let mutations = handleDrawing(undefined, {
        type: "CANVAS_DRAG_START"
      }, DummyType);
      expect(mutations.length).to.not.equal(0);
      // Verify that one of the mutations includes CREATE_STEP
      let createMutation = findMutation(mutations, CREATE_STEP);
      expect(createMutation).to.not.be.undefined;
      expect(createMutation.payload.type).to.equal("DRAW");
      expect(createMutation.payload.info.type).to.equal(DummyType);
    });

    it("returns a highlight point mutation if pointId is present in event payload", () => {
      const step = {};
      let mutations = handleDrawing(step, {
        type: "CANVAS_DRAG_START",
        payload: {
          pointId: "0.0.bottom left"
        }
      }, DummyType);
      let mutation = findMutation(mutations, HIGHLIGHT_POINT);
      expect(mutation).to.not.be.undefined;
    });

    it("returns an update step if step is defined", () => {
      const step = {};
      let mutations = handleDrawing(step, {
        type: "CANVAS_DRAG_START"
      }, DummyType);
      expect(mutations.length).to.not.equal(0);
      // Verify that one of the mutations includes CREATE_STEP
      let updateMutation = findMutation(mutations, UPDATE_STEP);
      expect(updateMutation).to.not.be.undefined;
      expect(updateMutation.payload).to.equal(step);
    });
  });
});
