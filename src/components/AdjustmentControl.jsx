import BaseComponent from "core/BaseComponent";
import ReactDOM from "react-dom";
import BlurInput from "components/BlurInput";

export default class AdjustmentControl extends BaseComponent {

  static defaultProps = {
    sensitivity: 1
  };

  constructor(props, ...args) {
    super(props, ...args, { bind: true });
    let { min, max } = this.getMinMax(props.min, props.max, props);
    let x0 = (190) * (props.value - min) / (max -  min);
    this.state = {
      active: false,
      edit: false,
      x0,
      x: x0,
      value: props.value,
      min,
      max
    };
  }

  componentWillMount() {
    document.addEventListener("mousemove", this.handleMouseMove);
    document.addEventListener("keyup", this.keyUp);
    document.addEventListener("keydown", this.keyDown);
  }

  componentWillUnmount() {
    document.removeEventListener("mousemove", this.handleMouseMove);
    document.removeEventListener("keyup", this.keyUp);
    document.removeEventListener("keydown", this.keyDown);
  }

  componentDidMount() {
    this.offset();
  }

  getMinMax(min, max, props) {
    return {
      min: (props.min === undefined || props.min === null) ? (props.value < 0 ? 4 * props.value : (props.value === 0 ? -10 : -props.value)) : props.min,
      max: (props.max === undefined || props.max === null) ? (props.value > 0 ? 4 * props.value : (props.value === 0 ? 10 : -props.value)) : props.max
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.value !== this.props.value && !this.state.active) {
      let { min, max } = this.getMinMax(nextProps.min, nextProps.max, nextProps);
      let x0 = (190) * (nextProps.value - min) / (max - min);
      this.setState({
        value: nextProps.value,
        x: x0,
        x0,
        min,
        max
      });
    }
  }

  offset() {
    let rect = ReactDOM.findDOMNode(this.el).getBoundingClientRect();
    this.setState({
      elTop: rect.top + rect.height / 2 - 20,
      elLeft: rect.left + rect.width / 2 - 100
    });
  }

  render() {
    let droppable = this.props.onDrop;
    return (
      <span className="adjustment-control">
        {this.state.active && (
          <span className="adjustment-control-slider" style={{
            top: this.state.elTop,
            left: this.state.elLeft
          }}>
            <span className="adjustment-control-knob" style={{
              left: this.state.x
            }}/>
          </span>)}
          {this.state.edit ? (
            <BlurInput
              size={5}
              className="adjustment-control-value"
              defaultValue={this.state.value.toFixed(3)}
              onBlur={() => this.setState({
                edit: false
              })}
              onChange={this.setinputValue}
            />
          ) : (<span 
            ref={(el) => this.el = el} 
            className="adjustment-control-value"
            onClick={this.setEdit}
            onDragOver={droppable ? this.allowDrop : BaseComponent.NOOP} 
            onDrop={droppable ? this.drop : BaseComponent.NOOP}
            onMouseLeave={this.handleMouseLeave}
            onMouseEnter={this.handleMouseEnter}>
            {this.state.value.toFixed(3)}
          </span>)}
        </span>);
  }

  setEdit() {
    this.setState({
      edit: true
    });
    this.stopDrag();
  }

  setinputValue(event) {
    try {
      let value = eval(event.target.value);
      this.setState({ 
        value
      }, () => {
        this.props.onChange(value);
      });
    } catch(e) {

    }
  }

  allowDrop(event) {
    event.preventDefault();
  }

  drop(event) {
    event.preventDefault();
    let data = JSON.parse(event.dataTransfer.getData("text/plain"));
    // AdjustmentControl does not really care about what expression
    // is dropped, that is upto the step evaluator to care. Just insert
    // the appropriate component
    if (this.props.onDrop) {
      this.props.onDrop(data);
    }
  }

  stopDrag() {
    this.setState({
      active: false,
      p0: undefined,
      x0: this.state.x,
      waitingForShiftKey: false
    });
    document.body.style.cursor = "auto";
    document.body.style.userSelect = undefined;
    window.adjustmentControlLocked = false;
    // Recalculate
    let { min, max } = this.getMinMax(this.props.min, this.props.max, {
      min: this.props.min,
      max: this.props.max,
      value: this.state.value
    });
    let x0 = (190) * (this.state.value - min) / (max -  min);
    this.setState({
      min,
      max,
      x: x0,
      x0
    });
    if (this.props.onChangeEnd) {
      this.props.onChangeEnd(this.state.value, this.props.name);
    }
  }

  handleMouseMove(e) {
    if (this.state.active) {
      // Track and update position of adjustment slider
      // using mouse position
      if (e.shiftKey) {
        if (!this.state.p0) {
          this.state.p0 = e.clientX;
        }
        this.handleDrag(e.clientX - this.state.p0);
      }
    }
  }

  handleMouseLeave(e) {
    this.setState({
      waitingForShiftKey: false
    });
  }

  keyUp(e) {
    // Check if shiftKey is released.
    if (e.which === 16 && this.state.active) {
      this.stopDrag();
    }
  }

  keyDown(e) {
    if (e.which === 16) {
      if (this.state.waitingForShiftKey) {
        if (!this.state.active) {
          // Lock so that only one is active at a time
          if (!window.adjustmentControlLocked) {
            window.adjustmentControlLocked = true;
          } else {
            return;
          }
          this.offset();
          this.setState({
            active: true
          });
          if (this.props.onChangeStart) {
            this.props.onChangeStart(this.state.value, this.props.name);
          }
          document.body.style.cursor = "ew-resize";
          document.body.style.userSelect = "none";
        }
      }
    }
  }

  handleDrag(diff) {
    let x = (this.state.x0 + diff * this.props.sensitivity);
    let { min, max } = this.state;
    // When diff is 100 reach props.max, when diff is -100, reach props.min
    let value = (min + (x) / 190 * (max - min));
    if (max && value > max) {
      value = max;
    }
    if (((min !== null) || (min !== undefined)) && value < min) {
      value = min;
    }
    this.setState({
      value,
      x: Math.max(0, Math.min(x, 190)),
    }, () => {
      if (this.props.onChange) {
        this.props.onChange(value, this.props.name);
      }
    });
  }

  handleMouseEnter(e) {
    e.preventDefault();
    if (e.shiftKey) {
      // Calculate mouse position with respect to start position.
      if (!this.state.active) {
        // Lock so that only one is active at a time
        if (!window.adjustmentControlLocked) {
          window.adjustmentControlLocked = true;
        } else {
          return;
        }
        this.offset();
        let rect = ReactDOM.findDOMNode(this.el).getBoundingClientRect();
        this.setState({
          active: true
        });
        if (this.props.onChangeStart) {
          this.props.onChangeStart(this.state.value, this.props.name);
        }
        document.body.style.cursor = "ew-resize";
        document.body.style.userSelect = "none";
      }
      // Now until shift key is released, follow mouse cursor.
    } else {
      let rect = ReactDOM.findDOMNode(this.el).getBoundingClientRect();
      this.setState({
        waitingForShiftKey: true
      });
    }
    return false;
  }
}
