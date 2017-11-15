import BaseComponent from "core/BaseComponent";
import EditableRectangle from "components/rect/Rectangle";
import OperationStore from "stores/OperationStore";

export default class Toolbar extends BaseComponent {
  // *********************************************************
  // Constructor
  // *********************************************************
  constructor(...args) {
    super(...args);
    this.autoBind();
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
  }
  // *********************************************************
  // React methods
  // *********************************************************
  componentWillMount() {
    document.addEventListener("keydown", this.handleKeyDown);
    document.addEventListener("keyup", this.handleKeyUp);
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleKeyDown);
    document.addEventListener("keyup", this.handleKeyUp);
  }

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
            <span className="keyboard-shortcut">r</span>
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
            <span className="keyboard-shortcut">m</span>
          </button>
          <button className={op.operation === OperationStore.OPS.SCALE ? "active" : undefined} 
            onClick={() => this.props.dispatchEvent({
              type: "SCALE"
            })}>
            Scale
            <span className="keyboard-shortcut">s</span>
          </button>
          <button className={op.operation === OperationStore.OPS.ROTATE ? "active" : undefined} 
            onClick={() => this.props.dispatchEvent({
              type: "ROTATE"
            })}>
            Rotate
            <span className="keyboard-shortcut">u</span>
          </button>
        </div>
        <div>
          <h4>MODIFIERS</h4>
          <button onClick={() => this.props.dispatchEvent({
            type: "GUIDE"
          })}>
            Guide
            <span className="keyboard-shortcut">g</span>
          </button>
        </div>
        <div>
          <h4>FLOW</h4>
            <button onClick={() => this.props.dispatchEvent({
              type: "LOOP"
            })}>
            Loop
            <span className="keyboard-shortcut">l</span>
          </button>
        </div>
      </div>
    );
  }
  // *********************************************************
  // Event handlers
  // *********************************************************
  handleKeyDown(event) {
    if (event.target.tagName === "INPUT") {
      return;
    }
    let keyCode = event.keyCode;
    if (keyCode === 16) {
      // SHIFT key
      this.props.handleToolbarEvent({
        type: "SHIFT_KEY",
        value: true
      });
    }
    // Key : r
    if (keyCode === 82) {
      this.props.handleToolbarEvent({
        type: "INSERT_COMPONENT",
        payload: EditableRectangle
      });
    }
    // Key: m
    if (keyCode === 77) {
      this.props.handleToolbarEvent({
        type: "MOVE"
      });
    }
    // Key: s
    if (keyCode === 83) {
      this.props.handleToolbarEvent({
        type: "SCALE"
      });
    }
    // Key: g
    if (keyCode === 85) {
      this.props.handleToolbarEvent({
        type: "GUIDE"
      });
    }

    // Key: u
    if (keyCode === 71) {
      this.props.handleToolbarEvent({
        type: "ROTATE"
      });
    }

    // Key: l
    if (keyCode === 77) {
      this.props.handleToolbarEvent({
        type: "LOOP"
      });
    }
  }

  handleKeyUp(event) {
    let keyCode = event.keyCode;
    if (keyCode === 16) {
      // SHIFT key
      this.props.handleToolbarEvent({
        type: "SHIFT_KEY",
        value: false
      });
    }
  }
};
