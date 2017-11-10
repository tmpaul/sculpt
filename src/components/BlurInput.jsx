import BaseComponent from "core/BaseComponent";

export default class BlurInput extends BaseComponent {
  constructor(...args) {
    super(...args);
    this.autoBind();
  }

  render() {
    return (
      <input 
        ref={(el) => this.input = el}
        onMouseEnter={() => this.input && this.input.focus()}
        onMouseLeave={() => this.input && this.input.blur() && this.props.onBlur()}
        {...this.props}
      />
    );
  }
};
