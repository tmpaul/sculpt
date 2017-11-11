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
      editing: false
    };
    this.blur = debounce(this._blur.bind(this), 1000);
  }
  // *********************************************************
  // React methods
  // *********************************************************
  componentDidMount() {
    this._blur();
  }

  render() {
    return (
      <input
        ref={this.setInputRef}
        onClick={this.handleClick}
        className="editable-string-input"
        draggable={!this.state.editing}
        onDragStart={this.handleDragStart}
        value={this.props.value}
        onMouseLeave={this.blur}
        size={this.props.value !== undefined ? (Math.max(this.props.value.length, 1)) : 1}
        onChange={this.handleChange}
        readOnly={!this.state.editing}
      />
    );
  }
  // *********************************************************
  // Event handlers
  // *********************************************************
  handleChange(event) {
    let value = event.target.value;
    this.props.onChange(value);
  }

  setInputRef(el) {
    this.input = el;
  }

  handleDragStart(event) {
    if (!this.state.editing) {
      this.props.onDrag(event);
    }
  }

  handleClick() {
    if (!this.state.editing) {
      this.setState({
        editing: true
      });
      this.input.focus();
      // https://stackoverflow.com/questions/511088/use-javascript-to-place-cursor-at-end-of-text-in-text-input-element
      setTimeout(() => {
        this.input.selectionStart = this.input.selectionEnd = 10000; 
      }, 0);
    }
  }

  _blur() {
    this.input.blur();
    this.setState({
      editing: false
    });
  }
};
