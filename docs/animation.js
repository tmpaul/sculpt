(function(window) {
  window.addEventListener("load", function() {
    var svg = document.getElementById("draw");
    var viewBox = svg.getAttribute("viewBox").split(" "); 
    var WIDTH = Number(viewBox[2]);
    var HEIGHT = Number(viewBox[3]);

    function point(x, y) {
      return " " + x + "," + y;
    }

    function drawBackgroundRect(rectAttributes, pathNode) {
      var rectPath = "M" + point(rectAttributes.x, rectAttributes.y);
      rectPath += "L" + point(rectAttributes.x + rectAttributes.width, rectAttributes.y);
      rectPath += "L" + point(rectAttributes.x + rectAttributes.width, rectAttributes.y +  rectAttributes.height);
      rectPath += "L" + point(rectAttributes.x, rectAttributes.y +  rectAttributes.height);
      rectPath += "Z";
      pathNode.setAttribute("d", rectPath);
    }

    function drawPath(startPoint, deltaY, deltaX, N) {
      var path = "";
      var x0 = startPoint.x;
      var y0 = startPoint.y;
      path += "M " +  x0 + "," +  y0;
      var i;
      for (i = 0; i < N; i++) {
        var x = deltaX / N;
        var y = (Math.random() * 6) * deltaY;
        var midX = (x0 + x0 + x) / 2;
        var midY = (y / 2);

        path += "C" + point(x0, 0) + point(midX, midY) + point(x0 + x, 0);
        // A line till 
        path += "L " + (x0 + x) + "," + (0);
        x0 += x;
        y0 += y;
      }
      return path;
    }

    var count = 0;
    function draw() {
      count++;
      if (count > 20) {
        count = 0;
      }
      var N = 5;
      var pathNodeIds = [ "path1", "path2" ];

      pathNodeIds.forEach(function(nodeId, i) {
        var pathNode = document.getElementById(nodeId);
        var yMax = HEIGHT * (count % 5) / 5;
        var path = drawPath({
          x: 0,
          y: 0
        }, HEIGHT, WIDTH, N);
        path += "L " + WIDTH + ", " + 0 + " L 0, " + 0;
        pathNode.setAttribute("d", path);
        pathNode.setAttribute("transform", "rotate(" + (count * i / 20) + "," + (WIDTH / 2 + "," + HEIGHT / 2) + ")");
      });
    }
    draw();
    setTimeout(draw, 1000);
    setInterval(draw, 2500);
  });
})(window);
