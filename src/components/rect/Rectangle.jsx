import { PropTypes } from "react";
import ControlPoint from "components/Marker";
import Draggable from "components/Draggable";
import { StyleUtils, DomEvents } from "utils/GenericUtils";
import { getTransformationMatrix } from "utils/TransformUtils";
import SnappingStore from "stores/SnappingStore";
import BaseComponent from "core/BaseComponent";
import OperationStore from "stores/OperationStore";
import { onMoveStart, onMove, onMoveEnd, getMovingStepSlots, evaluateMoveStep } from "components/rect/RectMoveHandler";
import { onScaleStart, onScale, onScaleEnd, getScalingStepSlots, evaluateScaleStep } from "components/rect/RectScaleHandler";
import { onDrawStart, onDraw, onDrawEnd, getDrawingStepSlots, evaluateDrawStep } from "components/rect/RectDrawHandler";
import { onRotateStart, onRotate, onRotateEnd, getRotationStepSlots, evaluateRotateStep } from "components/rect/RectRotateHandler";
import getSnappingPoints from "components/rect/SnapPoints";
import { Matrix } from "transformation-matrix-js";

let DraggableRect = Draggable("rect");
let merge = StyleUtils.merge;

export default class EditableRectangle extends BaseComponent {
  // *********************************************************
  // Static properties
  // *********************************************************
  static rectPropKeys = [ "x", "y", "width", "height", "fill", "stroke", "fillOpacity", "strokeOpacity", "strokeWidth" ];

  static displayName = "Rectangle";

  static getPropertyDefinition(name) {
    switch (name) {
      case "strokeOpacity":
      case "fillOpacity":
      case "strokeWidth":
        return { type: "number" };
      case "fill":
      case "stroke":
        return { type: "color" };
      default:
        return { type: null };
    }
  };

  static getSnappingPoint(props, name) {
    return EditableRectangle.getSnappingPoints(props, false).filter(function(point) {
      return point.name === name;
    })[0];
  };

  // Implementing these static methods automatically pass down new props.
  static getSnappingPoints = function(props, transform = true) {
    let points = getSnappingPoints(props);
    if (transform && props.transforms && props.transforms.length) {
      // Now transform the points using the rectangle's transform
      let matrix = getTransformationMatrix(props.transforms);
      return points.map((point) => {
        let tx =  matrix.applyToPoint(point.x, point.y);
        point.x = tx.x, point.y = tx.y;
        return point;
      });
    }
    return points;
  };

  static defaultProps = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    mode: null,
    transforms: [],
    fill: "rgba(236, 236, 236, 0.8)",
    translateX: 0,
    translateY: 0,
    stroke: "#ccc",
    fillOpacity: 1,
    strokeOpacity: 1,
    strokeWidth: 1
  };

  // *********************************************************
  // Constructor
  // *********************************************************
  constructor(...args) {
    super(...args);
    this.autoBind();
  }

  // *********************************************************
  // Render method
  // *********************************************************
  render() {
    let props = this.props;
    let dispatch = this.dispatch;
    let rectPropsObject = {};
    EditableRectangle.rectPropKeys.forEach((key) => {
      rectPropsObject[key] = props[key];
    });
    let op = OperationStore.getCurrentOperation() || {};
    let m = getTransformationMatrix(props.transforms);
    let transformStr = null;
    if (props.transforms && props.transforms.length) {
      transformStr = "";
      props.transforms.forEach((transform) => {
        if (transform.type === "translate") {
          transformStr += `translate(${transform.x}, ${transform.y})`;
        }
        if (transform.type === "rotate") {
          transformStr += `rotate(${transform.rotation}, ${transform.rotateX}, ${transform.rotateY})`;
        }
        if (transform.type === "scale") {
          transformStr += `scale(${transform.scaleX}, ${transform.scaleY})`; 
        }
      });
    }
    return (
      <g transform={transformStr}>
        <DraggableRect {...rectPropsObject}
          data-sculpt-id={props.componentId}
          className={props.className}
          onClick={(e) => dispatch("SELECT")}
          onContextMenu={this.handleContextMenu}
          fill={props.mode === "guide" ? "transparent" : rectPropsObject.fill}
          stroke={props.mode === "guide" ? "cyan" : rectPropsObject.stroke}
          pointerEvents={(op && op.operation) ? "none" : "auto"}
          vectorEffect="non-scaling-stroke"
          style={props.style}
        />
        <g style={{
          "display": props.mode ? "block" : (props.selected ? "block" : null)
        }}>
        {
          // Control points on corners
        }
        {EditableRectangle.getSnappingPoints(props, false).map((point, index) => {
          return (
            <ControlPoint
              key={point.name}
              x={point.x}
              y={point.y}
              mode={props.mode}
              selected={props.selected}
            />
          );
        })}
        </g>
      </g>
    );
  }
  // *********************************************************
  // Private methods
  // *********************************************************
  dispatch(eventType, partialProps = {}) {
    if (partialProps.width < 0) {
      partialProps.width = 0;
      delete partialProps.x;
    }
    if (partialProps.height < 0) {
      partialProps.height = 0;
      delete partialProps.y;
    }
    this.props.handleEvent({
      type: eventType,
      payload: partialProps
    });
  }

  handleContextMenu(event) {
    event.stopPropagation();
    event.preventDefault();
    this.dispatch("PROPERTIES", {
      x: event.clientX,
      y: event.clientY
    });
    return false;
  }
};

EditableRectangle.handlers = {};

// Attach operational handlers
EditableRectangle.getDrawingStepSlots = getDrawingStepSlots;
EditableRectangle.onDrawStart = onDrawStart;
EditableRectangle.onDraw = onDraw;
EditableRectangle.onDrawEnd = onDrawEnd;
EditableRectangle.handlers.draw = {
  handle: evaluateDrawStep
};

EditableRectangle.getMovingStepSlots = getMovingStepSlots;
EditableRectangle.onMoveStart = onMoveStart;
EditableRectangle.onMove = onMove;
EditableRectangle.onMoveEnd = onMoveEnd;
EditableRectangle.handlers.move = {
  handle: evaluateMoveStep
};

EditableRectangle.getScalingStepSlots = getScalingStepSlots;
EditableRectangle.onScaleStart = onScaleStart;
EditableRectangle.onScale = onScale;
EditableRectangle.onScaleEnd = onScaleEnd;
EditableRectangle.handlers.scale = {
  handle: evaluateScaleStep
};

EditableRectangle.getRotationStepSlots = getRotationStepSlots;
EditableRectangle.onRotateStart = onRotateStart;
EditableRectangle.onRotate = onRotate;
EditableRectangle.onRotateEnd = onRotateEnd;
EditableRectangle.handlers.rotate = {
  handle: evaluateRotateStep
};
