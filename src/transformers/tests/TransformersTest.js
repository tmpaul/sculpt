import { describe, it, before, beforeEach, after } from "mocha";
import { expect } from "chai";

import { snapPointTransformer, componentSpaceTransformer } from "../index";

describe("draw event transformations", function() {

  describe("snap point transformer", function() {

    it("adds a pointId if there is a snap point close by", function() {
      let result = snapPointTransformer({
        x: 1,
        y: 2
      }, {
        snapPoints: [ {
          x: 0,
          pointId: "0.0",
          y: 1
        } ]
      });
      expect(result.pointId).to.equal("0.0");
      expect(result.x).to.equal(0);
      expect(result.y).to.equal(1);
    });
    
    it("returns a new payload object not the exact same payload", function() {
      let payload = {
        x: 1,
        y: 2 
      };
      let result = snapPointTransformer(payload, {
        snapPoints: [ {
          x: 0,
          pointId: "0.0",
          y: 1
        } ]
      });
      expect(result !== payload).to.be.true;
      expect(result.y).to.equal(1);
      expect(result.x).to.equal(0);
    });

    it("respects the cycleIndex in event payload", function() {
      let payload = {
        x: 1,
        y: 2,
        cycleIndex: 1
      };
      let result = snapPointTransformer(payload, {
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
      expect(result.x).to.equal(2);
      expect(result.y).to.equal(3);
    });
  });


  describe("component space transformer", function() {
    it("returns the same payload if transforms are empty", function() {
      expect({
        deltaX: 1,
        deltaY: 2
      }, undefined).to.deep.equal({
        deltaX: 1,
        deltaY: 2
      });
    });

    it("returns transformed payload if transformations are supplied", function() {
      
    });
  });
});
