import BaseComponent from "core/BaseComponent";
import EditableRectangle from "components/rect/Rectangle";
import OperationStore from "stores/OperationStore";

export default class Toolbar extends BaseComponent {
  // *********************************************************
  // React methods
  // *********************************************************
  render() {
    let op =  OperationStore.getCurrentOperation() || {};
    return (
      <div className="toolbar toolbar-fixed toolbar-right">
        <div>
          <h4>DRAW</h4>
          <button className={(op.operation === OperationStore.OPS.DRAW && op.args === EditableRectangle) ? "active" : undefined} 
            onClick={() => this.props.dispatchEvent({
              type: "INSERT_COMPONENT",
              payload: EditableRectangle
            })}>
            Rect
          </button>
        </div>
        <div>
          <h4>ADJUST</h4>
          {
            // Render each individual button
          }
          <button className={op.operation === OperationStore.OPS.MOVE ? "active" : undefined} 
            onClick={() => this.props.dispatchEvent({
              type: "MOVE"
            })}>
            Move
          </button>
          <button className={op.operation === OperationStore.OPS.SCALE ? "active" : undefined} 
            onClick={() => this.props.dispatchEvent({
              type: "SCALE"
            })}>
            Scale
          </button>
          <button className={op.operation === OperationStore.OPS.ROTATE ? "active" : undefined} 
            onClick={() => this.props.dispatchEvent({
              type: "ROTATE"
            })}>
            Rotate
          </button>
        </div>
        <div>
          <h4>MODIFIERS</h4>
          <button onClick={() => this.props.dispatchEvent({
            type: "GUIDE"
          })}>
            Guide
          </button>
        </div>
        <div>
          <h4>FLOW</h4>
            <button onClick={() => this.props.dispatchEvent({
              type: "LOOP"
            })}>
            Loop
          </button>
        </div>
      </div>
    );
  }
};
