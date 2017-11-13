import React from "react";
import { IndexRoute, Route, Redirect, Router, browserHistory } from "react-router";
import EditorPage from "pages/EditorPage";
// import ExternalMatrixDiagram from "components/pages/ExternalMatrixDiagram";

export default (
  <Router history={browserHistory}>
    <Route path="/" component={EditorPage}/>
    <Route path="*" component={EditorPage}/>
  </Router>
);
