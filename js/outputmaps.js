/**
 * Created by rlfrahm on 11/26/13.
 */
var OutputMap = function() {
    var rowdata = global.data[global.year].row.data,
        coldata = global.data[global.year].column.data,
        subwatershed = global.data[global.year].subwatershed.data,
        wp = global.watershedPercent,
        SCALE = 3,
        basedata = global.data[global.year].baselandcover.data,
        LEN = basedata.length;

    var nitrates = d3.select("#nitrate-output-map")
        .append("svg")
        .attr("id", "nitrate-svg")
        .attr("width", 350)
        .attr("height", 300);

    var colors = {
        nitrates: ["#ffffd4","fed98e","fe9929","#d95f0e","#993404"]
    };

    function DrawNitrateCell(i) {
        nitrates.append("rect")
            .attr("x", function(){return coldata[i] * 3 * SCALE;})
            .attr("y", function(){return rowdata[i] * 2 * SCALE;})
            .attr("width", 3 * SCALE)
            .attr("height", 2 * SCALE)
            .style("fill", function() {return retColor(i);})
            .attr("id", function() {return wp[subwatershed[i]];})
            .attr("class", "output-map-rect");

        function retColor(i) {
            if(basedata[i] === 0) return "#999";
            if(wp[subwatershed[i]] != undefined) {
                if(wp[subwatershed[i]]>=0 && wp[subwatershed[i]]<=0.05) return colors.nitrates[0];
                else if(wp[subwatershed[i]]>0.05 && wp[subwatershed[i]]<=0.1) return colors.nitrates[1];
                else if(wp[subwatershed[i]]>0.1 && wp[subwatershed[i]]<=0.2) return colors.nitrates[2];
                else if(wp[subwatershed[i]]>0.2 && wp[subwatershed[i]]<=0.25) return colors.nitrates[3];
                else if(wp[subwatershed[i]]>0.25) return colors.nitrates[4];
            }
        }
    }

    function DrawNitrateKey() {
        var key = {
            0: {
                x: 250,
                y: 100,
                text: "0 - 5%"
            },
            1: {
                x: 250,
                y: 125,
                text: "5 - 10%"
            },
            2: {
                x: 250,
                y: 150,
                text: "10 - 20%"
            },
            3: {
                x: 250,
                y: 175,
                text: "20 - 15%"
            },
            4: {
                x: 250,
                y: 200,
                text: "> 25%"
            }
        };
        for(var i=0; i<colors.nitrates.length; i++) {
            nitrates.append("rect")
                .attr("x", function(){return key[i].x;})
                .attr("y", function(){return key[i].y;})
                .attr("width", 10)
                .attr("height", 10)
                .style("fill", function(){return colors.nitrates[i];});
            nitrates.append("text")
                .attr("x", function(){return key[i].x + 15;})
                .attr("y", function(){return key[i].y + 10;})
                .attr("text-anchor", "start")
                .text(function(){return key[i].text;});
        }
    }

    function init() {
        console.log(LEN);
        for(var i=0; i<LEN; i++) {
            if(basedata[i] != undefined) {
                DrawNitrateCell(i);
            }
        }
        DrawNitrateKey();
    }
    init();

    $("#nitrate-svg rect").hover(function()
        {
            var i = $("#nitrate-svg rect").index(this);
            var value = parseFloat($("#nitrate-svg rect").eq(i).attr("id"));
            var v = value.toFixed(3);
            if(v != undefined && !isNaN(v)) {
                $("#watershed-percent-stat a").text(v + "%");
            }

        },
    function(){

    });

    this.dealloc = function() {
        nitrates.remove();
    }
}