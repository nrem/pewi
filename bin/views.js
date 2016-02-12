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

    this.display = function (opts) {
	    $("#main").append('<div id="popup-container" class="popup-window removable-displays-container"></div>');
	    $("#popup-container").width(this.width)/*.height(this.height)*/.css("max-height", this.height).css("overflow", this.scrollable);
	    $container = $("#popup-container");
	    $container.append('<div id="popup-container-head" class="popup-window-head"></div>');

        this.title = (opts !== undefined && opts.title !== undefined) ? opts.title : this.title;

	    $("#popup-container-head").append("<a>" + this.title + "</a>");

	    $("#popup-container-head").append('<ul class="popup-window-tools pull-right list-unstyled list-inline">'+
            ((options.tools)?'<li title="Printing coming soon!"><img src="' + options.tools[0].icon + '" class="popup-window-print-button" id="'+options.tools[0].id+'"></li>':'')+
            '<li><img src="' + close_button_url + '" class="popup-window-close-button" id="popup-container-head-close-button"></li></ul>');
	    $container.append('<div id="popup-container-body" class="popup-window-body"></div>');
	    $body = $("#popup-container-body");

        $addons += (opts !== undefined && opts.description !== undefined) ? opts.description : '';

		if($addons !== undefined) {
			$body.append($addons);
		}

        centerize();
//        $container.show("slide", {direction: "right"}, 500);
        $container.fadeIn();

	    $(".popup-window-close-button").bind(global.selectClickType, function () {
	        $("#popup-container").remove();
	        global.sm.consumeEvent("goto-mainevent");
	    });
//        $container.draggable({scroll: false});
    };

	this.teaser = function(options) {
		// var width = (options.width !== undefined) ? options.width : '150px',
			// height = (options.height !== undefined) ? options.width : '100px';
		var message = (options.message !== undefined) ? options.message : 'Click Here for more information';

		$('#main').append('<div id="popup-container-teaser" class="popup-window removable-displays-container"></div>');
		$container = $('#popup-container-teaser');
		$container.append('<div id="popup-container-teaser-body" class="popup-window-teaser-body">' + message + '</div>');
		$container.append('<img src="' + close_button_url + '" class="popup-window-close-button popup-window-teaser-close-button" id="popup-container-head-close-button">');

        if(options.timeout !== undefined) {
            setTimeout(function() {
                $container.show('slide', {direction: 'left'}, 200);
                interval = setInterval(function() { $container.effect('bounce', 'slow') }, 3000);
            }, 1500);
        } else {
            $container.show('slide', {direction: 'left'}, 200);
            interval = setInterval(function() { $container.effect('bounce', 'slow') }, 3000);
        }

		$container.bind(global.selectClickType, function() {
			$container.remove();
			clearInterval(interval);
			global.sm.consumeEvent(global.sm.goto.POPUP);
			thisview.display({title: options.title, description: options.description});
		});

   	 	$(".popup-window-close-button").bind(global.selectClickType, function () {
        	$("#popup-container-teaser").remove();
        	// global.sm.consumeEvent("goto-mainevent");
    	});
	};

    this.dispose = function () {
        $("#main").remove("#popup-container");
    }

    this.append = function ($element) {
		if($container !== undefined && $container.is(':visible')) {
			$body.append($element);
			centerize();
		} else {
			$addons = $addons + $element;
		}
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
            title: "PEWI Results",
            tools:[{id:'print',icon:'images/icons/Button_Print.svg'}]
        },
        modal = new ModalView(options),
        HECTARES = 0.404686;
    modal.append('<div id="results-container"></div>');
//    modal.append('<section class="output-map-container"><div><a>Subwatershed Nitrate-N Percent Contribution</a></div><div id="nitrate-output-map" class="output-map"><div id="watershed-percent-stat"><a></a></div></div></section><section class="output-map-container"><div><a>Gross Erosion</a></div><div id="erosion-output-map" class="output-map"><div id="erosion-stat"><a></a></div></div></section><section class="output-map-container"><div><a>Phosphorus Index Risk Assessment</a></div><div id="risk-assessment-output-map" class="output-map"><div id="risk-assessment-stat"><a></a></div></div></section>');
//    modal.append('<section id="left-col"><section id=""><div id="precipitation-placeholder"></div></section><section id="landuse-outputs"></section><br /><div id="stats">Stats</div></section>');
//    modal.append('<section id="right-col"><div id="landusetype-values"><div id="percent-landusetype"></div></div></section>');
    modal.display();

    ///////////////////////////////////////////////////
    // landusetype Table ////////////////////////////////
    ///////////////////////////////////////////////////

    var tableLandUseType = d3.select("#results-container")
        .append("table")
        .attr("class", "results-table hover");
    var tableLandUseTypeHead = tableLandUseType.append("thead");

