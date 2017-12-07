import { describe, it, before, beforeEach, after } from "mocha";
import { expect } from "chai";

import generateToolbarMutations from "../Mutations";
import { 
  SEED_STEP, 
  INSERT_COMPONENT, 
  ADJUST_COMPONENT
} from "mutation-types/MutationTypes";

function findMutation(mutations, mutationType) {
  return mutations.filter((m) => m.type === mutationType)[0];
}

describe("Toolbar mutations", () => {
  describe("draw event", () => {
    it("returns empty mutations for no event", () => {
      expect(generateToolbarMutations().length).to.equal(0);
    });

    it("generates an insert component mutation for draw event", function() {
      const FooBar = function() {};

      let mutation = findMutation(generateToolbarMutations({
        type: "DRAW",
        payload: FooBar
      }), INSERT_COMPONENT);
      expect(mutation).to.not.be.undefined;
      expect(mutation.payload.componentType).to.equal(FooBar);
    });
  });

  describe("adjustment events", function() {
    it("generates and adjusment component mutation for move event", function() {
      let mutation = findMutation(generateToolbarMutations({
        type: "MOVE",
      }), ADJUST_COMPONENT);
      expect(mutation).to.not.be.undefined;
    });

    it("generates and adjusment component mutation for scale event", function() {
      let mutation = findMutation(generateToolbarMutations({
        type: "SCALE",
      }), ADJUST_COMPONENT);
      expect(mutation).to.not.be.undefined;
    });

    it("generates and adjusment component mutation for rotate event", function() {
      let mutation = findMutation(generateToolbarMutations({
        type: "ROTATE",
      }), ADJUST_COMPONENT);
      expect(mutation).to.not.be.undefined;
    });
  });

  describe("guide mode", function() {
    it("generates no mutations if there are no selected components", function() {
      let mutations = generateToolbarMutations({
        type: "GUIDE"
      }, {});
      expect(mutations.length).to.equal(0);
    });

    it("generates mutations if there are selected components", function() {
      let mutations = generateToolbarMutations({
        type: "GUIDE"
      }, {
        registry: {
          "0": {
            info: {
              selected: true
            }
          },
          "1": {
            info: {
              selected: false
            }
          }
        }
      });
      expect(mutations.length).to.equal(1);
    });
  });

  describe("loop step", function() {
    it("generates a single mutation", function() {
      expect(generateToolbarMutations({
        type: "LOOP"
      }).length).to.equal(1);
    });
  });
});
