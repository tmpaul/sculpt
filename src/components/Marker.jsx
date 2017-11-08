import { ObjectUtils } from "utils/GenericUtils";

let m = ObjectUtils.extend;

function selectedState(props) {
  let styles = {
    strokeWidth: 2,
    r: 5
  };
  if (props.selected) {
    if (!props.guide) {
      styles.fill = "#0a58ff";
      styles.stroke = "#cecece";
      styles.filter = "url(#bevel)";
    }
    return styles;
  }
}

function snapMode(props) {
  return props.snap ? {
    fill: "yellow",
    stroke: "orange",
    strokeWidth: 1
  } : undefined;
}

function guideMode(props) {
  return props.guide ? {
    fill: "cyan",
    stroke: "#14ebf5",
    strokeWidth: 2,
    r: 0
  } : undefined;
}

function getMarkerProps(props) {
  let customStyles = [];
  if (props.guide) {
    if (props.selected) {
      customStyles = [ guideMode(props), selectedState(props) ];
    } else {
      customStyles = [ props.snap ? snapMode(props) : guideMode(props) ];
    }
  } else {
    if (props.selected) {
      customStyles = [ selectedState(props) ];
    } else if (props.snap) {
      customStyles = [ snapMode(props) ];
    }
  }
  return m(
    ControlPoint.defaultStyles,
    ...customStyles,
    {
      pointerEvents: "none"
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

