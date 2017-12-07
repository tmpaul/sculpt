import { describe, it, before, beforeEach, after } from "mocha";
import { expect } from "chai";

import { getSnappingPoints, getClosestSnappingPoint } from "../SnapPointSelectors";

describe("Snapping point selectors", () => {
  /*
    getSnappingPoints
   */
  describe("get snap points", () => {
    it("return an array of points given state", function() {
      expect(getSnappingPoints({})).to.deep.equal([]);
      expect(getSnappingPoints({
        snapPoints: [ { x: 1, y: 2 }]
      })).to.deep.equal([ { x: 1, y: 2 }]);
    });
  });

  /*
    getClosestSnappingPoint
   */
  describe("get closest snap point", function() {

    let state;

    beforeEach(function() {
      state = {
        snapPoints: [{
          x: 1,
          y: 2
        },{
          x: 3,
          y: 4
        }]
      };
    });

    it("does not return a match if distance is greater than threshold", function() {
      expect(getClosestSnappingPoint(state, {
        x: 10, y: 10
      })).to.be.undefined;
    });

    it("returns the first match if cycle index is not present", function() {
      expect(getClosestSnappingPoint(state, {
        x: 2, y: 3
      })).to.deep.equal({
        x: 1,
        y: 2
      });
    });

    it("respects cycle index if provided", function() {
      expect(getClosestSnappingPoint(state, {
        x: 2, y: 3
      }, 1)).to.deep.equal({
        x: 3,
        y: 4
      });
    });

    it("cycles through matches if cycle index is greater than length of matches", function() {
      expect(getClosestSnappingPoint(state, {
        x: 2, y: 3
      }, 2)).to.deep.equal({
        x: 1,
        y: 2
      });
    });

    it("respects custom threshold", function() {
      expect(getClosestSnappingPoint(state, {
        x: 10, y: 10
      }, 0, 100)).to.not.be.undefined;
    });

    afterEach(function() {
      state = null;
    });
  });
});
