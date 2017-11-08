export default class Quadtree {
  constructor(bounds, points, splitLimit = 20, registry, nodeArray) {
    /*
      minX, minY -----------------
      |   Q1                Q4
      |
      |   Q2                Q3
      |-----------------maxX, maxY
     */
    this._root = {
      minX : bounds[0][0],
      minY : bounds[0][1],
      maxX : bounds[1][0],
      maxY : bounds[1][1],
      midX: (bounds[0][0] + bounds[1][0]) / 2,
      midY: (bounds[0][1] + bounds[1][1]) / 2,
      points: points || [],
      children: []
    };
    this._registry = registry || {};
    this._nodeArray = nodeArray || [ 0 ];
    this._root.points.forEach(({ pointId, pointX, pointY }) => {
      this.addPoint(pointId, pointX, pointY);
    });
    this.splitLimit = splitLimit;
  }

  getBounds() {
    return [ [ this._root.minX, this._root.minY ], [ this._root.maxX, this._root.maxY ] ];
  }
  
  getPointById(id) {
    let nodeArray = this._registry[id];
    let node = this._getNodeByArrayId(nodeArray);
    return node._root.points.filter((p) => p.pointId === id)[0];
  }
  
  _getNodeByArrayId(arrayId) {
    arrayId = arrayId.slice();
    if (arrayId.length > 1) {
      arrayId.shift();
      return this._root.children[arrayId[0]]._getNodeByArrayId(arrayId);
    } else {
      return this;
    }
  }
  
  removePoint(pointId) {
    let root = this._root;
    root.points = root.points.filter(function(p) {
      return p.pointId !== pointId;
    });
    root.children.forEach((child) => {
      child.removePoint(pointId);
    });
    delete this._registry[pointId];
  }

  addPoint(pointId, pointX, pointY) {
    if (this._registry[pointId]) {
      // Point already exists
      let node = this._getNodeByArrayId(this._registry[pointId]);
      // Remove the point from the node. Because this new point might be in a new quad.
      node.removePoint(pointId, pointX, pointY);
      // node.addPoint(pointId, pointX, pointY);
    }
    // Find out which quadrant this point belongs to
    let root = this._root;
    if (this._withinBounds(pointX, pointY)) {
      // Attempt to insert into points
      if (root.points.length >= this.splitLimit && this._nodeArray.length < 10) {
        // Split the points amongst subnodes
        root.children = [ 
          new Quadtree([ [ root.minX, root.minY ], [ root.midX, root.midY ] ], undefined, this.splitLimit, this._registry, this._nodeArray.concat([ 0 ])),
          new Quadtree([ [ root.minX, root.midY ], [ root.midX, root.maxY ] ], undefined, this.splitLimit, this._registry, this._nodeArray.concat([ 1 ])),
          new Quadtree([ [ root.midX, root.midY ], [ root.maxX, root.maxY ] ], undefined, this.splitLimit, this._registry, this._nodeArray.concat([ 2 ])),
          new Quadtree([ [ root.midX, root.minY ], [ root.maxX, root.midY ] ], undefined, this.splitLimit, this._registry, this._nodeArray.concat([ 3 ]))
        ];
        let points = root.points.filter((child) => {
          return child.pointId !== pointId;
        });
        points.concat([ {
          pointId,
          pointX,
          pointY
        } ]).forEach(({ pointId, pointX, pointY }) => {
          delete this._registry[pointId];
          let quadrant = this._findQuadrant(pointX, pointY);
          if (quadrant) {
            root.children[quadrant - 1].addPoint(pointId, pointX, pointY);
          }
        });
        // No longer a leaf node
        root.points = [];
      } else {
        if (root.points.length === 0 && root.children.length > 0) {
          // No longer a leaf node
          let quadrant = this._findQuadrant(pointX, pointY);
          if (quadrant) {
            root.children[quadrant - 1].addPoint(pointId, pointX, pointY);
          }
        } else {
          this._registry[pointId] = this._nodeArray;
          root.points = root.points.filter((child) => {
            return child.pointId !== pointId;
          });
          root.points.push({
            pointId,
            pointX,
            pointY
          });
        }
      }
    }
  }

  getClosestPoints(x, y, threshold, filterFunction) {
    // Get the closest snapping points based on threshold distance!
    // Do this only at leaf nodes
    filterFunction = filterFunction || ((d) => d);
    let closestPoints = [];
    let root = this._root;
    if (root.points.length !== 0) {
      root.points.forEach(({ pointId, pointX, pointY }) => {
        if (filterFunction(pointId, pointX, pointY)) {
          if ((Math.abs(pointX - x) + Math.abs(pointY - y)) <= threshold) {
            closestPoints.push({
              pointId,
              pointX,
              pointY
            });
          }
        }
      });
    } else {
      root.children.forEach((child) => {
        closestPoints = closestPoints.concat(child.getClosestPoints(x, y, threshold, filterFunction));
      });
    }
    return closestPoints.sort(function(a, b) {
      return a.pointId.length > b.pointId.length ? -1 : 1;
    });
  }

  getPoints() {
    let root = this._root;
    let points = [];
    if (root.points.length) {
      root.points.forEach(function(point) {
        points.push(point);
      });
    }
    root.children.map((child) => {
      points = points.concat(child.getPoints());
    });
    return points;
  }
  
  printPoints() {
    let root = this._root;
    if (root.points.length) {
      console.log("Box (", root.minX, "," , root.maxX, ")",  " to ", "(", root.maxX, ",", root.maxY, ")");
      root.points.forEach(function(point) {
        console.log("Point", point.pointId, point.pointX, point.pointY);
      });
    }
    root.children.map((child) => {
      child.printPoints();
    });
  }

  _withinBounds(pointX, pointY) {
    let root = this._root;
    return (pointX >= root.minX && pointY >= root.minY && pointX <= root.maxX && pointY <= root.maxY);
  }

  _findQuadrant(pointX, pointY) {
    let root = this._root;
    // Quadrant 1
    if (pointX >= root.minX && pointX < root.midX && pointY >= root.minY && pointY < root.midY) {
      return 1;
    } else if (pointX >= root.minX && pointX < root.midX && pointY >= root.midY && pointY <= root.maxY) {
      return 2;
    } else if (pointX >= root.midX && pointX <= root.maxX && pointY >= root.midY && pointY <= root.maxY) {
      return 3;
    } else if (pointX >= root.midX && pointX <= root.maxX && pointY >= root.minY && pointY < root.midY) {
      return 4;
    }
    return null;
  }
};

