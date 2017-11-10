import BaseComponent from "core/BaseComponent";
import { debounce } from "utils/GenericUtils";

export default class EditableStringInput extends BaseComponent {
  // *********************************************************
  // Constructor
  // *********************************************************
  constructor(props, ...args) {
    super(props, ...args);
    this.autoBind();
    this.state = {
      editing: true
    };
    this.blur = debounce(this._blur.bind(this), 500);
  }
  // *********************************************************
  // React methods
  // *********************************************************
  componentDidMount() {
    this._blur();
  }

  render() {
    return this.state.editing ? (
      <input
        ref={this.setInputRef}
        className="editable-string-input editing"
        value={this.props.value}
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.blur}
        size={this.props.value !== undefined ? (this.props.value.length + 1) : 1}
        onChange={this.handleChange}
      />
    ) : (
      <span
        draggable
        onDragStart={this.handleDragStart}
        onClick={this.handleClick}
        style={{
          display: "inline-block"
          // width: this.state.width,
          // height: this.state.height
        }}
        className="editable-string-input">
        {this.props.value}
      </span>
    );
  }
  // *********************************************************
  // Event handlers
  // *********************************************************
  handleChange(event) {
    let value = event.target.value;
    this.props.onChange(value);
  }

  handleMouseEnter() {
    this.input.focus();
  }

  setInputRef(el) {
    this.input = el;
  }

  handleDragStart(event) {
    this.props.onDrag(event);
  }

  handleClick() {
    this.setState({
      editing: true
    });
  }

  _blur() {
    this.input.blur();
    this.setState({
      editing: false
    });
  }
};
