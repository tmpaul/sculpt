(function(window) {
  window.onload = function() {

    // Listen for scroll events.
    window.addEventListener("scroll", function() {
      var scrollDistance = document.body.scrollTop / 10;
      
      // Move the elements appropriately
      var logo = document.getElementById("logo");
      var sculptText = document.getElementById("draw");

      logo.style.width = Math.max(300 - (scrollDistance * 20), 100) + "px";
      sculptText.style.transform = "translateY(" + (-scrollDistance) + "px)" +
        "scale(" + (Math.min(1, 4 / scrollDistance)) + ")";
    });

  };
})(window);
