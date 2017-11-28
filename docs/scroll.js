(function(window) {
  window.onload = function() {

    var logoInit;

    function insertAfter(newNode, referenceNode) {
      referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
    }

    function moveOnScroll(node, finalCoords, scrollDistance) {
      if (node.init === undefined) {
        let rect = node.getBoundingClientRect();
        node.init = rect;
        var clone = node.cloneNode();
        clone.style.opacity = "0";
        insertAfter(clone, node);

        node.style.position = "fixed";
        node.style.margin = "0";
        node.style.left = rect.left;
        node.style.top = rect.top;
      }

      var nodeInit = node.init;
      var factor = Math.min(Math.abs(scrollDistance) / (nodeInit.height + nodeInit.top), 1);
      node.style.left = nodeInit.left - factor * (nodeInit.left - finalCoords.left) + "px";
      node.style.top = nodeInit.top - factor * (nodeInit.top - finalCoords.top) + "px";
      node.style.width = nodeInit.width - factor * (nodeInit.width - finalCoords.width) + "px";
    }

    function handleScroll() {
      var scrollDistance = document.body.scrollTop;
      
      // Move the elements appropriately
      var logo = document.getElementById("logo");
      var sculptText = document.getElementById("draw");

      moveOnScroll(logo, {
        top: 10,
        left: 10,
        width: 35
      }, scrollDistance);

      moveOnScroll(sculptText, {
        top: 17,
        left: 15,
        width: 200
      }, scrollDistance);
    }

    // Listen for scroll events.
    window.addEventListener("scroll", handleScroll);
    handleScroll();

  };
})(window);