//    var headlandusetype = tableLandUseType.append("th")
//    .attr("class", "results-table-header");

    // Header
    tableLandUseTypeHead.append("tr")
        .attr("class", "results-table-header-row")
        .append("th")
        .attr("class", "results-table-header-row-cell")
        .style("text-align", "right")
        .attr("colspan", 10)
        .append("div")
        .attr("class", "display-options-dropdown-button");
//        .append("a").text("Display Options")
//        .attr("class", "display-options-dropdown");

    var measure = tableLandUseTypeHead.append("tr")
        .attr("class", "results-table-header-row");
    measure.append("th")
        .attr("class", "results-table-header-row-cell");
    headerMeasureCellFactory(measure, {1: "Percent", 2: "Area: English", 3: "Area: Metric"});

    var titles = tableLandUseTypeHead.append("tr")
        .attr("class", "results-table-header-row border-bottom");
    headerTitleCellFactory(titles, {1: "Land-Use Category and Cover", 2: "Y1", 3: "Y2", 4: "Y3", 5: "Y1", 6: "Y2", 7: "Y3",8: "Units", 9: "Y1", 10: "Y2", 11: "Y3", 12: "Units"});

    function headerMeasureCellFactory(header, data) {
        for (var value in data) {
            var b = header.append("th")
                .attr("class", "results-table-header-row-cell")
//            .style("text-align", "center")
                .attr("colspan", (value>1)?4:3)
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

    var landusedata = [];
    // Defines the layout for the Land-User Category and Cover results table
    var layout = [
        {label:'Annual Grain'},
        1, // Corresponds to the landUseTypes array index
        2,
        {label:'Annual Legume'},
        3,
        4,
        {label:'Mixed Fruits & Vegetables'},
        15,
        {label:'Pasture'},
        6,
        7,
        {label:'Perennial Herbaceous (non-pasture)'},
        8,
        12,
        9,
        14,
        {label:'Perennial Legume'},
        5,
        {label:'Perennial Woody'},
        10,
        11,
        13
    ];
    for (var i = 0; i < layout.length; i++) {
        if(typeof layout[i] == 'object') {
            landusedata.push(layout[i]);
        } else {
            var obj = {};
            obj.label = landUseTypes[layout[i]];
            obj.score1 = (global.landuse[1][layout[i]]) ? Math.round((100 * global.landuse[1][layout[i]] / watershedArea) * 10) / 10 : 0;
            obj.score2 = (global.landuse[2][layout[i]]) ? Math.round((100 * global.landuse[2][layout[i]] / watershedArea) * 10) / 10 : 0;
            obj.score3 = (global.landuse[3][layout[i]]) ? Math.round((100 * global.landuse[3][layout[i]] / watershedArea) * 10) / 10 : 0;
            obj.val1 = (global.landuse[1][layout[i]]) ? Math.round(global.landuse[1][layout[i]] * 10) / 10 : 0;
            obj.val2 = (global.landuse[2][layout[i]]) ? Math.round(global.landuse[2][layout[i]] * 10) / 10 : 0;
            obj.val3 = (global.landuse[3][layout[i]]) ? Math.round(global.landuse[3][layout[i]] * 10) / 10 : 0;
            obj.valcvt1 = (global.landuse[1][layout[i]]) ? Math.round(global.landuse[1][layout[i]] * HECTARES * 10) / 10 : 0;
            obj.valcvt2 = (global.landuse[2][layout[i]]) ? Math.round(global.landuse[2][layout[i]] * HECTARES * 10) / 10 : 0;
            obj.valcvt3 = (global.landuse[3][layout[i]]) ? Math.round(global.landuse[3][layout[i]] * HECTARES * 10) / 10 : 0;
            landusedata.push(obj);
        }
    }
    var rows = tableLandUseType.append('tbody').selectAll('tr').data(landusedata).enter().append('tr').attr('id',function(d){return d.label}).attr("class", function(d,i){ return (parseInt(i) % 2 !== 0) ? "even" : "odd"});
    rows.append("td").each(function(d) {
        if(d.hasOwnProperty('score1')) {
            d3.select(this).style('padding-left','20px').append('span').text(d.label);
        } else {
            d3.select(this).append('strong').text(d.label);
        }
    });
    rows.append("td").attr("class", "results-cell landusetype-percent-y1").append("a").text(function(d){return d.score1});
    rows.append("td").attr("class", "results-cell landusetype-percent-y2").append("a").text(function(d){return d.score2});
    rows.append("td").attr("class", "results-cell landusetype-percent-y3").append("a").text(function(d){return d.score3});
    rows.append("td").attr("class", "results-cell landusetype-acres-y1").append("a").text(function(d){return d.val1});
    rows.append("td").attr("class", "results-cell landusetype-acres-y2").append("a").text(function(d){return d.val2});
    rows.append("td").attr("class", "results-cell landusetype-acres-y3").append("a").text(function(d){return d.val3});
    rows.append("td").attr("class", "results-cell landusetype-acres-units").append("a").text(function(d){ return (d.hasOwnProperty('score1'))?'acres':''});
    rows.append("td").attr("class", "results-cell landusetype-hectares-y1").append("a").text(function(d){return d.valcvt1});
    rows.append("td").attr("class", "results-cell landusetype-hectares-y2").append("a").text(function(d){return d.valcvt2});
    rows.append("td").attr("class", "results-cell landusetype-hectares-y3").append("a").text(function(d){return d.valcvt3});
    rows.append("td").attr("class", "results-cell landusetype-hectares-units").append("a").text(function(d){ return (d.hasOwnProperty('score1'))?'hectares':''});

    // Footer

    ///////////////////////////////////////////////////
    // Score Indicator Table //////////////////////////
    ///////////////////////////////////////////////////

    var tableScoreIndicator = d3.select("#results-container")
        .append("table")
        .attr("class", "results-table hover")
        .style("width", "100%");
    var tableScoreIndicatorHead = tableScoreIndicator.append('thead');
    // Header
    tableScoreIndicatorHead.append("tr")
        .attr("class", "results-table-header-row")
        .append("th")
        .attr("class", "results-table-header-row-cell")
        .style("text-align", "right")
        .attr("colspan", 10)
        .append("div")
        .attr("class", "display-options-dropdown-button");
//        .append("a").text("Display Options")
//        .attr("class", "display-options-dropdown");

    measure = tableScoreIndicatorHead.append("tr")
        .attr("class", "results-table-header-row");
    measure.append("th")
        .attr("class", "results-table-header-row-cell");
    headerMeasureCellFactory(measure, {1: "Score(out of 100)", 2: "Measurement: English", 3: "Measurement: Metric"});

    titles = tableScoreIndicatorHead.append("tr")
        .attr("class", "results-table-header-row border-bottom");
    headerTitleCellFactory(titles, {1: "Ecosystem Service Indicator / Measurement", 2: "Y1", 3: "Y2", 4: "Y3", 5: "Y1", 6: "Y2", 7: "Y3", 8: "Units", 9: "Y1", 10: "Y2", 11: "Y3", 12: "Units"});

    var indexTotals = {1:0, 2:0, 3:0},
        ecodata = [];

    var layout = [
        {label:'Habitat'},
        'biodiversity',
        'game',
        {label:'Soil Quality'},
        'carbon',
        'erosion',
        {label:'Water Quality'},
        'nitrate',
        'phosphorus',
        'sediment',
        {label:'Yield'},
        'alfalfa',
        'cattle',
        'corn',
        'hay',
        'herbaceous',
        'mixed',
        'woody',
        'soybean',
        'timber'
    ];

    for (var i in layout) {
        if(typeof layout[i] == 'object') {
            ecodata.push(layout[i]);
        } else {
            var obj = {};
            obj.label = (dataset[layout[i]].resultsLabel) ? dataset[layout[i]].resultsLabel : dataset[layout[i]].Metric;
            obj.score1 = Math.round(dataset[layout[i]].Year1 * 10) / 10;
            obj.score2 = Math.round(dataset[layout[i]].Year2 * 10) / 10;
            obj.score3 = Math.round(dataset[layout[i]].Year3 * 10) / 10;
            obj.val1 = (Math.round((((dataset[layout[i]].Value1) ? dataset[layout[i]].Value1 : 0) * dataset[layout[i]].to_english_factor * 10)) / 10);
            obj.val2 = (Math.round((((dataset[layout[i]].Value2) ? dataset[layout[i]].Value2 : 0) * dataset[layout[i]].to_english_factor * 10)) / 10);
            obj.val3 = (Math.round((((dataset[layout[i]].Value3) ? dataset[layout[i]].Value3 : 0) * dataset[layout[i]].to_english_factor * 10)) / 10);
            obj.valcvt1 = (Math.round((((dataset[layout[i]].Value1) ? dataset[layout[i]].Value1 : 0) * dataset[layout[i]].to_metric_factor * 10)) / 10);
            obj.valcvt2 = (Math.round((((dataset[layout[i]].Value2) ? dataset[layout[i]].Value2 : 0) * dataset[layout[i]].to_metric_factor * 10)) / 10);
            obj.valcvt3 = (Math.round((((dataset[layout[i]].Value3) ? dataset[layout[i]].Value3 : 0) * dataset[layout[i]].to_metric_factor * 10)) / 10);
            obj.weight = dataset[layout[i]].weight;
            obj.english = dataset[layout[i]].units_english;
            obj.metric = dataset[layout[i]].units_metric;
            ecodata.push(obj);
        }
    }
    var rows = tableScoreIndicator.append('tbody').selectAll('tr').data(ecodata).enter().append('tr').attr("class", function(d,i){ return (parseInt(i) % 2 !== 0) ? "even" : "odd"});
    rows.append("td").each(function(d) {
        if(d.hasOwnProperty('score1')) {
            d3.select(this).style('padding-left','20px').append('span').text(d.label);
        } else {
            d3.select(this).append('strong').text(d.label);
        }
    });
    rows.append("td").attr("class", "results-cell landusetype-percent-y1").append("a").text(function(d){return d.score1});
    rows.append("td").attr("class", "results-cell landusetype-percent-y2").append("a").text(function(d){return d.score2});
    rows.append("td").attr("class", "results-cell landusetype-percent-y3").append("a").text(function(d){return d.score3});
    rows.append("td").attr("class", "results-cell landusetype-acres-y1").append("a").text(function(d){return d.val1});
    rows.append("td").attr("class", "results-cell landusetype-acres-y2").append("a").text(function(d){return d.val2});
    rows.append("td").attr("class", "results-cell landusetype-acres-y3").append("a").text(function(d){return d.val3});
    rows.append("td").attr("class", "results-cell landusetype-acres-units condensed").append("a").text(function(d){ return (d.english)?" " + d.english:''});
    rows.append("td").attr("class", "results-cell landusetype-hectares-y1").append("a").text(function(d){return d.valcvt1});
    rows.append("td").attr("class", "results-cell landusetype-hectares-y2").append("a").text(function(d){return d.valcvt2});
    rows.append("td").attr("class", "results-cell landusetype-hectares-y3").append("a").text(function(d){return d.valcvt3});
    rows.append("td").attr("class", "results-cell landusetype-hectares-units condensed").append("a").text(function(d){ return (d.english)?" " + d.metric:''});
    // Body
    for (var key in ecodata) {
        var o = ecodata[key];
        indexTotals[1] += (o.score1)?o.score1:0;
        indexTotals[2] += (o.score2)?o.score2:0;
        indexTotals[3] += (o.score3)?o.score3:0;
    }

    // Footer
    var footer = tableScoreIndicator.append('tfoot').append("tr")
        .attr("class", "results-table-footer-row total");

    footer.append('td').append('a').text('Total Index');
    footer.append('td').attr('class', 'results-cell').append('a').text(Math.round(indexTotals[1] * 10) / 10);
    footer.append('td').attr('class', 'results-cell').append('a').text(Math.round(indexTotals[2] * 10) / 10);
    footer.append('td').attr('class', 'results-cell').append('a').text(Math.round(indexTotals[3] * 10) / 10);

    ///////////////////////////////////////////////////
    // Other Metrics //////////////////////////////////
    ///////////////////////////////////////////////////
    var otherMetrics = d3.select("#results-container")
        .append("table")
        .attr("class", "results-table");

    // Strategic Wetland Placement
    var strategicWetlandRow = otherMetrics.append("tr")
        .attr("class", "odd border-top");
    strategicWetlandRow.append("td").append("a").text("Strategic Wetland: out of " + global.strategicWetland[1].possible);
    strategicWetlandRow.append("td").attr("class", "results-cell");
    strategicWetlandRow.append("td").attr("class", "results-cell");
    strategicWetlandRow.append("td").attr("class", "results-cell");
    strategicWetlandRow.append("td").attr("class", "results-cell").append("a").text((global.data[1] !== 0 && global.strategicWetland[1]) ? global.strategicWetland[1].actual : 0);
    strategicWetlandRow.append("td").attr("class", "results-cell").append("a").text((global.data[2] !== 0 && global.strategicWetland[2]) ? global.strategicWetland[2].actual : 0);
    strategicWetlandRow.append("td").attr("class", "results-cell").append("a").text((global.data[3] !== 0 && global.strategicWetland[3]) ? global.strategicWetland[3].actual : 0);
    strategicWetlandRow.append("td").attr("class", "results-cell condensed");
    strategicWetlandRow.append("td").attr("class", "results-cell").append("a").text((global.data[1] !== 0 && global.strategicWetland[1]) ? global.strategicWetland[1].actual : 0);
    strategicWetlandRow.append("td").attr("class", "results-cell").append("a").text((global.data[2] !== 0 && global.strategicWetland[2]) ? global.strategicWetland[2].actual : 0);
    strategicWetlandRow.append("td").attr("class", "results-cell").append("a").text((global.data[3] !== 0 && global.strategicWetland[3]) ? global.strategicWetland[3].actual : 0);
    strategicWetlandRow.append("td").attr("class", "results-cell condensed");

    // Precipitation
    var precipitationRow = otherMetrics.append("tr")
        .attr("class", "even border-bottom");

    precipitationRow.append("td").append("a").text("Precipitation");
    precipitationRow.append("td").attr("class", "results-cell");
    precipitationRow.append("td").attr("class", "results-cell");
    precipitationRow.append("td").attr("class", "results-cell");
    precipitationRow.append("td").attr("class", "results-cell").append("a").text(global.data.precipitation[1]);
    precipitationRow.append("td").attr("class", "results-cell").append("a").text(global.data.precipitation[2]);
    precipitationRow.append("td").attr("class", "results-cell").append("a").text(global.data.precipitation[3]);
    precipitationRow.append("td").attr("class", "results-cell condensed").text('in');
    precipitationRow.append("td").attr("class", "results-cell").append("a").text(Math.round(global.data.precipitation[1] * 2.54 * 10) / 10);
    precipitationRow.append("td").attr("class", "results-cell").append("a").text(Math.round(global.data.precipitation[2] * 2.54 * 10) / 10);
    precipitationRow.append("td").attr("class", "results-cell").append("a").text(Math.round(global.data.precipitation[3] * 2.54 * 10) / 10);
    precipitationRow.append("td").attr("class", "results-cell condensed").text('cm');

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
        .attr("class", "display-options-dropdown-button");
//        .append("a").text("Display Options")
//        .attr("class", "display-options-dropdown");

    measure = indicatorTable.append("tr")
        .attr("class", "results-table-header-row");
    measure.append("th")
        .attr("class", "results-table-header-row-cell");
    headerMeasureCellFactory(measure, {1: "Year 1", 2: "Year 2", 3: "Year 3"});

    titles = indicatorTable.append("tr")
        .attr("class", "results-table-header-row border-bottom");
    headerTitleCellFactory(titles, {1: "Ecosystem Services Indicator", 2: "", 3: "", 4: "", 5: "", 6: "", 7: "", 8: "", 9: "", 10: ""});

    // Body
    var nitrateRow = indicatorTable.append("tr")
        .attr("class", "odd");

    nitrateRow.append("td").append("a").text("Subwatershed Nitrate-N Percent Contribution");
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
        .attr("class", "odd border-bottom");

    riskRow.append("td").append("a").text("Phosphorus Index Risk Assessment");
    riskRow.append("td").attr("colspan", 3).append("div").attr("id", "risk-assessment-output-map-1");
    riskRow.append("td").attr("colspan", 3).append("div").attr("id", "risk-assessment-output-map-2");
    riskRow.append("td").attr("colspan", 3).append("div").attr("id", "risk-assessment-output-map-3");

    global.scoreDirector = new ScoreDirector();
    global.scoreDirector.calculateOutputMapValues();

    var opts = {
        scale: 3
    };
    global.outputmap = new OutputMap(opts);
    global.outputmap.draw(3, false, false);

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
