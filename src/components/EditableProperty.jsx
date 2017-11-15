import { PropTypes } from "react";
import { SketchPicker } from "react-color";
import AdjustmentControl from "components/AdjustmentControl";
import BaseComponent from "core/BaseComponent";
import { COLOR_REGEX, getRGBAComponents } from "utils/ColorUtils";

export default class EditableProperty extends BaseComponent {
  // *********************************************************
  // Static fields
  // *********************************************************
  static propTypes = {
    type: PropTypes.string,
    value: PropTypes.any,
    onChange: PropTypes.func
  };
  // *********************************************************
  // Constructor
  // *********************************************************
  constructor(...args) {
    super(...args);
    this.autoBind();
    this.state = {
      editing: false
    };
  }

  // *********************************************************
  // React methods
  // *********************************************************
  render() {
    // Get the appropriate component based on type
    return (
      <span style={{ marginLeft: "20px" }}>
        {this.state.editing ? 
          (
            <span style={{ position: "absolute", zIndex: 2 }}>
              {this.getAppropriateComponent(this.props)}
            </span>
          ) :
          this.props.value}
        <span style={{ float: "right" }} onClick={() => this.setState({ editing: !this.state.editing })}>
          {this.state.editing ? "Close" : "Edit"}
        </span>
      </span>
    );
  }

  /**
   * Get the component to render based on type of property
   * @param {Object} props The component props
   * @return {React.Component} An appropriate react component based on the property
   */
  getAppropriateComponent(props) {
    switch (props.type) {
      case "color":
        return (<SketchPicker 
          color={this.formatColor(props.value)} 
          onChangeComplete={({ rgb }) => props.onChange(`rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${rgb.a})`)}/>);
      case "number":
        // Expression with slider
        return (<AdjustmentControl value={props.value} onChange={(v) => props.onChange(Number(v))}/>);
    };
  }

  /**
   * Format and normalize color into rgba format or hex string
   * @param  {String} color The color to normalize
   * @return {String|Object}       Color object with r,g,b,a values or hex string
   */
  formatColor(color) {
    if (COLOR_REGEX.hex.strict.test(color)) {
      return color;
    } else if (COLOR_REGEX.rgb.strict.test(color) || COLOR_REGEX.rgba.strict.test(color)) {
      return getRGBAComponents(color);
    }
    return color;
  }
};
