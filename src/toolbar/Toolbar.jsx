import BaseComponent from "sculpt/core/BaseComponent";
import EditableRectangle from "sculpt/components/rect/Rectangle";

export default class Toolbar extends BaseComponent {
  // *********************************************************
  // React methods
  // *********************************************************
  render() {
    return (
      <div className="toolbar toolbar-fixed toolbar-right">
        {
          // Render each individual button
        }
        <button onClick={() => this.props.dispatchEvent({
          type: "INSERT_COMPONENT",
          payload: EditableRectangle
        })}>
          Rect
        </button>
        <button onClick={() => this.props.dispatchEvent({
          type: "MOVE"
        })}>
          Move
        </button>
        <button onClick={() => this.props.dispatchEvent({
          type: "SCALE"
        })}>
          Scale
        </button>
        <button onClick={() => this.props.dispatchEvent({
          type: "GUIDE"
        })}>
          Guide
        </button>
        <button onClick={() => this.props.dispatchEvent({
          type: "LOOP"
        })}>
          Loop
        </button>
      </div>
    );
  }
};
