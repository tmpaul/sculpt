import { CurrentStepComponent } from "components/steps";

function handleClick(stepStore, index, loopIndex) {
  stepStore.toggleSelected(index);
  // Since this is a looping step select substep
  // stepStore.toggleSubstepSelection(step, substep);
};

function changeIteration(stepStore, loopStepIndex, value) {
  stepStore.runIteration(loopStepIndex, Number(value));
}

export default function LoopStep(props) {
  let step = props.step;
  if (!step) {
    return (<li></li>);
  }
  if (step.type !== "LOOP") {
    throw new Error("LoopStep must be sent a step of type `LOOP`");
  }

  return (
    <li>
      <span>
        Iteration
        <input type="number" defaultValue={step.iteration} onChange={(e) => changeIteration(props.stepStore, props.step.loopIndex, e.target.value)}/>
      </span>
      <div>
        {
          // Display steps w.r.t iteration number
        }
        {step.steps.map((s, i) => {
          let stepIndex = step.steps.length * (step.iteration - 1) + i + step.startIndex;
          return (
            <CurrentStepComponent
              key={i}
              step={s}
              single={true}
              selected={props.stepStore.isSelected(stepIndex)}
              stepStore={props.stepStore}
              snappingStore={props.snappingStore}
              propStore={props.propStore}
              onClick={handleClick.bind(null, props.stepStore, stepIndex, s.loopIndex)}
            />
          );
        })}
      </div>
    </li>
  );
}
