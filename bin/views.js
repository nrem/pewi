/**
 *
 * @param options
 * @constructor
 */
var ModalView = function (options) {

    // Make sure to close all open displays
    closeAllRemovableDisplays();
	
    this.width = (options.width !== undefined) ? options.width : $(window).width() / 2;
    this.height = (options.height !== undefined) ? options.height : $(window).height() / 1.1;
    this.title = (options.title !== undefined) ? options.title : "Default";
    this.scrollable = (options.scrollable !== undefined) ? options.scrollable : true;
    var close_button_url = "images/icons/navigation/close_mini_dark-gray.svg",
        $container, $body, $addons = '', interval, thisview = this;

    this.display = function () {
	    $("#main").append('<div id="popup-container" class="popup-window removable-displays-container"></div>');
	    $("#popup-container").width(this.width)/*.height(this.height)*/.css("max-height", this.height).css("overflow", this.scrollable);
	    $container = $("#popup-container");
	    $container.append('<div id="popup-container-head" class="popup-window-head"></div>');
	    $("#popup-container-head").append("<a>" + this.title + "</a>");
	    $("#popup-container-head").append('<img src="' + close_button_url + '" class="popup-window-close-button" id="popup-container-head-close-button">');
	    $container.append('<div id="popup-container-body" class="popup-window-body"></div>');
	    $body = $("#popup-container-body");
		if($addons !== undefined) {
			$body.append($addons);
		}
		
        centerize();
//        $container.show("slide", {direction: "right"}, 500);
        $container.fadeIn();
		
	    $(".popup-window-close-button").click(function () {
	        $("#popup-container").remove();
	        global.sm.consumeEvent("goto-mainevent");
	    });
    };
	
	this.teaser = function(options) {
		// var width = (options.width !== undefined) ? options.width : '150px',
			// height = (options.height !== undefined) ? options.width : '100px';
		var message = (options.message !== undefined) ? options.message : 'Click Here for more information';
		
		$('#main').append('<div id="popup-container-teaser" class="popup-window removable-displays-container"></div>');
		$container = $('#popup-container-teaser');
		$container.append('<div id="popup-container-teaser-body" class="popup-window-teaser-body">' + message + '</div>');
		$container.append('<img src="' + close_button_url + '" class="popup-window-close-button popup-window-teaser-close-button" id="popup-container-head-close-button">');
		
		setTimeout(function() {
			$container.show('slide', {direction: 'left'}, 200);
			interval = setInterval(function() { $container.effect('bounce', 'slow') }, 3000);
		}, 1500);
		
		$container.click(function() {
			$container.remove();
			clearInterval(interval);
			global.sm.consumeEvent(global.sm.goto.POPUP);
			thisview.display();
		});
		
   	 	$(".popup-window-close-button").click(function () {
        	$("#popup-container-teaser").remove();
        	// global.sm.consumeEvent("goto-mainevent");
    	});
	};
	
    this.dispose = function () {
        $("#main").remove("#popup-container");
    }
	
    this.append = function ($element) {
		$addons = $addons + $element;
        // $body.append($element);
        // centerize();
    }

    this.remove = function ($element) {
        $element.remove();
    }
	
	function bindCloseButtonInteraction() {
	    
	}

    function centerize() {
        centerElement($(window), $container);
    }

    this.$element = $("#popup-container");
};

/**
 *
 * @constructor
 */
