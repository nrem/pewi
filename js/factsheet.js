/**
 * Created by rlfrahm on 11/25/13.
 */
function drawFactSheet() {
    var landcover = d3.select("#percent-landcover")
        .append("div")
        .attr("width", "400px");

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