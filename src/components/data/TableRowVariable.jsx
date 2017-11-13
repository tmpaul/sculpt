import BaseComponent from "core/BaseComponent";
import EditableStringInput from "components/EditableStringInput";
import { isNumeric } from "utils/TypeUtils";

export default class TableRowVariable extends BaseComponent {
  // *********************************************************
  // Static properties
  // *********************************************************
  static defaultProps = {
    variable: {
      name: "",
      stats: []
    }
  };
  // *********************************************************
  // Constructor
  // *********************************************************
  constructor(...args) {
    super(...args);
    this.state = {
      showStats: false
    };
    this.autoBind();
  }
  // *********************************************************
  // React methods
  // *********************************************************
  render() {
    return (
      <span className="row-variable">
        <EditableStringInput
          value={this.props.variable.name}
          onDrag={this.handleRowVariableDrag}
          onChange={this.props.onChange}
        />
        <span className={"arrow " + (this.state.showStats ? "arrow-up" : "arrow-down")} onClick={this.toggleStatistics}>
        </span>
        {this.state.showStats && (
          <ul className="row-variable-dropdown">
            {this.props.variable.stats.map((stat, index) => {
              return (<li key={index} className="parameter-row">
              <span className="parameter-name">
                <EditableStringInput
                  value={stat.name}
                  onDrag={this.handleRowVariableStatisticDrag.bind(null, stat.type)}
                  onChange={BaseComponent.NOOP}
                />
              </span>
              <span className="parameter-value">
                {isNumeric(stat.value) ? Number(stat.value).toFixed(3) : stat.value}
              </span>
            </li>);
            })}
          </ul>
        )}
      </span>
    );
  }

  // *********************************************************
  // Private methods
  // *********************************************************
  toggleStatistics() {
    this.setState({
      showStats: !this.state.showStats
    });
  }

  handleRowVariableDrag(event) {
    this.props.onDrag(event, "rowVariable");
  }

  handleRowVariableStatisticDrag(statName, event) {
    this.props.onDrag(event, "rowVariableStatistic", statName);
  }
};
