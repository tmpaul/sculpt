import { describe, it, before, beforeEach, after } from "mocha";
import { expect } from "chai";

import { getSelectedComponentIds, isGuide } from "../ComponentSelectors";

describe("Component selectors", () => {
  /*
    getSnappingPoints
   */
  describe("get selected component ids", () => {
    it("return an array of component ids if they are selected given state", function() {
      expect(getSelectedComponentIds({
        registry: {
          "0": {
            info: {
              selected: false
            }
          },
          "1": {
            info: {
              selected: undefined
            }
          },
          "2": {
            info: {
              selected: true
            }
          }
        }
      })).to.deep.equal([ "2" ]);
    });
  });

  describe("guide check", function() {
    expect(isGuide({
      registry: {
        "0": {
          info: {}
        }
      }
    }, "0")).to.be.false;

    expect(isGuide({
      registry: {
        "0": {
          info: {
            guide: true
          }
        }
      }
    }, "0")).to.be.true;
    expect(isGuide({
      registry: {
        "0": {
          info: {
            guide: "True"
          }
        }
      }
    }, "0")).to.be.false;
  });
});
