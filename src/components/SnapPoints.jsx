import BaseComponent from "core/BaseComponent";
import ControlPoint from "components/Marker";
import SnapCross from "components/SnapCross";
import DrawingStore from "stores/DrawingStore";
import OperationStore from "stores/OperationStore";

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
          height={40}
          width={40}
        />)}
        {this.state.points.map((point, i) => {
          return (<ControlPoint key={i}
            x={point.pointX}
            y={point.pointY}
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
    }
    if (event === "HIDE_SNAP_POINTS") {
      this.setState({
        points: [],
        highlight: null
      });
    }
    if (event === "HIGHLIGHT_SNAP_POINT") {
      this.setState({
        highlight: this.state.points.length ? payload : null
      });
    }
    if (event === "UNHIGHLIGHT_SNAP_POINT") {
      this.setState({
        highlight: null
      });
    }
  }
};
