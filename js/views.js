/**
 *
 */

var ModalView = function (options) {
    this.width = (options.width !== undefined) ? options.width : $(window).width() / 2;
    this.height = (options.height !== undefined) ? options.height : $(window).height() / 2;
    this.title = (options.title !== undefined) ? options.title : "Default";
    this.scrollable = (options.scrollable !== undefined) ? options.scrollable : true;
    var close_button_url = "images/icons/navigation/close_black.png",
        $container, $body;
    $("#main").append('<div id="popup-container" class="popup-window"></div>');
    $("#popup-container").width(this.width).height(this.height).css("overflow", this.scrollable);
    $container = $("#popup-container");
    $container.append('<div id="popup-container-head" class="popup-window-head"></div>');
    $("#popup-container-head").append("<a>" + this.title + "</a>");
    $("#popup-container-head").append('<img src="' + close_button_url + '" class="popup-window-close-button" id="popup-container-head-close-button">');
    $container.append('<div id="popup-container-body" class="popup-window-body"></div>');
    $body = $("#popup-container-body");

    this.display = function () {
        centerize();
        $container.show("slide", {direction: "right"}, 500);
    };
    this.dispose = function () {
        console.log("Here");
        $("#main").remove("#popup-container");
    }
    this.append = function ($element) {
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

var PrintView = function () {
    var options = {
            width: SCREEN.width / 1.1,
            height: SCREEN.height,
            title: "Results"
        },
        modal = new ModalView(options);
    modal.append('<section class="output-map-container"><div><a>Nitrate Watershed Percent Contribution</a></div><div id="nitrate-output-map" class="output-map"><div id="watershed-percent-stat"><a></a></div></div></section><section class="output-map-container"><div><a>Gross Erosion</a></div><div id="erosion-output-map" class="output-map"><div id="erosion-stat"><a></a></div></div></section><section class="output-map-container"><div><a>Phosphorus Index Risk Assessment</a></div><div id="risk-assessment-output-map" class="output-map"><div id="risk-assessment-stat"><a></a></div></div></section>');
    modal.append('<section id="left-col"><section id=""><div id="precipitation-placeholder"></div></section><section id="landuse-outputs"></section><br /><div id="stats">Stats</div></section>');
    modal.append('<section id="right-col"><div id="landcover-values"><div id="percent-landcover"></div></div></section>');
    modal.display();

    var scale = 2,
        opts = {
            scale: scale,
            width: scale * 3 * 23 * 2,
            height: scale * 2 * 36
        },
        landcover = d3.select("#percent-landcover")
                        .append("div")
                        .attr("min-width", "400px")
            .text("Landuse Outputs"),
        outputmap = new OutputMap(opts);
    outputmap.draw();

    var head = landcover.append("div")
        .attr("class", "row")
        .style("min-width", "600px")
        .style("height", "30px");
    head.append("div")
        .style("width", "100px")
        .style("float", "left")
        .style("height", "100%");
    head.append("div")
        .style("min-width", "9em")
        .text("Year 1")
        .style("float", "left");
    head.append("div")
        .style("min-width", "9em")
        .text("Year 2")
        .style("float", "left");
    head.append("div")
        .style("min-width", "9em")
        .text("Year 3")
        .style("float", "left");

    for (var i = 0; i < landCoverArea.length; i++) {
        console.log(i);
        var a = 100 * (landCoverArea[i] / area);

        var row = landcover.append("div")
            .attr("class", "row")
            .style("min-width", "600px")
            .style("height", "30px");
        row.append("div")
            .attr("class", "landcover-facts-header")
            .text(function () {
                return landcovers[i + 1];
            })
            .style("font-size", ".8em")
            .style("float", "left")
            .style("width", "100px");
        for(var j=1; j < 4; j++) {
            if(global.data[j] === 0) break;
            var cell = row.append("div");
            cell.append("div")
                .attr("id", "year-" + j + "percent-landcover-value")
                .text(function () {
                    var b = Math.round(a);
                    if (b > 0) {
                        return b + "%";
                    } else {
                        return b;
                    }
                })
                .style("float", "left")
                .style("min-width", "3em");
            cell.append("div")
                .attr("id", "year-" + j + "acres-landcover-value")
                .text(function () {
                    if (global.landuse[j][i] > 0) {
                        return global.landuse[j][i];// + " acres";
                    } else {
                        return global.landuse[j][i];
                    }
                })
                .style("float", "left")
                .style("min-width", "3em");
            cell.append("div")
                .attr("id", "year-" + j + "hectares-landcover-value")
                .text(function () {
                    var h = Math.round(0.404686 * global.landuse[j][i]);
                    if (h > 0) {
                        return h;// + " hectares";
                    } else {
                        return h;
                    }
                })
                .style("float", "left")
                .style("min-width", "3em");
            //$("#percent-landcover #" + i).text(Math.round(a));
            //$("#acres #" + i).text(landCoverArea[i]);
        }
    }

    var stats = d3.select("#stats")
        .append("div")
        .attr("class", "row")
        .style("width", "400px");


    stats.append("div")
        .attr("class", "row")
        .attr("width", "300px")
        .attr("height", "30px")
        .text("Strategic Wetland Placement: " + global.strategicWetland.actual + " out of " + global.strategicWetland.possible + " locations.");

    stats.append("div")
        .attr("class", "row")
        .attr("width", "300px")
        .attr("height", "30px")
        .text("Percent of stream buffered: " + global.streamNetwork + "%");

    var precip = d3.select("#precipitation-placeholder")
        .append("div")
        .style("width", "400px")
        .attr("class", "precip-table")
        .text("Precipitation Values");

    for (var i = 0; i < 4; i++) {
        var row = precip.append("div")
            .attr("class", "row")
            .style("width", "400px")
            .style("height", "30px"),
            precip_inches = global.precipitation[i],
            precip_cm = precip_inches * 2.54;

        row.append("div")
            .attr("class", "col")
            .style("width", "100px")
            .style("float", "left")
            .text("Year " + i);

        row.append("div")
            .attr("class", "col")
            .style("width", "100px")
            .style("float", "left")
            .text(function () {
                return precip_inches.toFixed(1) + " in";
            });

        row.append("div")
            .attr("class", "col")
            .style("width", "100px")
            .style("float", "left")
            .text(function () {
                return precip_cm.toFixed(1) + " cm";
            });

        row.append("div")
            .attr("class", "col")
            .style("width", "100px")
            .style("float", "left")
            .text(function () {
                return getPrecipitationValuation(global.precipitation[i]);
            });
    }

    var landuse = d3.select("#landuse-outputs")
        .append("div")
        .style("width", "455px")
        .text("Index Values");

    var r = landuse.append("div")
        .attr("class", "row")
        .style("width", "450px")
        .style("height", "30px");

    r.append("div")
        .attr("class", "col")
        .style("width", "150px")
        .style("height", "30px")
        .style("float", "left")
        .style("font-size", ".8em")
        .text();

    r.append("div")
        .attr("class", "col")
        .style("width", "100px")
        .style("float", "left")
        .text("Year 1");

    r.append("div")
        .attr("class", "col")
        .style("width", "100px")
        .style("float", "left")
        .text("Year 2");

    r.append("div")
        .attr("class", "col")
        .style("width", "100px")
        .style("float", "left")
        .text("Year 3");

    for (var i = 0; i < 14; i++) {
        var row = landuse.append("div")
            .attr("class", "row")
            .style("width", "450px")
            .style("height", "30px");

//        row.append("div")
//            .attr("class", "col")
//            .style("width", "150px")
//            .style("float", "left")
//            .style("font-size", ".8em")
//            .text(function() {
//                return 0;
//            });

        row.append("div")
            .attr("class", "col")
            .style("width", "150px")
            .style("float", "left")
            .style("font-size", ".8em")
            .text(function () {
                return dataset[i].Metric;
            });

        row.append("div")
            .attr("class", "col")
            .style("width", "100px")
            .style("float", "left")
            .text(function () {
                return Math.round(dataset[i].Year1);
            });

        row.append("div")
            .attr("class", "col")
            .style("width", "100px")
            .style("float", "left")
            .text(function () {
                return Math.round(dataset[i].Year2);
            });

        row.append("div")
            .attr("class", "col")
            .style("width", "100px")
            .style("float", "left")
            .text(function () {
                return Math.round(dataset[i].Year3);
            });
    }
}