import React from "react";
import BaseComponent from "core/BaseComponent";

class BasePage extends BaseComponent {

  constructor(props) {
    super(props, {
      bind: true
    });
  }

  render() {
    // Set DOM page title
    let appName = "Shared Components";
    if (typeof document !== "undefined") {
      document.title = (this.state && this.state.pageTitle) ? this.state.pageTitle  + " - " + appName : appName;
    }

    return (
      <div>
        {this.pageContent}
      </div>
    );
  }
}

export default BasePage;
