import { describe, it, before, beforeEach, after } from "mocha";
import { expect } from "chai";

import { snapPointTransformer } from "../DrawEventTransformer";

describe("draw event transformations", () => {

  describe("snap point transformer", () => {

    it("adds a pointId if there is a snap point close by", function() {
      let result = snapPointTransformer({
        payload: {
          x: 1,
          y: 2
        }
      }, {
        snapPoints: [ {
          x: 0,
          pointId: "0.0",
          y: 1
        } ]
      });
      expect(result.payload.pointId).to.equal("0.0");
      expect(result.payload.x).to.equal(0);
      expect(result.payload.y).to.equal(1);
    });
    
    it("returns a new payload object not the exact same payload", function() {
      let payload = {
        x: 1,
        y: 2 
      };
      let result = snapPointTransformer({
        payload
      }, {
        snapPoints: [ {
          x: 0,
          pointId: "0.0",
          y: 1
        } ]
      });
      expect(result.payload !== payload).to.be.true;
      expect(result.payload.y).to.equal(1);
      expect(result.payload.x).to.equal(0);
    });

    it("respects the cycleIndex in event payload", function() {
      let payload = {
        x: 1,
        y: 2,
        cycleIndex: 1
      };
      let result = snapPointTransformer({
        payload
      }, {
        snapPoints: [ {
          x: 0,
          pointId: "0.0",
          y: 1
        }, {
          x: 2,
          y: 3,
          pointId: "0.1"
        } ]
      });
      expect(result.payload.x).to.equal(2);
      expect(result.payload.y).to.equal(3);
    });
  });
});
