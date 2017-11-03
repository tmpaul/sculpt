import PropStore from "sculpt/stores/PropStore";
import SnappingStore from "sculpt/stores/SnappingStore";
// DrawingStore is responsible for drawing a new picture into the canvas.
// The new picture can either be a primitive, or another picture.
import { EventEmitter } from "events";

class DrawingStore extends EventEmitter {
  draw(componentRefId) {
    this.componentRefId = componentRefId;
    this.isDrawing = true;
    this.coords = {};
  }
  // Listen on dispatcher
  handleEvent(event) {
    if (this.isDrawing) {
      // Get the component being drawn
      let componentInfo = PropStore.getInfo(this.componentRefId);
      if (event.type === "CONTROL_POINT_DRAG_START") {
        // Make drawX and drawY getters so that when the point moves, 
        this.coords = {
          get drawX() {
            return SnappingStore.getPoint(event.source, event.payload.name).pointX;
          },
          set drawX(val) {
            this.drawX = val;
          },
          get drawY() {
            return SnappingStore.getPoint(event.source, event.payload.name).pointY;
          },
          set drawY(val) {
            this.drawY = val;
          }
        };
        PropStore.setProps(this.componentRefId, {
          showMarkers: true
        });
        PropStore.setSelectionState(this.componentRefId, true);
      }
      if (event.type === "CANVAS_DRAG_START") {
        this.coords = {
          drawX: event.payload.x,
          drawY: event.payload.y
        };
      }
      if (event.type === "CANVAS_DRAG_MOVE" || event.type === "CONTROL_POINT_DRAG_MOVE") {
        let point;
        let deltaX = event.payload.deltaX, deltaY = event.payload.deltaY;
        let drawProps = componentInfo.type.getDrawProps(componentInfo.props, {
          x: this.coords.drawX,
          y: this.coords.drawY,
          deltaX,
          deltaY
        });
        PropStore.setProps(this.componentRefId, drawProps);
      }

      if (event.type === "CANVAS_DRAG_END" || event.type === "CONTROL_POINT_DRAG_END") {
        // Debounce and end. But before that try to capture snap point so that it can be added to
        // reference.
        let id = this.componentRefId;
        console.log("Must identify snaps. Ending...", PropStore);
        let props = PropStore.getProps(this.componentRefId);
        console.log(event.payload.x, event.payload.y, SnappingStore.cache.layer.quadTree.getPoints());
        console.log(SnappingStore.getClosestSnappingPoint(event.payload.x, event.payload.y));
        this.isDrawing = false;
        this.componentRefId = null;
        SnappingStore.hide();
      }
    }
  }
};

export default new DrawingStore();
