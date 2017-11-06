import { ObjectUtils } from "utils/GenericUtils";

let m = ObjectUtils.extend;

function selectedState(props) {
  let styles = {
    strokeWidth: 2,
    filter: "url(#bevel)",
    r: 5
  };
  if (props.selected) {
    if (!props.mode) {
      styles.fill = "#0a58ff";
      styles.stroke = "#cecece";
    }
    return styles;
  }
}

function snapMode(props) {
  return props.mode === "snap" ? {
    fill: "yellow",
    stroke: "orange",
    strokeWidth: 1
  } : undefined;
}

function guideMode(props) {
  return props.mode === "guide" ? {
    fill: "cyan",
    stroke: "#1bc1c1",
    strokeWidth: 2,
    r: 0,
  } : undefined;
}

function getMarkerProps(props) {
  return m(
    ControlPoint.defaultStyles,
    snapMode(props),
    guideMode(props),
    selectedState(props),
    {
      pointerEvents: props.passThrough ? "none" : "auto"
    }
  );
}

export default function ControlPoint(props) {
  return (
    <circle
      cx={props.x}
      cy={props.y}
      {...getMarkerProps(props)}
    />
  );
};

ControlPoint.defaultStyles = {
  r: 3,
  strokeWidth: 1,
  stroke: "none",
  fill: "none"
};

ControlPoint.defaultProps = {
  x: 0,
  y: 0,
  r: 3,
  size: 3,
  strokeWidth: 1,
  stroke: "none",
  fill: "none"
};

