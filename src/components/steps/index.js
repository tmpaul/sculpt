import BaseComponent from "core/BaseComponent";
import Step from "components/steps/Step";

function DummyStep(props) {
  return (<input className="step current-step" readOnly/>);
}

function emptyArray() {
  return [];
}

export const AbortStep = {
  type: "ABORT_STEP"
};

export class TitleStepComponent extends BaseComponent {
  static defaultProps = {
    onClick: BaseComponent.NOOP
  };

  constructor(...args) {
    super(...args);
    this.autoBind();
    this.forceUpdate = this.forceUpdate.bind(this);
  }

  getSlotsFunction(step, props) {
    let info = props.propStore.getInfo(step.componentId);
    if (!info.type) {
      return emptyArray;
    }
    let type = info.type;
    switch (step.type) {
      case "DRAW":
        return type.getDrawingStepSlots;
      case "MOVE":
        return type.getMovingStepSlots;
      case "SCALE":
        return type.getScalingStepSlots;
      case "ROTATE":
        return type.getRotationStepSlots;
    }
    return emptyArray;
  }

  componentWillMount() {
    this.props.stepStore.addChangeListener(this.forceUpdate);
  }

  componentWillUnmount() {
    this.props.stepStore.removeChangeListener(this.forceUpdate);
  }

  render() {
    let StepStore = this.props.stepStore;
    let step = this.props.step || StepStore.getCurrentStep() || {};
    return (
      <Step 
        step={step}
        selected={this.props.selected}
        onClick={this.props.onClick}
        getSlots={this.getSlotsFunction(step, this.props)}
        stepStore={this.props.stepStore}
        snappingStore={this.props.snappingStore}
        propStore={this.props.propStore}
        single={false}/>
    );
  }
};

export class CurrentStepComponent extends BaseComponent {

  static defaultProps = {
    onClick: BaseComponent.NOOP
  };

  constructor(...args) {
    super(...args);
    this.autoBind();
  }

  getSlotsFunction(step, props) {
    let info = props.propStore.getInfo(step.componentId);
    if (!info.type) {
      return emptyArray;
    }
    let type = info.type;
    switch (step.type) {
      case "DRAW":
        return type.getDrawingStepSlots;
      case "MOVE":
        return type.getMovingStepSlots;
      case "SCALE":
        return type.getScalingStepSlots;
      case "ROTATE":
        return type.getRotationStepSlots;
    }
    return emptyArray;
  }

  render() {
    let StepStore = this.props.stepStore;
    let step = this.props.step || StepStore.getCurrentStep() || {};
    return (
      <Step
        step={step}
        single={true}
        selected={this.props.selected}
        onClick={this.props.onClick}
        getSlots={this.getSlotsFunction(step, this.props)}
        stepStore={this.props.stepStore}
        snappingStore={this.props.snappingStore}
        propStore={this.props.propStore}
      />
    );
  }
}
