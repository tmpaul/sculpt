import { PropTypes } from "react";
import BaseComponent from "core/BaseComponent";
import { ObjectUtils } from "utils/GenericUtils";
import AdjustmentControl from "components/AdjustmentControl";
import RichExpressionEditor from "components/RichExpressionEditor";
import { isColor } from "utils/ColorUtils";
import EditableStringInput from "components/EditableStringInput";

export default class Parameter extends BaseComponent {
  // *********************************************************
  // Static properties
  // *********************************************************
  static defaultProps = {
    name: "",
    value: ""
  };

  static renderSlot(slot, parameter) {
    return (
      <span className="editable-string-input">
        {parameter.name}
      </span>
    );
  };

  // *********************************************************
  // Constructor
  // *********************************************************
  constructor(...args) {
    super(...args);
    this.autoBind();
    this.state = {
      editingName: false
    };
  }
  // *********************************************************
  // React methods
  // *********************************************************
  render() {
    let { name, value } = this.props;
    if (this.props.dummy) {
      return (
        <div className="parameter-row dummy">
          {
            // On hover show the span and on click add a new parameter
          }
          <span onClick={this.addNew}>+</span>
        </div>
      );
    }
    return (
      <div className="parameter-row">
        <div className="parameter-name">
          <EditableStringInput
            value={name}
            onDrag={this.props.onDrag}
            onChange={this.handleNameChange}
          />
        </div>
        <div className="parameter-value">
          <RichExpressionEditor
            expressionResolver={this.props.expressionResolver}
            expressions={Array.isArray(value) ? value : [ value ]}
            onUpdate={this.handleValueChange}
          />
        </div>
      </div>
    );
  }
  // *********************************************************
  // Private methods
  // *********************************************************
  handleNameChange(value) {
    if (!value.length) {
      // Remove parameter
      value = "";
    }
    this.props.onChange("name", value);
  }
  handleValueChange(value) {
    // Figure out if value is a number, a string or a color type
    this.props.onChange("value", value);
  }

  toggleNameEdit() {
    this.setState({
      editingName: !this.state.editingName
    });
  }

  addNew() {
    this.props.onChange("name", "key");
    this.props.onChange("value", 0.0);
  }

  ascertainValueType(value) {
    if (ObjectUtils.isObject(value)) {
      // We have a problem, we cannot use this
      return;
    }
    if (isNaN(parseFloat(value))) {
      if (typeof value === "string") {
        // Check if it matches a color regex
        if (isColor(value)) {
          return "color";
        }
        return "string";
      }
    } else {
      return "number";
    }
  }
};
