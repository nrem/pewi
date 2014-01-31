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

var PrintView = function() {
    var options = {
        width: SCREEN.width/1.1,
        height: SCREEN.height,
        title: "Results"
    },
        modal = new ModalView(options),
        landcover = d3.select("#percent-landcover")
        .append("div")
        .attr("width", "400px");

    modal.append('<section id="left-col"><section id="landcover-minimaps"></section><section id=""><div id="percent-landcover"></div><br /><div id="precipitation-placeholder"></div></section></section><section id="right-col"><section id="landuse-outputs"></section><br /><div id="stats"></div></section>');
    modal.display();

    for(var i=0; i<landCoverArea.length;i++) {
        var a = 100*(landCoverArea[i]/area);

        var row = landcover.append("div")
            .attr("class", "row")
            .style("width", "400px")
            .style("height", "30px");
        row.append("div")
            .attr("class", "landcover-facts-header")
            .text(function(){return landcovers[i+1];})
            .style("font-size", ".8em")
            .style("float", "left")
            .style("width", "100px");
        row.append("div")
            .attr("id", "percent-landcover-value")
            .text(function(){
                var b = Math.round(a);
                if(b > 0) {
                    return b + "%";
                } else {
                    return b;
                }
            })
            .style("float", "left")
            .style("width", "100px");
        row.append("div")
            .attr("id", "acres-landcover-value")
            .text(function(){
                if(landCoverArea[i] > 0) {
                    return landCoverArea[i] + " acres";
                } else {
                    return landCoverArea[i];
                }
            })
            .style("float", "left")
            .style("width", "100px");
        row.append("div")
            .attr("id", "hectares-landcover-value")
            .text(function(){
                var h = Math.round(0.404686 * landCoverArea[i]);
                if(h > 0) {
                    return h + " hectares";
                } else {
                    return h;
                }
            })
            .style("float", "left")
            .style("width", "100px");
        //$("#percent-landcover #" + i).text(Math.round(a));
        //$("#acres #" + i).text(landCoverArea[i]);
    }

    var stats = d3.select("#stats")
        .append("div")
        .attr("class", "row")
        .style("width", "400px");



    stats.append("div")
        .attr("class","row")
        .attr("width", "300px")
        .attr("height", "30px")
        .text("Strategic Wetland Placement: " + global.strategicWetland.actual + " out of " + global.strategicWetland.possible + " locations.");

    stats.append("div")
        .attr("class","row")
        .attr("width", "300px")
        .attr("height", "30px")
        .text("Percent of stream buffered: " + global.streamNetwork + "%");

    var precip = d3.select("#precipitation-placeholder")
        .append("div")
        .style("width", "400px")
        .attr("class", "precip-table")

    for(var i=0;i<4;i++) {
        var row = precip.append("div")
            .attr("class", "row")
            .style("width","400px")
            .style("height", "30px");

        row.append("div")
            .attr("class", "col")
            .style("width","100px")
            .style("float", "left")
            .text("Year " + i);

        row.append("div")
            .attr("class", "col")
            .style("width","100px")
            .style("float", "left")
            .text(function() {return global.precipitation[i];});

        row.append("div")
            .attr("class", "col")
            .style("width","100px")
            .style("float", "left")
            .text(function() {return getPrecipitationValuation(global.precipitation[i]);});
    }

    var landuse = d3.select("#landuse-outputs")
        .append("div")
        .style("width", "455px");

    var r = landuse.append("div")
        .attr("class", "row")
        .style("width", "450px")
        .style("height", "30px");

    r.append("div")
        .attr("class", "col")
        .style("width","150px")
        .style("height", "30px")
        .style("float", "left")
        .style("font-size", ".8em")
        .text();

    r.append("div")
        .attr("class", "col")
        .style("width","100px")
        .style("float", "left")
        .text("Year 1");

    r.append("div")
        .attr("class", "col")
        .style("width","100px")
        .style("float", "left")
        .text("Year 2");

    r.append("div")
        .attr("class", "col")
        .style("width","100px")
        .style("float", "left")
        .text("Year 3");

    for(var i=0;i<14;i++) {
        var row = landuse.append("div")
            .attr("class", "row")
            .style("width", "450px")
            .style("height", "30px");

        row.append("div")
            .attr("class", "col")
            .style("width","150px")
            .style("float", "left")
            .style("font-size", ".8em")
            .text(function(){return dataset[i].Metric;});

        row.append("div")
            .attr("class", "col")
            .style("width","100px")
            .style("float", "left")
            .text(function() {return Math.round(dataset[i].Year1);});

        row.append("div")
            .attr("class", "col")
            .style("width","100px")
            .style("float", "left")
            .text(function() {return Math.round(dataset[i].Year2);});

        row.append("div")
            .attr("class", "col")
            .style("width","100px")
            .style("float", "left")
            .text(function() {return Math.round(dataset[i].Year3);});
    }
}