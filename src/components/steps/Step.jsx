import AdjustmentControl from "components/AdjustmentControl";
import Parameter from "components/parameters/Parameter";
import { getPointDescription } from "utils/PointUtils";

function getDescription(pointObject, props) {
  if (!pointObject) {
    return;
  }
  if (pointObject.pointId) {
    return getPointDescription(props.propStore, pointObject.pointId);
  } else {
    return pointObject.x + "," + pointObject.y;
  }
}

function getSlotValue(slot, props) {
  if (slot.type === "text" || slot.type === "name" || slot.type === "number") {
    return slot.value;
  } else if (slot.type === "point") {
    return getDescription(slot.value, props);
  } else if (slot.type === "expression") {
    if (slot.value.type === "parameter") {
      let parameter = props.parameterResolver(slot.value.value);
      return parameter.name;
    }
  }
}

function setName(id, name, props) {
  props.propStore.setInfo(id, {
    name
  });
  props.onUpdateStep(props.step);
}

function getExpressionSlot(slot, i, props) {
  if (slot.value.type === "parameter") {
    return (<span className="slot" key={i}>
    {Parameter.renderSlot(slot, props.parameterResolver(slot.value.value))}
    </span>);
  }
}

function processSlot(id, slot, i, props) {
  if (slot.type === "text") {
    return (<span className="slot" key={i}>{slot.value}</span>);
  } else if (slot.type === "number") {
    if (slot.editable) {
      return (<AdjustmentControl 
        key={i} 
        min={slot.min}
        max={slot.max}
        sensitivity={0.2}
        value={Number(slot.value)}
        onDrop={(data) => {
          let step = props.step;
          step[slot.attribute] = data;
          props.onUpdateStep(step);
        }}
        onChange={(value) => {
          let step = props.step;
          step[slot.attribute] = value;
        }}/>);
    } else {
      return (<span key={i} className="slot" key={i}>{slot.value}</span>);
    }
  } else if (slot.type === "expression") {
    return getExpressionSlot(slot, i, props);
  } else if (slot.type === "point") {
    return (<span className="slot" key={i}>{getDescription(slot.value, props)}</span>);
  } else if (slot.type === "name") {
    return (<input 
      className="slot slot-input" 
      size={Math.max(slot.value.length, 1)} 
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
  let slots = props.getSlots(info, step);
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
