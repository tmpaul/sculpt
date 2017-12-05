import { describe, it, before, beforeEach, after } from "mocha";
import { expect } from "chai";

import { markComponentInsertion, moveComponent, 
  scaleComponent, rotateComponent } from "../OperationsReducer";

describe("Operations Reducer", () => {
    
    describe("Draw operation aka Insert component", function() {

      it("throws an error if component type is not a proper function", function() {
        expect(function() { markComponentInsertion({}, {}) }).to.throw();
        expect(function() { markComponentInsertion({}, {
          componentType: {}
        }) }).to.throw();
        expect(function() { markComponentInsertion({}, {
          componentType: function() {}
        }) }).to.not.throw();
      });

      it("correctly marks state for draw operation", function() {
        const FUNC = function(){};
        expect(markComponentInsertion({}, {
          componentType: FUNC
        })).to.deep.equal({
          operations: {
            componentToBeInserted: FUNC,
            activeOperationType: "DRAW"
          }
        });
      });

      it("resets the draw operation if called twice successively", function() {
        const FUNC = function(){};
        let state = markComponentInsertion({}, {
          componentType: FUNC
        });
        state = markComponentInsertion(state, {
          componentType: FUNC
        });
        expect(state.operations).to.deep.equal({});
        state = markComponentInsertion(state, {
          componentType: FUNC
        });
        expect(state.operations).to.deep.equal({
          componentToBeInserted: FUNC,
          activeOperationType: "DRAW"
        });
      });

    });

    describe("Move operation", function() {

      it("correctly marks a move op", function() {
        let state = moveComponent({});
        expect(state.operations).to.deep.equal({
          activeOperationType: "MOVE"
        });
      });

      it("resets move operations if previous op is a move op", function() {
        let state = moveComponent({
          operations: {
            activeOperationType: "MOVE"
          }
        });
        expect(state.operations).to.deep.equal({});
      });
    });

    describe("Scale operation", function() {

      it("correctly marks a scale op", function() {
        let state = scaleComponent({});
        expect(state.operations).to.deep.equal({
          activeOperationType: "SCALE"
        });
      });

      it("resets scale operations if previous op is a scale op", function() {
        let state = scaleComponent({
          operations: {
            activeOperationType: "SCALE"
          }
        });
        expect(state.operations).to.deep.equal({});
      });
    });

    describe("Rotate operation", function() {

      it("correctly marks a rotate op", function() {
        let state = rotateComponent({});
        expect(state.operations).to.deep.equal({
          activeOperationType: "ROTATE"
        });
      });

      it("resets rotate operations if previous op is a rotate op", function() {
        let state = rotateComponent({
          operations: {
            activeOperationType: "ROTATE"
          }
        });
        expect(state.operations).to.deep.equal({});
      });
    });
});
