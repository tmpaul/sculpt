(function(window) {
  // window.onload = function() {
  //   var svg = document.getElementById('svg');
  //   function randomInt(a, b) {
  //     return Math.floor(Math.random() * (b - a)) + a;
  //   }
  //   // Generate a random paths
  //   var i = 0, j = 0;
  //   var xDim = 240;
  //   var yDim = 200;
  //   var polygons = [];
  //   // To prevent overlap we divide them into a grid
  //   for (i; i < 3; i++) {
  //     for (j = 0; j < 3; j++) {
  //       var points = [];
  //       // Generate a random shape using polygon
  //       // Generate points within grid
  //       var numPoints = randomInt(3, 5);
  //       for (var k = 0; k < numPoints; k++) {
  //         points.push({
  //           x: randomInt(i * xDim, (i + 1) * xDim),
  //           y: randomInt(j * yDim, (j + 1) * yDim)
  //         });
  //       }
  //       polygons.push(points);
  //     }
  //   }
  //   polygons.forEach(function(points) {
  //     var markers = [];
  //     var polyPath = "M " + points[0].x + " " + points[0].y;
  //     points.forEach(function(point) {
  //       polyPath += " L " + point.x + " " + point.y;
  //       markers.push('<circle class="marker" cx=' + point.x + ' cy=' + point.y + ' r="6" />');
  //     });
  //     polyPath += "Z";
  //     polyPath = '<path class="path" d="' + polyPath + '"/>';
  //     svg.innerHTML += '<g>' + polyPath + markers.join("\n") + '</g>';
  //   });
  // };
})(window);
