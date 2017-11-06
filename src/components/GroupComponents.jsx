import BaseComponent from "core/BaseComponent";
import ReactDOM from "react-dom";
import Marker from "components/Marker";
import Rectangle from "components/rect/Rectangle";
import Draggable from "components/Draggable";


let DraggableRect = Draggable("rect");

/**
 * A root SVG <g> component. It simply showing snapping points
 * @param {Object} props Properties passed down to this component
 * @return {Object} React render tree
 */
export default class Canvas extends BaseComponent {

  static defaultProps = {
    width: 660,
    height: 420,
    translateX: 20,
    translateY: 20,
    canvasWidth: 700,
    canvasHeight: 460
  };

  static displayName = "Canvas";

  constructor(...args) {
    super(...args);
    this.autoBind();
  }

  static getSnappingPoint =  Rectangle.getSnappingPoint;
  static getSnappingPoints = Rectangle.getSnappingPoints;

  componentDidMount() {
    let node = ReactDOM.findDOMNode(this);
    // The bounding box is used to calculat the offsets that need to be applied
    // to events from canvas
    this.bbox = node.getBoundingClientRect();
    this.forceUpdate();
  }

  render() {
    return (
      <g>
        {
          // There is a hidden rectangle with width and height for capturing mouse events
        }
        <DraggableRect
          x={0}
          y={0}
          width={this.props.canvasWidth}
          height={this.props.canvasHeight}
          fill="transparent"
          stroke="none"
          mode={null}
          onDragStart={this.handleDragStart}
          onDrag={this.handleDrag}
          onDragEnd={this.handleDragEnd}
        />
        <g transform={`translate(${this.props.translateX}, ${this.props.translateY})`}>
          {
            // Draw a rect showcasing the canvas border
          }
          <rect
            x={0}
            y={0}
            width={this.props.width}
            height={this.props.height}
            fill="none"
            pointerEvents="none"
            mode={this.props.mode}
            stroke="#dedede"
            strokeWidth="1px"
          />
          {this.props.children}
        </g>
      </g>
    );
  }

  handleDragStart({ origin } = {}) {
    this.handleEvent("CANVAS_DRAG_START", {
      x: origin[0],
      y: origin[1]
    });
  }

  handleDrag({ origin, x, y, dx, dy } = {}) {
    this.handleEvent("CANVAS_DRAG_MOVE", {
      x: origin[0] + x,
      y: origin[1] + y,
      deltaX: x,
      deltaY: y
    });
  }

  handleDragEnd({ origin, x, y } = {}) {
    this.handleEvent("CANVAS_DRAG_END", {
      x: origin[0] + x,
      y: origin[1] + y
    });
  }

  handleEvent(eventType, payload) {
    if (eventType === "CANVAS_DRAG_START" || eventType === "CANVAS_DRAG_END" || eventType === "CANVAS_DRAG_MOVE") {
      let { translateX, translateY, width, height } = this.props;
      // payload.x -= this.bbox.left;
      // payload.y -= this.bbox.top;
      payload.x = Math.max(translateX, Math.min(payload.x, width + translateX)) - translateX;
      payload.y = Math.max(translateY, Math.min(payload.y, height + translateY)) - translateY;
    }
    if (eventType === "CANVAS_DRAG_MOVE") {
      let { width, height } = this.props;
      payload.deltaX = Math.min(payload.deltaX, width);
      payload.deltaY = Math.min(payload.deltaY, height);
    }
    if (eventType === "SELECT") {
      return;
    }
    this.props.handleEvent({
      type: eventType,
      payload
    });
  }
};
