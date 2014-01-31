/**
 * 
 */

var ModalView = function(options) {
    this.width = (options.width !== undefined) ? options.width : $(window).width()/2;
    this.height = (options.height !== undefined) ? options.height : $(window).height()/2;
    this.title = (options.title !== undefined) ? options.title : "Default";
    var close_button_url = "images/icons/navigation/close_black.png",
            $container, $body;
    $("#main").append('<div id="popup-container" class="popup-window"></div>');
        $("#popup-container").width(this.width).height(this.height);
        $container = $("#popup-container");
        $container.append('<div id="popup-container-head" class="popup-window-head"></div>');
        $("#popup-container-head").append("<a>" + this.title + "</a>");
        $("#popup-container-head").append('<img src="' + close_button_url + '" class="popup-window-close-button" id="popup-container-head-close-button">');
        $container.append('<div id="popup-container-body" class="popup-window-body"></div>');
        $body = $("#popup-container-body");
    
    this.display = function() {
        centerize();
        $container.show("slide", {direction: "right"}, 500);
    };
    this.dispose = function() {
        console.log("Here");
        $("#main").remove("#popup-container");
    }
    this.append = function($element) {
        $body.append($element);
        centerize();
    }
    
    function centerize() {
        centerElement($(window), $container);
    }
    
    $(".popup-window-close-button").click(function () {
      console.log("here");
      var id = $(this).attr("id");
      var parent = $("#" + id + "-mini-map");
      $("#popup-container").remove();
//      closeButtonWasClicked(parent);
//      
//      function closeButtonWasClicked(svg_parent_container) {
//        svg_parent_container.hide();
//        closeAllRemovableDisplays();
//      }
      global.sm.consumeEvent("goto-mainevent");
    });
};