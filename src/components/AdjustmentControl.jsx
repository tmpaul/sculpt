import BaseComponent from "core/BaseComponent";
import ReactDOM from "react-dom";

export default class AdjustmentControl extends BaseComponent {
  constructor(props, ...args) {
    super(props, ...args, { bind: true });
    let { min, max } = this.getMinMax(props.min, props.max, props);
    let x0 = (190) * (props.value - min) / (max -  min);
    this.state = {
      active: false,
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
      elTop: rect.top + rect.height / 2 - 30,
      elLeft: rect.left + rect.width / 2 - 100
    });
  }

  render() {
    return (
      <span>
        {this.state.active && (<span style={{
          width: 200,
          position: "fixed",
          top: this.state.elTop,
          left: this.state.elLeft,
          background: "#212121",
          borderRadius: "10px",
          height: "10px",
          border: "1px solid gray"
        }}>
        <span
          style={{
            position: "absolute",
            top: -1,
            background: "rgb(40, 151, 224)",
            height: 10,
            width: 10,
            borderRadius: "50%",
            left: this.state.x
          }}
        /></span>)}
        <span ref={(el) => this.el = el} className="editable-input"
        onDoubleClick={this.props.onDoubleClick}
        onMouseLeave={this.handleMouseLeave}
        onMouseEnter={this.handleMouseEnter}>
          {this.state.value.toFixed(3)}
        </span>
      </span>
    );
  }

  stopDrag() {
    this.setState({
      active: false,
      x0: this.state.x
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
    let x = this.state.x0 + diff;
    let { min, max } = this.state;
    // When diff is 100 reach props.max, when diff is -100, reach props.min
    let value = min + (x) / 200 * (max - min);
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
        this.setState({
          active: true,
          p0: e.clientX
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
        p0: rect.left + rect.width / 2,
        waitingForShiftKey: true
      });
    }
    return false;
  }
}
