import { PropTypes } from "react";
import { SketchPicker } from "react-color";
import AdjustmentControl from "sculpt/components/AdjustmentControl";
import BaseComponent from "sculpt/core/BaseComponent";

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
        <i className="fa fa-edit" style={{ float: "right" }} onClick={() => this.setState({ editing: !this.state.editing })}/>
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
        return (<SketchPicker color={props.value} onChangeComplete={(v) => props.onChange(v.hex)}/>);
      case "number":
        // Expression with slider
        return (<AdjustmentControl value={props.value} onChange={(v) => props.onChange(Number(v))}/>);
    };
  }
};
