import BaseComponent from "sculpt/core/BaseComponent";
import ControlPoint from "sculpt/components/Marker";
import SnapCross from "sculpt/components/SnapCross";
import DrawingStore from "sculpt/stores/DrawingStore";
import OperationStore from "sculpt/stores/OperationStore";

export default class SnapPoints extends BaseComponent {
  // *********************************************************
  // Constructor
  // *********************************************************
  constructor(...args) {
    super(...args);
    this.autoBind();
    this.state = {
      points: []
    };
    this.handleSnapStoreChange = this.handleSnapStoreChange.bind(this);
  }

  // *********************************************************
  // React methods
  // *********************************************************
  componentWillMount() {
    this.props.snappingStore.addChangeListener(this.handleSnapStoreChange);
  }

  componentWillUnmount() {
    this.props.snappingStore.removeChangeListener(this.handleSnapStoreChange);
  }

  render() {
    let op = OperationStore.getCurrentOperation() || {};
    return (
      <g>
        {this.state.highlight && (<SnapCross
          x={this.state.highlight.pointX}
          y={this.state.highlight.pointY}
          height={35}
          width={35}
        />)}
        {this.state.points.map((point, i) => {
          return (<ControlPoint key={i}
            x={point.pointX}
            y={point.pointY}
            onDragStart={() => this.props.handleEvent({
              type: "CONTROL_POINT_DRAG_START",
              source: point.pointId,
              payload: {
                x: point.pointX,
                y: point.pointY
              }
            })}
            onDrag={({ x, y }) => this.props.handleEvent({
              type: "CONTROL_POINT_DRAG_MOVE",
              source: point.pointId,
              payload: {
                deltaX: x,
                deltaY: y
              }
            })}
            onDragEnd={({ x, y }) => this.props.handleEvent({
              type: "CONTROL_POINT_DRAG_END",
              source: point.pointId,
              payload: {
                x: point.pointX + x,
                y: point.pointY + y
              }
            })}
            passThrough={op && op.operation === OperationStore.OPS.DRAW}
            mode="snap"
          />);
        })}
      </g>
    );
  }

  handleSnapStoreChange(event, payload) {
    if (event === "SHOW_SNAP_POINTS") {
      // Show all the snap and intersection points in this layer
      this.setState({
        points: payload
      });
    } else if (event === "HIDE_SNAP_POINTS") {
      this.setState({
        points: [],
        highlight: null
      });
    } else if (event === "HIGHLIGHT_SNAP_POINT") {
      this.setState({
        highlight: payload
      });
    } else if (event === "UNHIGHLIGHT_SNAP_POINT") {
      this.setState({
        highlight: null
      });
    }
  }
};
