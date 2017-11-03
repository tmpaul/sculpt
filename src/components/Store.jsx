import React from "react";
import BaseComponent from "sculpt/core/BaseComponent";
import EventStore from "sculpt/stores/EventStore";
import OperationStore from "sculpt/stores/OperationStore";
import DrawingStore from "sculpt/stores/DrawingStore";


export default class Store extends BaseComponent {
  constructor(props, ...args) {
    super(props, ...args);
    this.autoBind();
  }

  // componentWillMount() {
  //   this.props.propStore.onChange(this.props.componentId, this.handlePropStoreChange);
  // }

  // componentWillUnmount() {
  //   this.props.propStore.removeCallback(this.props.componentId, this.handlePropStoreChange);
  // }

  // componentDidMount() {
  //   this.notifySnapStore();
  // }

  render() {
    // Get current properties
    let child = React.Children.only(this.props.children);
    // If child is a primitive, wrap using a PrimitiveWrapper.
    return React.cloneElement(child, this.getProps(this.props));
  }

  getComponentProps(props) {
    return props.propStore.getProps(props.componentId) || {};
  }

  getProps(props) {
    let componentProps = this.getComponentProps(props);
    let child = React.Children.only(props.children);
    return Object.assign({}, child.props, componentProps, {
      handleEvent: this.handleEvent
    });
  }

  handlePropStoreChange() {
    this.forceUpdate();
  }

  handleEvent(event) {
    event.source = this.props.componentId;
    this.props.handleEvent(event);
  }
}
