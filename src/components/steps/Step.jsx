

function getDescription(pointObject, props) {
  if (!pointObject) {
    return;
  }
  if (pointObject.pointId) {
    return props.snappingStore.getPointDescription(pointObject.pointId);
  } else {
    return pointObject.x + "," + pointObject.y;
  }
}

function getSlotValue(slot, props) {
  if (slot.type === "text" || slot.type === "name") {
    return slot.value;
  } else if (slot.type === "point") {
    return getDescription(slot.value, props);
  }
}

function setName(id, name, props) {
  props.propStore.setInfo(id, {
    name
  });
  let step = props.stepStore.getCurrentStep();
  // Copies info over
  props.stepStore.updateCurrentStep(step);
}

function processSlot(id, slot, i, props) {
  if (slot.type === "text") {
    return (<span className="slot" key={i}>{slot.value}</span>);
  } else if (slot.type === "point") {
    return (<span className="slot" key={i}>{getDescription(slot.value, props)}</span>);
  } else if (slot.type === "name") {
    return (<input className="slot slot-input" size={Math.max(slot.value.length, 1)} 
      key={i} value={slot.value} onChange={(e) => setName(id, e.target.value, props)}/>);
  }
}

export default function Step(props) {
  let step = props.step;
  let id = step.componentId;
  let info = props.propStore.getInfo(id);
  let source = step.source;
  let target = step.target;
  // The editable portions and text come from the component itself
  let slots = props.getSlots(info, source, target, step);
  if (props.single) {
    slots = (<span>{slots.map((s) => getSlotValue(s, props)).join(" ")}</span>);
  } else {
    slots = slots.map((slot, i) => {
      return processSlot(id, slot, i, props);
    });
  }
  // Run over stepContents, if any slot is editable, mark it so that
  // we can track what is being edited
  return (
    <div className={"step current-step " + (props.single ? "single-line " : " ") + (props.selected ? "selected" : "")}
      onClick={props.single ? props.onClick : Step.defaultProps.onClick}
    >
      {slots}
    </div>
  );
};

Step.defaultProps = {
  onClick: () => {}
};
