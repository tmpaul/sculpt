import BaseComponent from "sculpt/core/BaseComponent";
import ReactDOM from "react-dom";
import Marker from "sculpt/components/Marker";
import Rectangle from "sculpt/components/rect/Rectangle";

/**
 * A root SVG <g> component. It simply showing snapping points
 * @param {Object} props Properties passed down to this component
 * @return {Object} React render tree
 */
export class RootGroup extends BaseComponent {

  static defaultProps = {
    width: 295,
    height: 145,
    translateX: 6,
    translateY: 6,
    showMarkers: false
  };

  static displayName = "Canvas";

  constructor(...args) {
    super(...args);
    this.autoBind();
  }

  static getSnappingPoint =  Rectangle.getSnappingPoint;
  static getSnappingPoints = Rectangle.getSnappingPoints;

  componentWillReceiveProps(nextProps) {
    let node = ReactDOM.findDOMNode(this);
    if (node && nextProps.showMarkers === true && this.props.showMarkers === false) {
      // Store the bounding box to show markers!
      this.bbox = node.getBBox();
    }
  }

  componentDidMount() {
    if (this.props.showMarkers) {
      let node = ReactDOM.findDOMNode(this);
      this.bbox = node.getBBox();
      this.forceUpdate();
    }
  }

  render() {
    let { showMarkers } = this.props;
    return (
      <g ref={(el) => this.rect = el} transform={`translate(${this.props.translateX}, ${this.props.translateY})`}>
        {
          // There is a hidden rectangle with width and height so that bounding rectangle is correct
        }
        <Rectangle
          x={this.props.x}
          y={this.props.y}
          width={this.props.width}
          height={this.props.height}
          fill="transparent"
          stroke="#d8d8d8"
          strokeWidth={1}
          showMarkers={this.props.showMarkers}
          mode={this.props.mode}
          handleEvent={this.handleEvent}
        />
        {this.props.children}
      </g>
    );
  }

  handleEvent(event) {
    event.type = event.type.replace("COMPONENT", "CANVAS");
    // if (event.type === "CANVAS_DRAG_START" || event.type === "CANVAS_DRAG_END") {
    //   let rect = this.rect.getBoundingClientRect();
    //   event.payload.x = event.payload.x - rect.left;
    //   event.payload.y = event.payload.y - rect.top;
    // }
    if (event.type === "SELECT") {
      return;
    }
    this.props.handleEvent(event);
  }
};
