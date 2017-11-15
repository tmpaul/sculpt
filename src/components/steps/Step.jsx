import AdjustmentControl from "components/AdjustmentControl";
import Parameter from "components/parameters/Parameter";
import { getPointDescription } from "utils/PointUtils";
import RichExpressionEditor from "components/RichExpressionEditor";

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
    return props.slotExpressionResolver(slot.value);
  }
}

function setName(id, name, props) {
  props.step.info = props.step.info || {};
  props.step.info.name = name;
  props.onUpdateStep(props.step);
}

function getExpressionSlot(slot, i, props) {
  return (
    <span key={i} className="editable-string-input">
        {getSlotValue(slot, props)}
    </span>
  );
}

function processSlot(id, slot, i, props) {
  if (slot.type === "text") {
    return (<span className="slot" key={i}>{slot.value}</span>);
  } else if (slot.type === "number" || slot.type === "expression") {
    if (slot.type === "expression" || slot.editable) {
      // If it is a pure number render AdjustmentControl     
      return <RichExpressionEditor
        key={i}
        expressionResolver={props.slotExpressionResolver}
        min={slot.min}
        max={slot.max}
        expressions={Array.isArray(slot.value) ? slot.value : [ slot.value ]}
        onUpdate={(expressions) => {
          let step = props.step;
          step[slot.attribute] = expressions;
          props.onUpdateStep(step);
        }}
      />;
    }
    return (<span key={i} className="editable-string-input">{slot.value}</span>);
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
    <div className={"step current-step " + (props.single ? "single-line " : " ")}
      onClick={props.single ? props.onClick : Step.defaultProps.onClick}
    >
      {slots}
    </div>
  );
};

Step.defaultProps = {
  onClick: () => {}
};
