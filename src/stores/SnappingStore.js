import { EventEmitter } from "events";
import { intersect, shape } from "svg-intersections";
import Quadtree from "sculpt/utils/Quadtree";
import { getComponentIdFromPointId, getPointNameFromPointId } from "sculpt/utils/PointUtils";

export default class SnappingStore extends EventEmitter {

  // ***********************************************
  // Static fields
  // ***********************************************
  static eventTypes = {
    SHOW_SNAP_POINTS: "SHOW_SNAP_POINTS",
    HIDE_SNAP_POINTS: "HIDE_SNAP_POINTS",
    HIGHLIGHT_SNAP_POINT: "HIGHLIGHT_SNAP_POINT",
    UNHIGHLIGHT_SNAP_POINT: "UNHIGHLIGHT_SNAP_POINT"
  };

  // ***********************************************
  // Constructor
  // ***********************************************
  constructor(propStore) {
    super();
    // We need a fresh quadtree for each layer in the editor.
    this.quadtree = null;
    this.propStore = propStore;
  }

  // ***********************************************
  // Public methods
  // ***********************************************
  /**
   * Set the current layer from editor.
   * @param {Object} layer The current active layer in editor
   */
  setCurrentLayer(layer) {
    this.quadtree = new Quadtree(layer.bounds, undefined, 4);
  }

  /**
   * Restore by resetting quadtree and storing only root points
   */
  reset() {
    let points = this.quadtree.getPoints();
    points = points.filter((point) => {
      return getComponentIdFromPointId(point.pointId) === "0";
    });
    this.quadtree = new Quadtree(this.quadtree.getBounds(), undefined, 4);
    this.setSnappingPoints("0", points);
  }

  /**
   * Given a pointId get textual description information for the point
   * @param  {String} pointId The id of the point
   * @return {String}         The description of the point (i.e component name and point name)
   */
  getPointDescription(pointId) {
    if (!pointId) {
      let point = this.snappingStore.getPoint(pointId);
      return point.pointX + "," + point.pointY; 
    }
    let split = pointId.split(":");
    let componentId = split[0];
    // The last split element is the name of the point. Everything else is componentId
    let info = this.propStore.getInfo(componentId);
    return info.name + "'s " + split[1];
  }

  getPoint(componentRefId, name) {
    let id;
    if (name === undefined) {
      id = componentRefId;
    } else {
      id = this.getPointId(componentRefId, name);
    }
    return this.quadtree.getPointById(id);
  }

  getPointId(componentRefId, name) {
    return componentRefId + ":" + name;
  }

  highlightPoint(point) {
    this.emitEvent(SnappingStore.eventTypes.HIGHLIGHT_SNAP_POINT, point);
  }

  unhighlightPoint() {
    this.emitEvent(SnappingStore.eventTypes.UNHIGHLIGHT_SNAP_POINT);
  }

  /**
   * Set the set of snapping points available to a given drawing
   * @param {String} componentRefId The component id in dot notation
   * @param {Array} points          The array of points to set as snap targets
   */
  setSnappingPoints(componentRefId, points) {
    points.forEach((point) => {
      if (point.pointId) {
        this.quadtree.addPoint(point.pointId, point.pointX, point.pointY);
      } else {
        this.quadtree.addPoint(this.getPointId(componentRefId, point.name), point.x, point.y);
      }
    });
    this._findIntersectionPoints();
  }

  removeSnappingPoints(componentRefId) {
    this.quadtree.getPoints().filter((p) => getComponentIdFromPointId(p.pointId) === componentRefId)
      .map((p) => {
        this.quadtree.removePoint(p.pointId);
      });
    if (this.showing) {
      this.show();
    }
  }

  _findIntersectionPoints() {
    // Once snapping points are set, find the intersections of various shapes.
    // This involves identifying the unique componentRefIds => resolving their
    // shape and properties.
    // let intersectTargets = [];
    // this.quadtree.getPoints((p) => {
    //   let info = PropStore.getProps(p.pointId);
    //   // Given info, extract the child.type (This is passed as a prop)
    //   let childType = info.type;
    //   // If childType is not a string, then use a static method to either get
    //   // to get path information.
    //   let shapeInfo = childType.getShapeInfo(info.props);
    //   // For text, we use a hidden rectangle to intersect to the boundaries of the rect.
    //   intersectTargets.push({
    //     shape: shape(shapeInfo.type, shapeInfo.attributes),
    //     id: p.pointId
    //   });
    // });
    // // Compare each and every two shapes. If a shape is another layer, what do we do.
    // // We don't care. We only show intersection points for simple shape types.
    // for (let i = 0; i < intersectTargets.length; i++) {
    //   for (let j = i + 1; j < intersectTargets.length; j++) {
    //     let intersections = intersect(intersectTargets[i].shape, intersectTargets[j].shape).map((p) => {
    //       return {
    //         x: p.x,
    //         y: p.y
    //       };
    //     });
    //     if (intersections.length) {
    //       intersections.forEach(({ x, y }, i) => {
    //         // Add to quadtree as an intersection point
    //         this.quadtree.addPoint(
    //           "INTERSECTION." + intersectTargets[i].id + "." + intersectTargets[j].id + "." + i,
    //           x,
    //           y
    //         );
    //       });
    //     }
    //   }
    // }
  }

  /**
   * Find the closest snapping point to a given x, y set. Cycleindex will
   * cycle through the points
   * @param  {Number} x                 The x coordinate of the point to find snap point for
   * @param  {Number} y                 The y coordinate of the point to find snap point for
   * @param  {Function} filterFunction  Optional filter function to restrict points
   * @param  {Number} cycleIndex        The index to cycle through the points.
   * @return {Object}                   The matching snap point, id and x,y coords.
   */
  getClosestSnappingPoint(x, y, filterFunction, cycleIndex = 0) {
    let points = this.quadtree.getClosestPoints(x, y, 5, filterFunction);
    return points[cycleIndex % points.length];
  }

  show() {
    this.showing = true;
    this.emitEvent(SnappingStore.eventTypes.SHOW_SNAP_POINTS, this.quadtree.getPoints());
  }

  hide() {
    this.showing = false;
    this.emitEvent(SnappingStore.eventTypes.HIDE_SNAP_POINTS);
  }

  emitEvent(eventType, ...args) {
    this.emit(eventType, eventType, ...args);
  }

  addChangeListener(callback) {
    Object.keys(SnappingStore.eventTypes).forEach((eventType) => {
      this.on(eventType, callback);
    });
  }

  removeChangeListener(callback) {
    Object.keys(SnappingStore.eventTypes).forEach((eventType) => {
      this.removeListener(eventType, callback);
    });
  }
};
