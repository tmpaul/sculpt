import BaseComponent from "core/BaseComponent";
import PropertyPanelStore from "stores/PropertyPanelStore";
import EditableProperty from "components/EditableProperty";

export default class PropertyPanel extends BaseComponent {
  constructor(...args) {
    super(...args);
    this.autoBind();
    this.state = {
      componentProps: null
    };
  }

  componentWillMount() {
    PropertyPanelStore.setNotifyCallback(this.handleStoreChange);
  }

  componentWillUnmount() {
    PropertyPanelStore.setNotifyCallback(null);
  }

  render() {
    return (
      <div className="component-property-panel" style={{
        left: this.state.x,
        top: this.state.y,
        display: this.state.componentProps ? "block" : "none"
      }}>
        <span onClick={this.close}>
          Close
        </span>
        {this.state.componentProps && (
          <ul>
          {Object.keys(this.state.componentProps).map((propKey, index) => {
            let value = this.state.componentProps[propKey];
            let defintion = this.state.componentType.getPropertyDefinition(propKey);
            return (
              <li key={index}>
                <span>{propKey}</span>
                <EditableProperty 
                  type={defintion.type}
                  value={value}
                  onChange={this.onPropChange.bind(null, propKey)}
                />
              </li>
            );
          })}
          </ul>
        )}
      </div>
    );
  }

  onPropChange(property, value) {
    this.state.componentProps[property] = value;
    this.state.changeCallback({
      [property]: value
    });
    this.forceUpdate();
  }

  close() {
    this.setState({
      componentType: undefined,
      componentProps: undefined,
      changeCallback: undefined,
      x: 0,
      y: 0
    });
  }

  handleStoreChange(componentProps, componentType, { x, y } = {}, changeCallback) {
    this.setState({
      x,
      y,
      componentType,
      componentProps,
      changeCallback
    });
  }
};
