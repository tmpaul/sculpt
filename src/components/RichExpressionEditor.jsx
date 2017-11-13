import BaseComponent from "core/BaseComponent";
import { ObjectUtils } from "utils/GenericUtils";
import AdjustmentControl from "components/AdjustmentControl";
import { isNumeric } from "utils/TypeUtils";

 /*
 * Uses canvas.measureText to compute and return the width of the given text of given font in pixels.
 * 
 * @param {String} text The text to be rendered.
 * @param {String} font The css font descriptor that text is to be rendered with (e.g. "bold 14px verdana").
 * 
 * @see https://stackoverflow.com/questions/118241/calculate-text-width-with-javascript/21015393#21015393
 */
function getTextWidth(text, font) {
  // re-use canvas object for better performance
  let canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement("canvas"));
  let context = canvas.getContext("2d");
  context.font = font;
  let metrics = context.measureText(text);
  return metrics.width;
}

export default class RichExpressionEditor extends BaseComponent {
  // *********************************************************
  // Static properties
  // *********************************************************
  static defaultProps = {
    editMode: false
  };
  // *********************************************************
  // Constructor
  // *********************************************************
  constructor(props, ...args) {
    super(props, ...args);
    this.autoBind();
    this.state = {
      // A sensible default character width. Can be used to approximately
      // calculate positions
      characterWidth: 7,
      // Cursor position
      cursorIndex: 0,
      editMode: props.editMode
    };
  }
  // *********************************************************
  // React methods
  // *********************************************************
  componentDidMount() {
    this.state.characterWidth = getTextWidth("g", "12px courier");
    this.forceUpdate();
  }

