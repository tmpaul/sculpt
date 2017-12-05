import { describe, it, before, beforeEach, after } from "mocha";
import { expect } from "chai";

import { highlightPoint, showSnappingPoints, hideSnappingPoints } from "../PointsReducer";

describe("Points Reducer", () => {
  
    it("highlights the point for the pointId given in payload", function() {
      let result = highlightPoint({
        highlightedPoint: null
      }, {
        pointId: "0.0.center"
      });
      expect(result.highlightedPoint).to.be.equal("0.0.center");
    });

    it("shows snapping points when action is detected", function() {
      let result = showSnappingPoints({});
      expect(result.showSnappingPoints).to.be.true;
    });

    it("hides snapping points when action is detected", function() {
      let result = hideSnappingPoints({});
      expect(result.showSnappingPoints).to.be.false;
    });
});
