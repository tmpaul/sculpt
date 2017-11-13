import { PropTypes } from "react";
import BaseComponent from "core/BaseComponent";
import Parameter from "components/parameters/Parameter";

export default class ParametersPanel extends BaseComponent {
  // *********************************************************
  // Constructor
  // *********************************************************
  constructor(...args) {
    super(...args);
    this.autoBind();
  }
  // *********************************************************
  // React methods
  // *********************************************************
  render() {
    let parameters = this.props.parameters || [];
    return (
      <div className="parameters-panel-container">
        <h4 style={{ margin: 0 }}>Parameters</h4>
        {
          // A row for each parameter
        }
        {parameters.map((parameter, index) => {
          return (
            <Parameter
              key={index}
              name={parameter.name}
              value={parameter.value}
              expressionResolver={this.props.expressionResolver}
              onDrag={this.handleDrag.bind(null, index)}
              onRemove={this.handleRemove.bind(null, index)}
              onChange={this.handleChange.bind(null, index)}
            />
          );
        })}
        {
          // Invisible row for adding a new one
        }
        <Parameter
          dummy={true}
          onChange={this.handleChange.bind(null, parameters.length)}
        />
      </div>
    );
  }

  // *********************************************************
  // Event handlers
  // *********************************************************
  /**
   * Handle a parameter attribute change
   * @param  {Number} index The index of the parameter being modified
   * @param  {String} attributeType The type of attribute being changed e.g `name`, `value`
   * @param  {String|Object} changedValue  The changed value
   */
  handleChange(index, attributeType, changedValue) {
    let parameter = this.props.parameters[index] || {};
    parameter[attributeType] = changedValue;
    this.props.onParameterChange(index, parameter);
    this.forceUpdate();
  }

  /**
   * Remove a parameter corresponding to the given index
   * @param  {Number} index The index of the parameter in question
   */
  handleRemove(index) {
    // this.props.parameters.splice(index, 1);
    // this.forceUpdate();
  }

  handleDrag(index, event) {
    let parameter = this.props.parameters[index];
    event.dataTransfer.setData("text", JSON.stringify({
      type: "parameter",
      // We only pass the index. To avoid duplicates, the Step
      // component will always fetch 
      value: index
    }));
  }
};