  render() {
    let expressions = this.props.expressions || [];
    let isNum = expressions.length === 1 && isNumeric(expressions[0]);
    if (isNum && !this.state.editMode) {
      return (
        <AdjustmentControl
          min={this.props.min}
          max={this.props.max}
          sensitivity={0.2}
          onEdit={this.toggleEditMode}
          value={Number(expressions[0])}
          onDrop={this.handleReplacementDrop}
          onChange={this.props.onUpdate}/>
      );
    }
    return (
      <span className="rich-expression-editor-container">
        {
          // Transparent input for actually typing and capturing keystrokes
        }
        <input
          ref={(el) => this.input = el}
          value={this.getSpaces(this.getValueLength(expressions))}
          style={{
            minWidth: this.state.characterWidth * (this.getValueLength(expressions) + 5)
          }}
          className={"rich-expression-editor " + (this.state.editMode ? "editing" : "")}
          onClick={this.handleClick}
          onDragOver={this.handleDragOver}
          onDrop={this.handleDrop}
          onKeyPress={this.handleKeyPress}
          onKeyDown={this.handleKeyDown}
          onPaste={this.handlePaste}
          onChange={BaseComponent.NOOP}
        />
        {
          // The value of input will be set based on what rich expressions are passed in
        }
        {expressions.map((expression, index) => {
          if (ObjectUtils.isObject(expression)) {
            let expressionName = this.props.expressionResolver(expression);
            return (
              <span style={{
                display: "inline-block",
                lineHeight: "normal",
                width: (expressionName.length + 2.5) * this.state.characterWidth
              }} key={index} className="editable-string-input">
                {expressionName}
              </span>
            );
          }
          return (<span key={index} className="unit">
            {expression}
          </span>);
        })}
        {
          // Cursor
        }
        <span className="cursor" style={{
          left: this.getCursorPosition(this.state.cursorIndex)
        }}>
        </span>
      </span>
    );
  }
  // *********************************************************
  // Event handlers
  // *********************************************************
  handleDragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "link";
  }

  toggleEditMode(event) {
    let x = event.clientX;
    this.setState({
      editMode: true
    }, () => {
      // Slice numbers into array
      let value = this.props.expressions.join("").split("");
      this.props.onUpdate(value);
      this.input.focus();
      setTimeout(() => {
        this.handleClick({
          clientX: x
        });
      });
    });
  }

  getCursorPosition(cursorIndex) {
    let { expressions } = this.props;
    let length = this.getValueLength(expressions.slice(0, cursorIndex));
    if (cursorIndex > expressions.length) {
      length += (cursorIndex - expressions.length);
    }
    return length * this.state.characterWidth;
  }

  handleClick(event) {
    let { expressions } = this.props;
    // Get cursorIndex based on where user clicked
    let cursorPosition = this.getSelectionStart(event.clientX);
    let L = this.getValueLength(expressions);
    let cursorIndex = 0;
    if (cursorPosition > L) {
      return this.setState({
        cursorIndex: expressions.length
      });
    }
    let ranges = this.getRecordRanges(expressions);
    for (let i = 0; i < ranges.length; i++) {
      let range = ranges[i];
      if (cursorPosition >= range.min && cursorPosition <= range.max) {
        let mid =  (range.min + range.max) / 2;
        cursorIndex = (cursorPosition > mid) ? (i + 1) : (i);
        break;
      }
    }
    this.setState({
      cursorIndex
    });
  }

  getRecordRanges(expressions) {
    let offset = 0, ranges = [];
    expressions.forEach((expression) => {
      let length = ObjectUtils.isObject(expression) ? (this.props.expressionResolver(expression).length + 2.5) : expression.length;
      ranges.push({
        min: offset,
        max: offset + length
      });
      offset += length;
    });
    return ranges;
  }

  handleKeyDown(event) {
    let cursorIndex = this.state.cursorIndex;
    switch (event.keyCode) {
      case 8:
        // Backspace or delete
        if (cursorIndex < 1) {
          return;
        }
        // If there is a selection range
        // TODO: Tharun this does not work correctly. Probe cause!
        let start = this.input.selectionStart;
        let end = this.input.selectionEnd;
        if (start !== end) {
          // Remove all ranges whose min is less than end and is greater than start
          let ranges = this.getRecordRanges(this.props.expressions);
          let newExpressions = [];
          ranges.forEach((range, i) => {
            if (!(range.min >= start && range.min <= end)) {
              newExpressions.push(this.props.expressions[i]);
            }
          });
          return this.setState({
            cursorIndex: Math.max(0, start)
          }, () => {
            this.props.onUpdate(newExpressions);
          });
        } else {
          let { expressions } = this.props;
          expressions.splice(cursorIndex - 1, 1);
          return this.setState({
            cursorIndex: Math.max(0, cursorIndex - 1)
          }, () => {
            this.props.onUpdate(expressions);
          });
        }
        break;
      case 37:
        // left arrow key
        this.setState({
          cursorIndex: Math.max(0, cursorIndex - 1)
        });
        break;
      case 39:
        // right arrow key
        this.setState({
          cursorIndex: Math.min(this.props.expressions.length, cursorIndex + 1)
        });
        break;
      case 13:
        // Try to evaluate the expression as a pure number. If that fails, set editMode
        // to true.
        try {
          let joined = this.props.expressions.join("");
          let value = eval(joined);
          if (value !== undefined) {
            this.setState({
              editMode: false
            });
            this.props.onUpdate(value);
          }
          // Pure number
        } catch (e) {
          // Empty expresssion
          let text = this.props.expressions.join("").replace(/\s/g, "");
          if (text.length) {
            this.setState({
              editMode: true
            });
          }
        }
        break;
    }
  }

  handleKeyPress(event) {
    let character = String.fromCharCode(event.which);
    // Only math expressions are allowed
    if (!/^[0-9\/\+\-\\\%\.\s\(\)\*]+$/i.test(character)) {
      return;
    }
    // Insert at cursorIndex
    let expressions = this.props.expressions;
    let cursorIndex = this.state.cursorIndex;
    expressions = expressions.slice(0, cursorIndex)
      .concat([ character ]).concat(expressions.slice(cursorIndex));
    this.setState({
      cursorIndex: Math.min(cursorIndex + 1, expressions.length)
    }, () => {
      this.props.onUpdate(expressions);
    });
  }

  getSpaces(N) {
    let spaces = "";
    for (let i = 0; i < N; i++) {
      spaces += " ";
    }
    return spaces;
  }

  getValueLength(expressions) {
    let length = 0;
    expressions.forEach((expression) => {
      if (ObjectUtils.isObject(expression)) {
        let expressionName = this.props.expressionResolver(expression);
        length += expressionName.length + 2.5;
      } else {
        length += expression.length;
      }
    });
    return length;
  }

  getSelectionStart(x) {
    // http://javascript.nwbox.com/cursor_position/
    let input = this.input;
    let rect = input.getBoundingClientRect();
    return Math.floor((x - rect.left) / (this.state.characterWidth));
  }

  handlePaste(event) {
    if (event.clipboardData) {
      let text = event.clipboardData.getData("text");
      // TODO: Tharun
    }
  }

  handleReplacementDrop(event) {
    event.preventDefault();
    let data = JSON.parse(event.dataTransfer.getData("text"));
    this.setState({
      cursorIndex: 1,
      editMode: true
    }, () => {
      this.props.onUpdate([ data ]);
    });
  }

  handleDrop(event) {
    event.preventDefault();
    let rect = this.input.getBoundingClientRect();
    // Calculate position w.r.t the cursor.
    let data = JSON.parse(event.dataTransfer.getData("text"));
    let { expressions } = this.props;
    let cursorOffset = this.state.cursorIndex;
    expressions = expressions.slice(0, cursorOffset)
      .concat([ data ])
      .concat(expressions.slice(cursorOffset));
    this.setState({
      cursorIndex: expressions.length
    });
    this.props.onUpdate(expressions);
  }
};
