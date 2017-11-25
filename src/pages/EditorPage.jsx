import React from "react";
import BasePage from "pages/BasePage";
import Toolbar from "toolbar/Toolbar";
import Canvas from "components/GroupComponents";
import EditableRectangle from "components/rect/Rectangle";
import EventStore from "stores/EventStore";
import OperationStore from "stores/OperationStore";
import DrawingStore from "stores/DrawingStore";
import { TitleStepComponent } from "components/steps";
import Steps from "components/steps/Steps";
import Picture from "core/Picture";
import PropertyPanel from "components/PropertyPanel";
import ParametersPanel from "components/parameters/ParametersPanel";
import DataTable from "components/data/Table";

export default class EditorPage extends BasePage {
  // *********************************************************
  // Constructor
  // *********************************************************
  constructor(...args) {
    super(...args);
    this.forceUpdate = this.forceUpdate.bind(this);
    this.state = {
      picture: new Picture(true, this.forceUpdate)
    };
    this.toggleEditMode = this.toggleEditMode.bind(this);
    this.state.picture.init({
      props: {
        x: 0,
        y: 0,
        canvasWidth: 700,
        canvasHeight: 460,
        // The painting surface is offset so as to show the control
        // points at the border. Otherwise they will be cut off.
        translateX: 20,
        translateY: 20,
        width: 660,
        height: 420
      }
    });
  }

  componentDidMount() {
    // Create an SVG point to transform point coords to native coordinates
    // this.state.picture.point = this.svg.createSVGPoint();
  }

  // *********************************************************
  // React methods
  // *********************************************************
  render() {
    return (
      <div className="table-container" style={{
        position: "relative"
      }}>
        <div className="nav" style={{
          position: "absolute",
          minHeight: "100%",
          maxHeight: "100%",
          overflowY: "scroll"
        }}>
           <ParametersPanel
              parameters={this.state.picture.parametersStore.getParameters()}
              expressionResolver={this.state.picture.getExpressionLabel.bind(this.state.picture)}
              onParameterChange={(index, parameter) => {
                this.state.picture.parametersStore.setParameter(index, parameter);
              }}
           />
           <DataTable
            data={this.state.picture.dataStore.getData()}
            activeColumn={this.state.picture.dataStore.getActiveIndex()}
            rowVariables={this.state.picture.dataStore.getRowVariables()}
            onRowVariableChange={(index, name) => {
              this.state.picture.dataStore.updateRowVariable(index, name);
            }}
            onColumnClick={(i) => {
              this.state.picture.dataStore.setActiveIndex(i);
            }}
            updateTableData={({ rowVariables, data }) => {
              this.state.picture.dataStore.setData(data);
              this.state.picture.dataStore.setRowVariables(rowVariables);
              this.state.picture.evaluate(this.state.picture.stepStore.getCurrentIndex());
            }}
           />
           {
            // Render a list of parameters. Allows user to add more parameters.
            // All added parameters will be exposed to outside world for control.
           }
          <Steps 
            stepStore={this.state.picture.stepStore}
            snappingStore={this.state.picture.snappingStore}
            slotExpressionResolver={this.state.picture.getExpressionLabel.bind(this.state.picture)}
            propStore={this.state.picture.propStore}
          />
        </div>
        <div className="content">
          <div>
            <TitleStepComponent
              stepStore={this.state.picture.stepStore}
              snappingStore={this.state.picture.snappingStore}
              onUpdateStep={this.state.picture.updateTitleStep.bind(this.state.picture)}
              slotExpressionResolver={this.state.picture.getExpressionLabel.bind(this.state.picture)}
              propStore={this.state.picture.propStore}
            />
            {
              // For editing component properties
            }
            <PropertyPanel/>
            <svg id="picture" className="svg-canvas" width={700} height={460}>
              <filter id="bevel" filterUnits="objectBoundingBox" x="-10%" y="-10%" width="150%" height="150%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="5" result="blur">
                </feGaussianBlur>
                <feSpecularLighting in="blur" surfaceScale="5" specularConstant="0.75" specularExponent="20" result="specOut" lightingColor="#00a4ff">
                  <fePointLight x="-5000" y="-5000" z="25000"></fePointLight>
                </feSpecularLighting>
                <feComposite in="specOut" in2="SourceAlpha" operator="in" result="specOut2">
                </feComposite>
                <feComposite in="SourceGraphic" in2="specOut2" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" result="litPaint">
                </feComposite>
              </filter>
              {this.state.picture.render()}
            </svg>
            <Toolbar dispatchEvent={this.handleToolbarEvent} handleToolbarEvent={this.handleToolbarEvent}/>
          </div>    
        </div>
      </div>
    );
  }
  // *********************************************************
  // Private methods
  // *********************************************************
  toggleEditMode() {
    this.setState({
      editMode: !this.state.editMode
    });
  }

  handleEvent(event) {
    EventStore.notify(event);
  }

  handleToolbarEvent(event) {
    if (event.type === "SHIFT_KEY") {
      return this.state.picture.stepStore.shiftKey = event.value;
    }
    this.state.picture.notify(event);
    this.forceUpdate();
  }
};
