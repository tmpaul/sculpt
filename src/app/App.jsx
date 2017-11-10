import React from "react";
import ReactDOM from "react-dom";
import Router from "react-router";
import AppRoutes from "./AppRoutes";
import "assets/main.less";

// Needed for React Developer Tools
window.React = React;

// Prevent file drop into random areas
window.addEventListener("dragover",function(e) {
  e = e || event;
  e.preventDefault();
},false);
window.addEventListener("drop",function(e) {
  e = e || event;
  e.preventDefault();
},false);
ReactDOM.render(AppRoutes, document.getElementById("sculpt-root"));
