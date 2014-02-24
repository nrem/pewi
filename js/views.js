/**
 *
 * @param options
 * @constructor
 */
var ModalView = function (options) {
    this.width = (options.width !== undefined) ? options.width : $(window).width() / 2;
    this.height = (options.height !== undefined) ? options.height : $(window).height() / 1.25;
    this.title = (options.title !== undefined) ? options.title : "Default";
    this.scrollable = (options.scrollable !== undefined) ? options.scrollable : true;
    var close_button_url = "images/icons/navigation/close_mini_dark-gray.svg",
        $container, $body;
    $("#main").append('<div id="popup-container" class="popup-window removable-displays-container"></div>');
    $("#popup-container").width(this.width)/*.height(this.height)*/.css("max-height", this.height).css("overflow", this.scrollable);
    $container = $("#popup-container");
    $container.append('<div id="popup-container-head" class="popup-window-head"></div>');
    $("#popup-container-head").append("<a>" + this.title + "</a>");
    $("#popup-container-head").append('<img src="' + close_button_url + '" class="popup-window-close-button" id="popup-container-head-close-button">');
    $container.append('<div id="popup-container-body" class="popup-window-body"></div>');
    $body = $("#popup-container-body");

    this.display = function () {
        centerize();
//        $container.show("slide", {direction: "right"}, 500);
        $container.fadeIn();
    };
    this.dispose = function () {
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
    
    this.$element = $("#popup-container");
};

/**
 *
 * @constructor
 */
var PrintView = function () {
    var options = {
            width: "8.5in",
            title: "PE/WI Results"
        },
        modal = new ModalView(options),
        HECTARES = 0.404686;
    modal.append('<div id="results-container"></div>');
//    modal.append('<section class="output-map-container"><div><a>Nitrate Watershed Percent Contribution</a></div><div id="nitrate-output-map" class="output-map"><div id="watershed-percent-stat"><a></a></div></div></section><section class="output-map-container"><div><a>Gross Erosion</a></div><div id="erosion-output-map" class="output-map"><div id="erosion-stat"><a></a></div></div></section><section class="output-map-container"><div><a>Phosphorus Index Risk Assessment</a></div><div id="risk-assessment-output-map" class="output-map"><div id="risk-assessment-stat"><a></a></div></div></section>');
//    modal.append('<section id="left-col"><section id=""><div id="precipitation-placeholder"></div></section><section id="landuse-outputs"></section><br /><div id="stats">Stats</div></section>');
//    modal.append('<section id="right-col"><div id="landcover-values"><div id="percent-landcover"></div></div></section>');
    modal.display();
    
    ///////////////////////////////////////////////////
    // Landcover Table ////////////////////////////////
    ///////////////////////////////////////////////////
    
    var tableLandcover = d3.select("#results-container")
    .append("table")
    .attr("class", "results-table");
    
//    var headLandcover = tableLandcover.append("th")
//    .attr("class", "results-table-header");
    
    // Header
    tableLandcover.append("tr")
    .attr("class", "results-table-header-row")
    .append("th")
    .attr("class", "results-table-header-row-cell")
    .style("right", 0)
    .append("a").text("Display Options");
    
    var measure = tableLandcover.append("tr")
    .attr("class", "results-table-header-row");
    headerMeasureCellFactory(measure, {1: "", 2: "Percent", 3: "", 4: "", 5: "Acres", 6: "", 7: "", 8: "Hectares", 9: "", 10: ""});
    
    var titles = tableLandcover.append("tr")
    .attr("class", "results-table-header-row");
    headerTitleCellFactory(titles, {1: "Land Cover", 2: "Y1", 3: "Y2", 4: "Y3", 5: "Y1", 6: "Y2", 7: "Y3", 8: "Y1", 9: "Y2", 10: "Y3"});
    
    function headerMeasureCellFactory(header, data) {
        for(var value in data) {
            var b = header.append("th")
            .attr("class", "results-table-header-row-cell")
            .style("text-align", "center")
            .append("a").text(data[value]);

            if(data[value] !== "") b.attr("colspan", 3);
        }
    }
    
    function headerTitleCellFactory(header, data) {
        for(var value in data) {
            header.append("th")
            .attr("class", "results-table-header-row-cell")
            .append("a").text(data[value]);
        }
    }
    // Body
    for(var i=1; i<landcovers.length; i++) {
        var row = tableLandcover.append("tr")
            .attr("class", (i%2 !== 0) ? "odd" : "even");
        row.append("td").append("a").text(landcovers[i]);
        row.append("td").append("a").text(Math.round((100 * global.landuse[1][i-1] / watershedArea) * 10) / 10);
        row.append("td").append("a").text((global.landuse[2] !== undefined) ? Math.round((100 * global.landuse[2][i-1] / watershedArea) * 10) / 10 : 0);
        row.append("td").append("a").text((global.landuse[3] !== undefined) ? Math.round((100 * global.landuse[3][i-1] / watershedArea) * 10) / 10 : 0);
        row.append("td").append("a").text((global.landuse[1] !== undefined) ? Math.round(global.landuse[1][i-1] * 10) / 10 : 0);
        row.append("td").append("a").text((global.landuse[2] !== undefined) ? Math.round(global.landuse[2][i-1] * 10) / 10 : 0);
        row.append("td").append("a").text((global.landuse[3] !== undefined) ? Math.round(global.landuse[3][i-1] * 10) / 10 : 0);
        row.append("td").append("a").text((global.landuse[1] !== undefined) ? Math.round(global.landuse[1][i-1] * HECTARES * 10) / 10 : 0);
        row.append("td").append("a").text((global.landuse[2] !== undefined) ? Math.round(global.landuse[2][i-1] * HECTARES * 10) / 10 : 0);
        row.append("td").append("a").text((global.landuse[3] !== undefined) ? Math.round(global.landuse[3][i-1] * HECTARES * 10) / 10 : 0);
    }
    
    // Footer
    
    ///////////////////////////////////////////////////
    // Score Indicator Table //////////////////////////
    ///////////////////////////////////////////////////
    
    var tableScoreIndicator = d3.select("#results-container")
    .append("table")
    .attr("class", "results-table")
    .style("width", "100%");
    
    // Header
    tableScoreIndicator.append("tr")
    .attr("class", "results-table-header-row")
    .append("th")
    .attr("class", "results-table-header-row-cell")
    .style("right", 0)
    .append("a").text("Display Options");
    
    measure = tableScoreIndicator.append("tr")
    .attr("class", "results-table-header-row");
    headerMeasureCellFactory(measure, {1: "", 2: "Score(out of 100)", 3: "", 4: "", 5: "Value (English units)", 6: "", 7: "", 8: "Value (Metric units)", 9: "", 10: ""});
    
    titles = tableScoreIndicator.append("tr")
    .attr("class", "results-table-header-row");
    headerTitleCellFactory(titles, {1: "Score Indicator / Measurement", 2: "Y1", 3: "Y2", 4: "Y3", 5: "Y1", 6: "Y2", 7: "Y3", 8: "Y1", 9: "Y2", 10: "Y3"});
    
    // Body
    console.log(dataset);
    for(var i=0; i<dataset.length; i++) {
        var row = tableScoreIndicator.append("tr")
        .attr("class", (i%2 !== 0) ? "odd" : "even");
        row.append("td").append("a").text(dataset[i].Metric);
        row.append("td").append("a").text(Math.round(dataset[i].Year1 * 10) / 10);
        row.append("td").append("a").text(Math.round(dataset[i].Year2 * 10) / 10);
        row.append("td").append("a").text(Math.round(dataset[i].Year3 * 10) / 10);
        row.append("td").append("a").text((dataset[i].Value1) ? Math.round(dataset[i].Value1 * 10) / 10 : 0);
        row.append("td").append("a").text((dataset[i].Value2) ? Math.round(dataset[i].Value2 * 10) / 10 : 0);
        row.append("td").append("a").text((dataset[i].Value3) ? Math.round(dataset[i].Value3 * 10) / 10 : 0);
        row.append("td").append("a").text((dataset[i].Value1) ? Math.round(dataset[i].Value1 * 10) / 10 * 1 : 0);
        row.append("td").append("a").text((dataset[i].Value2) ? Math.round(dataset[i].Value2 * 10) / 10 * 1 : 0);
        row.append("td").append("a").text((dataset[i].Value3) ? Math.round(dataset[i].Value3 * 10) / 10 * 1: 0);
    }
    
    // Footer
    tableScoreIndicator.append("tr")
    .attr("class", "results-table-footer-row");
    
//
//    var scale = 2,
//        opts = {
//            scale: scale,
//            width: scale * 3 * 23 * 2,
//            height: scale * 2 * 36
//        },
//        landcover = d3.select("#percent-landcover")
//                        .append("div")
//                        .attr("min-width", "400px")
//            .text("Landuse Outputs"),
//        outputmap = new OutputMap(opts);
//    outputmap.draw();

//    var head = landcover.append("div")
//        .attr("class", "row")
//        .style("min-width", "600px")
//        .style("height", "30px");
//    head.append("div")
//        .style("width", "100px")
//        .style("float", "left")
//        .style("height", "100%");
//    head.append("div")
//        .style("min-width", "9em")
//        .text("Year 1")
//        .style("float", "left");
//    head.append("div")
//        .style("min-width", "9em")
//        .text("Year 2")
//        .style("float", "left");
//    head.append("div")
//        .style("min-width", "9em")
//        .text("Year 3")
//        .style("float", "left");
//
//    for (var i = 0; i < landCoverArea.length; i++) {
//        console.log(i);
//        var a = 100 * (landCoverArea[i] / area);
//
//        var row = landcover.append("div")
//            .attr("class", "row")
//            .style("min-width", "600px")
//            .style("height", "30px");
//        row.append("div")
//            .attr("class", "landcover-facts-header")
//            .text(function () {
//                return landcovers[i + 1];
//            })
//            .style("font-size", ".8em")
//            .style("float", "left")
//            .style("width", "100px");
//        for(var j=1; j < 4; j++) {
//            if(global.data[j] === 0) break;
//            var cell = row.append("div");
//            cell.append("div")
//                .attr("id", "year-" + j + "percent-landcover-value")
//                .text(function () {
//                    var b = Math.round(a);
//                    if (b > 0) {
//                        return b + "%";
//                    } else {
//                        return b;
//                    }
//                })
//                .style("float", "left")
//                .style("min-width", "3em");
//            cell.append("div")
//                .attr("id", "year-" + j + "acres-landcover-value")
//                .text(function () {
//                    if (global.landuse[j][i] > 0) {
//                        return global.landuse[j][i];// + " acres";
//                    } else {
//                        return global.landuse[j][i];
//                    }
//                })
//                .style("float", "left")
//                .style("min-width", "3em");
//            cell.append("div")
//                .attr("id", "year-" + j + "hectares-landcover-value")
//                .text(function () {
//                    var h = Math.round(0.404686 * global.landuse[j][i]);
//                    if (h > 0) {
//                        return h;// + " hectares";
//                    } else {
//                        return h;
//                    }
//                })
//                .style("float", "left")
//                .style("min-width", "3em");
//            //$("#percent-landcover #" + i).text(Math.round(a));
//            //$("#acres #" + i).text(landCoverArea[i]);
//        }
//    }
//
//    var stats = d3.select("#stats")
//        .append("div")
//        .attr("class", "row")
//        .style("width", "400px");
//
//
//    stats.append("div")
//        .attr("class", "row")
//        .attr("width", "300px")
//        .attr("height", "30px")
//        .text("Strategic Wetland Placement: " + global.strategicWetland.actual + " out of " + global.strategicWetland.possible + " locations.");
//
//    stats.append("div")
//        .attr("class", "row")
//        .attr("width", "300px")
//        .attr("height", "30px")
//        .text("Percent of stream buffered: " + global.streamNetwork + "%");
//
//    var precip = d3.select("#precipitation-placeholder")
//        .append("div")
//        .style("width", "400px")
//        .attr("class", "precip-table")
//        .text("Precipitation Values");
//
//    for (var i = 0; i < 4; i++) {
//        var row = precip.append("div")
//            .attr("class", "row")
//            .style("width", "400px")
//            .style("height", "30px"),
//            precip_inches = global.precipitation[i],
//            precip_cm = precip_inches * 2.54;
//
//        row.append("div")
//            .attr("class", "col")
//            .style("width", "100px")
//            .style("float", "left")
//            .text("Year " + i);
//
//        row.append("div")
//            .attr("class", "col")
//            .style("width", "100px")
//            .style("float", "left")
//            .text(function () {
//                return precip_inches.toFixed(1) + " in";
//            });
//
//        row.append("div")
//            .attr("class", "col")
//            .style("width", "100px")
//            .style("float", "left")
//            .text(function () {
//                return precip_cm.toFixed(1) + " cm";
//            });
//
//        row.append("div")
//            .attr("class", "col")
//            .style("width", "100px")
//            .style("float", "left")
//            .text(function () {
//                return getPrecipitationValuation(global.precipitation[i]);
//            });
//    }
//
//    var landuse = d3.select("#landuse-outputs")
//        .append("div")
//        .style("width", "455px")
//        .text("Index Values");
//
//    var r = landuse.append("div")
//        .attr("class", "row")
//        .style("width", "450px")
//        .style("height", "30px");
//
//    r.append("div")
//        .attr("class", "col")
//        .style("width", "150px")
//        .style("height", "30px")
//        .style("float", "left")
//        .style("font-size", ".8em")
//        .text();
//
//    r.append("div")
//        .attr("class", "col")
//        .style("width", "100px")
//        .style("float", "left")
//        .text("Year 1");
//
//    r.append("div")
//        .attr("class", "col")
//        .style("width", "100px")
//        .style("float", "left")
//        .text("Year 2");
//
//    r.append("div")
//        .attr("class", "col")
//        .style("width", "100px")
//        .style("float", "left")
//        .text("Year 3");
//
//    for (var i = 0; i < 14; i++) {
//        var row = landuse.append("div")
//            .attr("class", "row")
//            .style("width", "450px")
//            .style("height", "30px");
//
////        row.append("div")
////            .attr("class", "col")
////            .style("width", "150px")
////            .style("float", "left")
////            .style("font-size", ".8em")
////            .text(function() {
////                return 0;
////            });
//
//        row.append("div")
//            .attr("class", "col")
//            .style("width", "150px")
//            .style("float", "left")
//            .style("font-size", ".8em")
//            .text(function () {
//                return dataset[i].Metric;
//            });
//
//        row.append("div")
//            .attr("class", "col")
//            .style("width", "100px")
//            .style("float", "left")
//            .text(function () {
//                return Math.round(dataset[i].Year1);
//            });
//
//        row.append("div")
//            .attr("class", "col")
//            .style("width", "100px")
//            .style("float", "left")
//            .text(function () {
//                return Math.round(dataset[i].Year2);
//            });
//
//        row.append("div")
//            .attr("class", "col")
//            .style("width", "100px")
//            .style("float", "left")
//            .text(function () {
//                return Math.round(dataset[i].Year3);
//            });
//    }
    centerElement($(window), modal.$element);
};