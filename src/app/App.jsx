import React from "react";
import ReactDOM from "react-dom";
import Router from "react-router";
import AppRoutes from "./AppRoutes";
import "assets/main.less";

// Needed for React Developer Tools
window.React = React;
ReactDOM.render(AppRoutes, document.getElementById("sculpt-root"));
