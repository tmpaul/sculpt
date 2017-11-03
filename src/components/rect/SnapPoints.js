export default function getSnappingPoints(props) {
  // What about user defined points ?
  return [ {
    name: "top left",
    x: props.x,
    y: props.y,
    onDragStart(dispatch) {
      // When drag is started
      dispatch("CONTROL_POINT_DRAG_START", {
        name: "top left",
        x: props.x,
        y: props.y
      });
    },
    onDrag(dispatch, { x, y, dx, dy }) {
      // During drag
      dispatch("CONTROL_POINT_DRAG_MOVE", {
        // New x
        x: props.x + dx,
        // New y
        y: props.y + dy,
        width: props.width - dx,
        height: props.height - dy,
        // The delta x from origin
        deltaX: x,
        // The delta y from origin
        deltaY: y
      });
    },
    onDragEnd(dispatch, { x, y, mat }) {
      // When drag ends
      dispatch("CONTROL_POINT_DRAG_END", {
        name: "top left",
        x: props.x,
        y: props.y,
        matrix: mat
      });
    },
    // Snap the rectangle's top left to x and y
    handleSnapToPoint(props, { x, y }, source) {
      if (!source) {
        // Draw from top left to x, y
        return {
          x,
          y
        };
      } else {
        // Draw from source point to x, y with x, y matching top left of rectangle
        return {
          x,
          y,
          width: source.x - x,
          height: source.y - y
        };
      }
      // Snap the top left of this rectangle to x, y
      return {
        x,
        y,
        width: props.width + (props.x - x),
        height: props.height + (props.y - y)
      };
    }
  }, {
    name: "top mid",
    x: props.x + props.width / 2,
    y: props.y,
    restrictY: true,
    onDragStart(dispatch) {
      // When drag is started
      dispatch("CONTROL_POINT_DRAG_START", {
        name: "top mid",
        x: props.x + props.width / 2,
        y: props.y
      });
    },
    onDrag(dispatch, { x, y, dx, dy }) {
      // During drag
      dispatch("CONTROL_POINT_DRAG_MOVE", {
        deltaX: x,
        deltaY: y
      });
    },
    onDragEnd(dispatch) {
      // When drag ends
      dispatch("CONTROL_POINT_DRAG_END", {
        name: "top mid",
        x: props.x + props.width / 2,
        y: props.y
      });
    },
    handleSnapToPoint(props, { x, y }) {
      // Snap the top mid of this rectangle to x, y
      return {
        x: x - props.width / 2,
        y
      };
    }
  }, {
    name: "top right",
    x: props.x + props.width,
    y: props.y,
    onDragStart(dispatch) {
      // When drag is started
      dispatch("CONTROL_POINT_DRAG_START", {
        name: "top right",
        x: props.x + props.width,
        y: props.y
      });
    },
    onDrag(dispatch, { x, y, dx, dy }) {
      // During drag
      dispatch("CONTROL_POINT_DRAG_MOVE", {
        y: props.y + dy,
        width: props.width + dx,
        height: props.height - dy,
        deltaX: x,
        deltaY: y
      });
    },
    onDragEnd(dispatch) {
      // When drag ends
      dispatch("CONTROL_POINT_DRAG_END", {
        name: "top right",
        x: props.x + props.width,
        y: props.y
      });
    },
    handleSnapToPoint(props, { x, y }, source) {
      if (!source) {
        // Draw rectangle from self to x, y
        return {
          x: x - props.width,
          y
        };
      } else {
        // Draw rectangle from snapPoint to x, y. We need
        // to use snapPoint
        return {
          y,
          width: x - props.x,
          height: props.height - (y - props.y)
        };
      }
    }
  }, {
    name: "mid left",
    x: props.x,
    y: props.y + props.height / 2,
    restrictX: true,
    onDragStart(dispatch) {
      // When drag is started
      dispatch("CONTROL_POINT_DRAG_START", {
        name: "mid left",
        x: props.x,
        y: props.y + props.height / 2
      });
    },
    onDrag(dispatch, { x, y, dx, dy }) {
      // During drag
      dispatch("CONTROL_POINT_DRAG_MOVE", {
        x: props.x + dx,
        width: props.width - dx,
        deltaX: x,
        deltaY: y
      });
    },
    onDragEnd(dispatch) {
      // When drag ends
      dispatch("CONTROL_POINT_DRAG_END", {
        name: "mid left",
        x: props.x,
        y: props.y + props.height / 2
      });
    },
    handleSnapToPoint(props, { x, y }) {
      // Snap the mid left of this rectangle to x, y
      return {
        x,
        y: y - props.height / 2
      };
    }
  }, {
    name: "center",
    x: props.x + props.width / 2,
    y: props.y + props.height / 2,
    onDragStart(dispatch) {
      // When drag is started
      dispatch("CONTROL_POINT_DRAG_START", {
        name: "center",
        x: props.x + props.width / 2,
        y: props.y + props.height / 2
      });
    },
    onDrag(dispatch, { x, y, dx, dy }) {
      // During drag
      dispatch("CONTROL_POINT_DRAG_MOVE", {
        deltaX: x,
        deltaY: y
      });
    },
    onDragEnd(dispatch) {
      // When drag ends
      dispatch("CONTROL_POINT_DRAG_END", {
        name: "center",
        x: props.x + props.width / 2,
        y: props.y + props.height / 2
      });
    },
    handleSnapToPoint(props, { x, y } = {}, source) {
      return {
        x: x - props.width / 2,
        y: y - props.height / 2
      };
    }
  }, {
    name: "mid right",
    x: props.x + props.width,
    y: props.y + props.height / 2,
    onDragStart(dispatch) {
      // When drag is started
      dispatch("CONTROL_POINT_DRAG_START", {
        name: "mid right",
        x: props.x + props.width,
        y: props.y + props.height / 2
      });
    },
    onDrag(dispatch, { x, y, dx, dy }) {
      // During drag
      dispatch("CONTROL_POINT_DRAG_MOVE", {
        width: props.width + dx,
        deltaX: x,
        deltaY: y
      });
    },
    onDragEnd(dispatch) {
      // When drag ends
      dispatch("CONTROL_POINT_DRAG_END", {
        name: "mid right",
        x: props.x + props.width,
        y: props.y + props.height / 2
      });
    },
    handleSnapToPoint(props, { x, y }) {
      // Snap the mid right of this rectangle to x, y
      return {
        x: x - props.width,
        y: y - props.height / 2
      };
    }
  }, {
    name: "bottom left",
    x: props.x,
    y: props.y + props.height,
    onDragStart(dispatch) {
      // When drag is started
      dispatch("CONTROL_POINT_DRAG_START", {
        name: "bottom left",
        x: props.x,
        y: props.y + props.height
      });
    },
    onDrag(dispatch, { x, y, dx, dy }) {
      // During drag
      dispatch("CONTROL_POINT_DRAG_MOVE", {
        x: props.x + dx,
        width: props.width - dx,
        height: props.height + dy,
        deltaX: x,
        deltaY: y
      });
    },
    onDragEnd(dispatch) {
      // When drag ends
      dispatch("CONTROL_POINT_DRAG_END", {
        name: "bottom left",
        x: props.x,
        y: props.y + props.height
      });
    },
    handleSnapToPoint(props, { x, y }, source) {
      if (!source) {
        // Draw rectangle from bottom left set at x, y
        return {
          x,
          y: y - props.height
        };
      } else {
        // Draw rectangle from source point to (x, y) at bottom left
        return {
          x,
          y: y - props.height
        };
      }
    }
  }, {
    name: "bottom mid",
    x: props.x + props.width / 2,
    y: props.y + props.height,
    restrictY: true,
    onDragStart(dispatch) {
      // When drag is started
      dispatch("CONTROL_POINT_DRAG_START", {
        name: "bottom mid",
        x: props.x + props.width / 2,
        y: props.y + props.height
      });
    },
    onDrag(dispatch, { x, y, dx, dy }) {
      // During drag
      dispatch("CONTROL_POINT_DRAG_MOVE", {
        height: props.height + dy,
        deltaX: x,
        deltaY: y
      });
    },
    onDragEnd(dispatch) {
      // When drag ends
      dispatch("CONTROL_POINT_DRAG_END", {
        name: "bottom mid",
        x: props.x + props.width / 2,
        y: props.y + props.height
      });
    },
    handleSnapToPoint(props, { x, y }) {
      // Snap the bottom mid of this rectangle to x, y
      return {
        x: x - props.width / 2,
        y: y - props.height
      };
    }
  }, {
    name: "bottom right",
    x: props.x + props.width,
    y: props.y + props.height,
    onDragStart(dispatch) {
      // When drag is started
      dispatch("CONTROL_POINT_DRAG_START", {
        name: "bottom right",
        x: props.x + props.width,
        y: props.y + props.height
      });
    },
    onDrag(dispatch, { x, y, dx, dy }) {
      // During drag
      dispatch("CONTROL_POINT_DRAG_MOVE", {
        width: props.width + dx,
        height: props.height + dy,
        deltaX: x,
        deltaY: y
      });
    },
    onDragEnd(dispatch) {
      // When drag ends
      dispatch("CONTROL_POINT_DRAG_END", {
        name: "bottom right",
        x: props.x + props.width,
        y: props.y + props.height,
      });
    },
    handleSnapToPoint(props, { x, y }, source) {
      if (!source) {
        // Draw rectangle from point (x, y) at bottom right
        return {
          x: x - props.width,
          y: y - props.height
        };
      } else {
        // Draw rectangle from source to (x, y) where (x,y) is the bottom right point
        return {
          x: source.x,
          y: source.y,
          width: x - source.x,
          height: y - source.y
        };
      }
    }
  } ];
};
