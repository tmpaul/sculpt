import PropTypes from "prop-types";
import React from "react";
import ReactDOM from "react-dom";
import { DomEvents } from "utils/GenericUtils";
import BaseComponent from "core/BaseComponent";

export default (Component) => {
  class DraggableComponent extends BaseComponent {
    constructor(props) {
      super(props, {
        bind: true
      });
      this.state = {
        dragstart: false,
        dragging: false,
        dragend: false,
        x: 0,
        y: 0,
        dragOriginX: 0,
        dragOriginY: 0
      };

      this.handleMouseUp = this.handleMouseUp.bind(this);
      this.handleMouseMove = this.handleMouseMove.bind(this);
      this.handleMouseDown = this.handleMouseDown.bind(this);
    }

    componentWillMount() {
      DomEvents.on(document, "mouseup", this.handleMouseUp);
      DomEvents.on(document, "mousemove", this.handleMouseMove);
    }

    componentDidMount() {
      let node = ReactDOM.findDOMNode(this);
      this.node = node;
      var svg   = document.getElementsByTagName('svg');
      if (svg) {
        svg = svg[0];
        var svgNS = svg.getAttribute('xmlns');
        var pt    = svg.createSVGPoint();
        this.pt = pt;
      }
      DomEvents.on(node, "mousedown", this.handleMouseDown);
    }

    componentWillUnmount() {
      DomEvents.off(document, "mouseup", this.handleMouseUp);
      DomEvents.off(document, "mousemove", this.handleMouseMove);
      DomEvents.off(this.node, "mousedown", this.handleMouseDown);
      this.node = null;
    }

    handleMouseUp(e) {
      if(this.state.dragging || this.state.dragstart) {
        DomEvents.pauseEvent(e);
        this.props.onDragEnd({
          origin: [ this.state.dragOriginX, this.state.dragOriginY ],
          x: this.state.x,
          y: this.state.y,
          dx: 0,
          dy: 0
        });
        this.setState({
          dragend: true,
          dragging: false,
          dragstart: false,
          x: 0,
          y: 0,
          dragOriginX: 0,
          dragOriginY: 0
        });
      }
    }

    handleMouseMove(e) {
      let { restrictX, restrictY } = this.props;
      let x =  e.offsetX, y = e.offsetY;
      if (this.mat && !this.props.noMatrix) {
        this.pt.x = x;
        this.pt.y = y;
        let tx = this.pt.matrixTransform(this.mat);
        x = tx.x;
        y = tx.y;
      }
      if(this.state.dragstart) {
        DomEvents.pauseEvent(e);
        this.setState({
          dragstart: false,
          dragging: true,
          dragend: false,
          x: (restrictX) ? (this.state.x) : (x - this.state.dragOriginX),
          y: (restrictY) ? (this.state.y) : (y - this.state.dragOriginY)
        });
      } else if(this.state.dragging) {
        DomEvents.pauseEvent(e);
        // Callback only if diff has changed.
        if((this.state.x !== (x - this.state.dragOriginX)) || (y !== (e.clientY - this.state.dragOriginY))) {
          this.props.onDrag({
            origin: [ this.state.dragOriginX, this.state.dragOriginY ],
            x: this.state.x,
            y: this.state.y,
            dx: (restrictX) ? 0 : ((x - this.state.dragOriginX) - this.state.x),
            dy: (restrictY) ? 0 : ((y - this.state.dragOriginY) - this.state.y)
          });
        }
        this.setState({
          dragstart: false,
          dragging: true,
          dragend: false,
          x: (restrictX) ? (this.state.x) : (x - this.state.dragOriginX),
          y: (restrictY) ? (this.state.y) : (y - this.state.dragOriginY)
        });
      }
    }

    handleMouseDown(e) {
      if(this.state.dragging) {
        DomEvents.pauseEvent(e);
        this.handleMouseUp(e);
        return;
      }
      if(!this.state.dragstart) {
        DomEvents.pauseEvent(e);
        let x = e.offsetX, y = e.offsetY;
        if (this.node.getCTM && !this.props.noMatrix) {
          let mat = this.node.getCTM().inverse();
          this.mat = mat;
          if (this.pt) {
            this.pt.x = x;
            this.pt.y = y;
            let tx = this.pt.matrixTransform(mat);
            x = tx.x;
            y = tx.y;
          }
        }
        this.setState({
          dragstart: true,
          dragging: false,
          dragend: false,
          dragOriginX: (this.props.originX !== undefined) ? this.props.originX : x,
          dragOriginY: (this.props.originY !== undefined) ? this.props.originY : y
        });
        this.props.onDragStart({
          origin: [ this.state.dragOriginX, this.state.dragOriginY ]
        });
      }
    }
    render() {
      let { restrictX, restrictY, noMatrix, ...otherProps } = this.props;
      return (
        <Component
          {...otherProps}/>
      );
    }
  }

  let NOOP = function() {};

  DraggableComponent.defaultProps = {
    restrictX: false,
    restrictY: false,
    onDragStart: NOOP,
    onDrag: NOOP,
    onDragEnd: NOOP
  };

  DraggableComponent.propTypes = {
    restrictX: PropTypes.bool,
    restrictY: PropTypes.bool,
    originX: PropTypes.number,
    originY: PropTypes.number,
    onDragStart: PropTypes.func,
    onDrag: PropTypes.func,
    onDragEnd: PropTypes.func
  };

  return DraggableComponent;
};
