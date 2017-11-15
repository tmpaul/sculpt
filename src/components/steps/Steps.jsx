import { ObjectUtils } from "utils/GenericUtils";
import { CurrentStepComponent } from "components/steps";
import LoopingStepComponent from "components/steps/LoopingStep";
import BaseComponent from "core/BaseComponent";


export default class Steps extends BaseComponent {

  constructor(...args) {
    super(...args);
    this.autoBind();
    this.forceUpdate = this.forceUpdate.bind(this);
  }

  componentWillMount() {
    this.props.stepStore.addChangeListener(this.forceUpdate);
  }

  componentWillUnmount() {
    this.props.stepStore.removeChangeListener(this.forceUpdate);
  }

  render() {
    let StepStore = this.props.stepStore;
    let steps = this.groupSteps(StepStore, StepStore.getSteps());
    return (
      <div>
      <h4>Steps</h4>
        <ol style={{ padding: "0px 10px" }}>
          {steps.map((step, index) => {
            if (step.type === "LOOP") {
              // Render a LoopingStep component
              return (
                <LoopingStepComponent
                  key={index}
                  step={step}
                  stepStore={this.props.stepStore}
                  snappingStore={this.props.snappingStore}
                  propStore={this.props.propStore}
                  slotExpressionResolver={this.props.slotExpressionResolver}
                />
              );
            }
            return (
              <li style={{ padding: 0 }} key={index}>
                <CurrentStepComponent 
                  step={step}
                  selected={StepStore.isSelected(index)}
                  stepStore={this.props.stepStore}
                  snappingStore={this.props.snappingStore}
                  propStore={this.props.propStore}
                  slotExpressionResolver={this.props.slotExpressionResolver}
                  onClick={this.handleClick.bind(null, index)}
                />
              </li>
            );
          })}
        </ol>
      </div>
    );
  }

  groupSteps(stepStore, steps) {
    let finalSteps = [];
    for (let i = 0; i < steps.length; i++) {
      let step = steps[i];
      if (step.loopIndex !== undefined) {
        // Look for all steps that match this loopIndex
        let loopStep = stepStore.getLoopStep(step.loopIndex);
        if (loopStep) {
          // Find max index
          let endOffset = loopStep.endIndex;
          let startOffset = endOffset - loopStep.steps.length + 1;
          // Gather then steps from startOffset until maxIndex
          let clone = ObjectUtils.extend({}, loopStep);
          // Set only current active steps
          clone.steps = steps.slice(startOffset, endOffset + 1);
          finalSteps.push(clone);
          // Skip until endOffset
          i = Math.max(i, endOffset);
        }
      } else {
        finalSteps.push(step);
      }
    }
    return finalSteps;
  }

  handleClick(index) {
    this.props.stepStore.toggleSelected(index);
  }
};