export class FakeQuadtree {
  constructor(bounds, points = [], splitLimit = 20, registry, nodeArray) {
    this._registry = {};
    points.forEach((point) => {
      this.addPoint(point.pointId, point.pointX, point.pointY);
    });
  }

  getBounds() {
    return [];
  }
  
  getPointById(id) {
    return this._registry[id];
  }
  
  removePoint(pointId) {
    this._registry[pointId] = null;
  }

  addPoint(pointId, pointX, pointY) {
    this._registry[pointId] = {
      pointId,
      pointX,
      pointY
    };
  }

  getClosestPoints(x, y, threshold, filterFunction) {
    // Get the closest snapping points based on threshold distance!
    // Do this only at leaf nodes
    filterFunction = filterFunction || ((d) => d);
    let closestPoints = [];
    Object.keys(this._registry).forEach((pointId) => {
      let pointInfo = this._registry[pointId];
      if (pointInfo) {
        let { pointX, pointY } = pointInfo;
        if (filterFunction(pointId, pointX, pointY)) {
          let distance = Math.abs(pointX - x) + Math.abs(pointY - y);
          if (distance <= threshold) {
            closestPoints.push({
              pointId,
              pointX,
              pointY,
              distance
            });
          }
        }
      }
    });
    return closestPoints.sort(function(a, b) {
      return a.distance > b.distance ? 1 : -1;
    }).sort(function(a, b) {
      return a.pointId.length > b.pointId.length ? -1 : 1;
    });
  }

  getPoints() {
    return Object.keys(this._registry).map((k) => this._registry[k]).filter(Boolean);
  }
  
  printPoints() {
    // Do nothing
  }
};