var PrintView = function () {
    var options = {
            width: "9.5in",
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
        .style("text-align", "right")
        .attr("colspan", 10)
        .append("div")
        .attr("class", "display-options-dropdown-button")
        .append("a").text("Display Options")
        .attr("class", "display-options-dropdown");

    var measure = tableLandcover.append("tr")
        .attr("class", "results-table-header-row");
    measure.append("th")
        .attr("class", "results-table-header-row-cell");
    headerMeasureCellFactory(measure, {1: "Percent", 2: "Acres", 3: "Hectares"});

    var titles = tableLandcover.append("tr")
        .attr("class", "results-table-header-row");
    headerTitleCellFactory(titles, {1: "Land Cover", 2: "Y1", 3: "Y2", 4: "Y3", 5: "Y1", 6: "Y2", 7: "Y3", 8: "Y1", 9: "Y2", 10: "Y3"});

    function headerMeasureCellFactory(header, data) {
        for (var value in data) {
            var b = header.append("th")
                .attr("class", "results-table-header-row-cell")
//            .style("text-align", "center")
                .attr("colspan", 3)
                .append("a").text(data[value]);
        }
    }

    function headerTitleCellFactory(header, data) {
        for (var value in data) {
            header.append("th")
                .attr("class", "results-table-header-row-cell")
                .append("a").text(data[value]);
        }
    }

    // Body
    for (var i = 1; i < landcovers.length; i++) {
        var row = tableLandcover.append("tr")
            .attr("class", (i % 2 !== 0) ? "odd" : "even");
        row.append("td").append("a").text(landcovers[i]);
        row.append("td").attr("class", "results-cell landcover-percent-y1").append("a").text((global.landuse[1][i]) ? Math.round((100 * global.landuse[1][i] / watershedArea) * 10) / 10 : 0);
        row.append("td").attr("class", "results-cell landcover-percent-y2").append("a").text((global.landuse[2][i]) ? Math.round((100 * global.landuse[2][i] / watershedArea) * 10) / 10 : 0);
        row.append("td").attr("class", "results-cell landcover-percent-y3").append("a").text((global.landuse[3][i]) ? Math.round((100 * global.landuse[3][i] / watershedArea) * 10) / 10 : 0);
        row.append("td").attr("class", "results-cell landcover-acres-y1").append("a").text((global.landuse[1][i]) ? Math.round(global.landuse[1][i] * 10) / 10 : 0);
        row.append("td").attr("class", "results-cell landcover-acres-y2").append("a").text((global.landuse[2][i]) ? Math.round(global.landuse[2][i] * 10) / 10 : 0);
        row.append("td").attr("class", "results-cell landcover-acres-y3").append("a").text((global.landuse[3][i]) ? Math.round(global.landuse[3][i] * 10) / 10 : 0);
        row.append("td").attr("class", "results-cell landcover-hectares-y1").append("a").text((global.landuse[1][i]) ? Math.round(global.landuse[1][i] * HECTARES * 10) / 10 : 0);
        row.append("td").attr("class", "results-cell landcover-hectares-y2").append("a").text((global.landuse[2][i]) ? Math.round(global.landuse[2][i] * HECTARES * 10) / 10 : 0);
        row.append("td").attr("class", "results-cell landcover-hectares-y3").append("a").text((global.landuse[3][i]) ? Math.round(global.landuse[3][i] * HECTARES * 10) / 10 : 0);
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
        .style("text-align", "right")
        .attr("colspan", 10)
        .append("div")
        .attr("class", "display-options-dropdown-button")
        .append("a").text("Display Options")
        .attr("class", "display-options-dropdown");

    measure = tableScoreIndicator.append("tr")
        .attr("class", "results-table-header-row");
    measure.append("th")
        .attr("class", "results-table-header-row-cell");
    headerMeasureCellFactory(measure, {1: "Score(out of 100)", 2: "Value (English units)", 3: "Value (Metric units)"});

    titles = tableScoreIndicator.append("tr")
        .attr("class", "results-table-header-row");
    headerTitleCellFactory(titles, {1: "Score Indicator / Measurement", 2: "Y1", 3: "Y2", 4: "Y3", 5: "Y1", 6: "Y2", 7: "Y3", 8: "Y1", 9: "Y2", 10: "Y3"});

    // Body
    for (var i = 0; i < dataset.length; i++) {
        var row = tableScoreIndicator.append("tr")
            .attr("class", (i % 2 !== 0) ? "even" : "odd");
        row.append("td").append("a").text((dataset[i].resultsLabel) ? dataset[i].resultsLabel : dataset[i].Metric);
        row.append("td").attr("class", "results-cell").append("a").text(Math.round(dataset[i].Year1 * 10) / 10);
        row.append("td").attr("class", "results-cell").append("a").text(Math.round(dataset[i].Year2 * 10) / 10);
        row.append("td").attr("class", "results-cell").append("a").text(Math.round(dataset[i].Year3 * 10) / 10);
        row.append("td").attr("class", "results-cell grayed").append("a").text((Math.round((((dataset[i].Value1) ? dataset[i].Value1 : 0) * units.dict_to_english_factor[i] * 10)) / 10)).append("a").style("opacity", 0.5).text(" " + units.english[i]);
        row.append("td").attr("class", "results-cell grayed").append("a").text((Math.round((((dataset[i].Value2) ? dataset[i].Value2 : 0) * units.dict_to_english_factor[i] * 10)) / 10)).append("a").style("opacity", 0.5).text(" " + units.english[i]);
        row.append("td").attr("class", "results-cell grayed").append("a").text((Math.round((((dataset[i].Value3) ? dataset[i].Value3 : 0) * units.dict_to_english_factor[i] * 10)) / 10)).append("a").style("opacity", 0.5).text(" " + units.english[i]);
        row.append("td").attr("class", "results-cell grayed").append("a").text((Math.round((((dataset[i].Value1) ? dataset[i].Value1 : 0) * units.english_to_metric_factor[i] * 10)) / 10)).append("a").style("opacity", 0.5).text(" " + units.metric[i]);
        row.append("td").attr("class", "results-cell grayed").append("a").text((Math.round((((dataset[i].Value2) ? dataset[i].Value2 : 0) * units.english_to_metric_factor[i] * 10)) / 10)).append("a").style("opacity", 0.5).text(" " + units.metric[i]);
        row.append("td").attr("class", "results-cell grayed").append("a").text((Math.round((((dataset[i].Value3) ? dataset[i].Value3 : 0) * units.english_to_metric_factor[i] * 10)) / 10)).append("a").style("opacity", 0.5).text(" " + units.metric[i]);
    }

    // Footer
    tableScoreIndicator.append("tr")
        .attr("class", "results-table-footer-row");

    ///////////////////////////////////////////////////
    // Other Metrics //////////////////////////////////
    ///////////////////////////////////////////////////
    var otherMetrics = d3.select("#results-container")
        .append("table")
        .attr("class", "results-table");

    // Strategic Wetland Placement
    var strategicWetlandRow = otherMetrics.append("tr")
        .attr("class", "odd");
    strategicWetlandRow.append("td").append("a").text("Strategic Wetland out of " + global.strategicWetland[1].possible);
    strategicWetlandRow.append("td").attr("class", "results-cell");
    strategicWetlandRow.append("td").attr("class", "results-cell");
    strategicWetlandRow.append("td").attr("class", "results-cell");
    strategicWetlandRow.append("td").attr("class", "results-cell").append("a").text((global.data[1] !== 0 && global.strategicWetland[1]) ? global.strategicWetland[1].actual : 0);
    strategicWetlandRow.append("td").attr("class", "results-cell").append("a").text((global.data[2] !== 0 && global.strategicWetland[2]) ? global.strategicWetland[2].actual : 0);
    strategicWetlandRow.append("td").attr("class", "results-cell").append("a").text((global.data[3] !== 0 && global.strategicWetland[3]) ? global.strategicWetland[3].actual : 0);
    strategicWetlandRow.append("td").attr("class", "results-cell").append("a").text((global.data[1] !== 0 && global.strategicWetland[1]) ? global.strategicWetland[1].actual : 0);
    strategicWetlandRow.append("td").attr("class", "results-cell").append("a").text((global.data[2] !== 0 && global.strategicWetland[2]) ? global.strategicWetland[2].actual : 0);
    strategicWetlandRow.append("td").attr("class", "results-cell").append("a").text((global.data[3] !== 0 && global.strategicWetland[3]) ? global.strategicWetland[3].actual : 0);

    // Precipitation
    var precipitationRow = otherMetrics.append("tr")
        .attr("class", "even");

    precipitationRow.append("td").append("a").text("Precipitation");
    precipitationRow.append("td").attr("class", "results-cell");
    precipitationRow.append("td").attr("class", "results-cell");
    precipitationRow.append("td").attr("class", "results-cell");
    precipitationRow.append("td").attr("class", "results-cell").append("a").text(global.data.precipitation[1]).append("a").style("opacity", 0.5).text(" in");
    precipitationRow.append("td").attr("class", "results-cell").append("a").text(global.data.precipitation[2]).append("a").style("opacity", 0.5).text(" in");
    precipitationRow.append("td").attr("class", "results-cell").append("a").text(global.data.precipitation[3]).append("a").style("opacity", 0.5).text(" in");
    precipitationRow.append("td").attr("class", "results-cell").append("a").text(Math.round(global.data.precipitation[1] * 2.54 * 10) / 10).append("a").style("opacity", 0.5).text(" cm");
    precipitationRow.append("td").attr("class", "results-cell").append("a").text(Math.round(global.data.precipitation[2] * 2.54 * 10) / 10).append("a").style("opacity", 0.5).text(" cm");
    precipitationRow.append("td").attr("class", "results-cell").append("a").text(Math.round(global.data.precipitation[3] * 2.54 * 10) / 10).append("a").style("opacity", 0.5).text(" cm");

    ///////////////////////////////////////////////////
    // Indicator Table ////////////////////////////////
    ///////////////////////////////////////////////////
    var indicatorTable = d3.select("#results-container")
        .append("table")
        .attr("class", "results-table");

    // Header
    indicatorTable.append("tr")
        .attr("class", "results-table-header-row")
        .append("th")
        .attr("class", "results-table-header-row-cell")
        .style("text-align", "right")
        .attr("colspan", 10)
        .append("div")
        .attr("class", "display-options-dropdown-button")
        .append("a").text("Display Options")
        .attr("class", "display-options-dropdown");

    measure = indicatorTable.append("tr")
        .attr("class", "results-table-header-row");
    measure.append("th")
        .attr("class", "results-table-header-row-cell");
    headerMeasureCellFactory(measure, {1: "Year 1", 2: "Year 2", 3: "Year 3"});

    titles = indicatorTable.append("tr")
        .attr("class", "results-table-header-row");
    headerTitleCellFactory(titles, {1: "Indicator", 2: "", 3: "", 4: "", 5: "", 6: "", 7: "", 8: "", 9: "", 10: ""});

    // Body
    var nitrateRow = indicatorTable.append("tr")
        .attr("class", "odd");

    nitrateRow.append("td").append("a").text("Nitrate Pollution Contribution");
    nitrateRow.append("td").attr("colspan", 3).append("div").attr("id", "nitrate-output-map-1");
    nitrateRow.append("td").attr("colspan", 3).append("div").attr("id", "nitrate-output-map-2");
    nitrateRow.append("td").attr("colspan", 3).append("div").attr("id", "nitrate-output-map-3");

    var erosionRow = indicatorTable.append("tr")
        .attr("class", "even");

    erosionRow.append("td").append("a").text("Gross Erosion");
    erosionRow.append("td").attr("colspan", 3).append("div").attr("id", "erosion-output-map-1");
    erosionRow.append("td").attr("colspan", 3).append("div").attr("id", "erosion-output-map-2");
    erosionRow.append("td").attr("colspan", 3).append("div").attr("id", "erosion-output-map-3");

    var riskRow = indicatorTable.append("tr")
        .attr("class", "odd");

    riskRow.append("td").append("a").text("Phosphorus Pollution Contribution");
    riskRow.append("td").attr("colspan", 3).append("div").attr("id", "risk-assessment-output-map-1");
    riskRow.append("td").attr("colspan", 3).append("div").attr("id", "risk-assessment-output-map-2");
    riskRow.append("td").attr("colspan", 3).append("div").attr("id", "risk-assessment-output-map-3");

    global.scoreDirector = new ScoreDirector();
    global.scoreDirector.calculateOutputMapValues();

    var opts = {
        scale: 3
    };
    global.outputmap = new OutputMap(opts);
    global.outputmap.draw(3, false);

    ///////////////////////////////////////////////////
    // Print Commands /////////////////////////////////
    ///////////////////////////////////////////////////
//	var printCommands = d3.select("#results-container")
//		.append("div")
//		.attr("class", "print-commands-container");
//
//	printCommands.append("input")
//	    .attr("type", "button")
//	    .attr("value", "Print")
//        .on("click", function(e) {
//            var doc = $("#popup-container").html();
//
//            var w = window.open();
//            w.document.open();
//            w.document.write(doc);
//            w.document.close();
//            w.focus();
//            w.print();
//            w.close();
//
//        });

    centerElement($(window), modal.$element);
};