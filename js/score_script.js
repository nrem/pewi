var dataset = [
    {    Metric: 'Corn Yield', Year1: 0, Year2: 0, Year3: 0},
    {    Metric: 'Soybean Yield', Year1: 0, Year2: 0, Year3: 0},
    {    Metric: 'Alfalfa Yield', Year1: 0, Year2: 0, Year3: 0},
    {    Metric: 'Hay Yield', Year1: 0, Year2: 0, Year3: 0},
    {    Metric: 'Timber Production', Year1: 0, Year2: 0, Year3: 0},
    {    Metric: 'Cattle', Year1: 0, Year2: 0, Year3: 0},
    {    Metric: 'Mixed Fruit & Vegetable Yield', Year1: 0, Year2: 0, Year3: 0},
    {    Metric: 'Nitrate Pollution Control / In-stream Concentration', Year1: 0, Year2: 0, Year3: 0},
    {    Metric: 'Phosphorus Pollution Control / In-stream Loading', Year1: 0, Year2: 0, Year3: 0},//check
    {    Metric: 'Carbon Sequestration', Year1: 0, Year2: 0, Year3: 0},
    {    Metric: 'Game Wildlife', Year1: 0, Year2: 0, Year3: 0},
    {    Metric: 'Biodiversity', Year1: 0, Year2: 0, Year3: 0},
    {    Metric: 'Sediment Delivered / In-stream Delivery', Year1: 0, Year2: 0, Year3: 0},//check
    {    Metric: 'Erosion Control / Gross Erosion', Year1: 0, Year2: 0, Year3: 0},//check
    {    Metric: 'Herbaceous Perennial Bioenergy Yield', Year1: 0, Year2: 0, Year3: 0},//check
    {    Metric: 'Short-rotation Woody Bioenergy Yield', Year1: 0, Year2: 0, Year3: 0}//check
];
var Plot = function () {
    //setup plot
    var w = 960,
        h = 650;

    var plot;

    var col = d3.scale.category20();

    /*var objs = [{disp: "Year 1", val: "Year1"},
     {disp: "Year 2", val: "Year2"},
     {disp: "Year 3", val: "Year3"},
     {disp: "Year 4", val: "Year4"},
     {disp: "Year 5", val: "Year5"}
     ];*/

    var objs = ["Year 1", "Year 2", "Year 3"];
    this.years = objs.length;

    // Scales the vertical separation lines
    var x = d3.scale.linear()
        .domain([0, 1])
        .range([0, 200]);

    // Scales the spacing between years
    var xdata = d3.scale.ordinal()
        .domain(objs)
        .rangeBands([0, 300]);

    var y = d3.scale.linear()
        .domain([100, 0])
        .range([0, h * .7]);

    this.update = function () {
        plot = d3.select("#bubble.plot")
            .append("svg")
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("id", "output-score-svg")
            .attr("class", "removable-displays")
            .append("g")
            .attr("transform", "translate(100,30)");

        plot.selectAll("text.ia").remove();
        plot.selectAll("rect.ia").remove();

        var node = plot
            .selectAll("circle")
            .data(dataset)
            .enter();

        var coords = {
            0: -80,
            1: -40,
            2: 60,
            3: 160
        };

        var arrowpath = "M-65 0L-80 20L-70 20L-70 430L-80 430L-65 450L-50 430L-60 430L-60 20L-50 20L-65 0z";
        var gradient = plot.append("svg:defs")
            .append("svg:linearGradient")
            .attr("id", "arrow-indicator-grad")
            .attr("x1", "0%")
            .attr("y1", "0%")
            .attr("x2", "0%")
            .attr("y2", "100%");

        gradient.append("svg:stop")
            .attr("offset", "0%")
            .style("stop-color", "#2171b5")
            .style("stop-opacity", "90");
        gradient.append("svg:stop")
            .attr("offset", "100%")
            .style("stop-color", "#cc4c02")
            .style("stop-opacity", "90");

        plot.append("svg:path")
            .attr("d", function () {
                return arrowpath;
            })
            .style("fill", "url(#arrow-indicator-grad)")
            .style("opacity", "0.8");

        for (var i = 1; i < 4; i++) {
            plot.append("rect")
                .attr("x", function () {
                    return coords[i];
                })
                .attr("y", 0)
                .attr("width", 100)
                .attr("height", 450)
                .style("fill", function () {
                    return getPrecipFill(i);
                });

            plot.append("text")
                .attr("x", function () {
                    return coords[i] + 50;
                })
                .attr("y", 100)
                .attr("text-anchor", "middle")
                .style("fill", "#888")
                .text(getPrecipitationValuation(global.precipitation[i]));
        }

        plot.selectAll("line")
            .data(x.ticks(this.years))
            .enter().append("line")
            .attr("x1", function (d) {
                return x(d) - 40;
            })
            .attr("x2", function (d) {
                return x(d) - 40;
            })
            .attr("y1", 0)
            .attr("y2", "70%")
            .style("stroke", "#ccc");


        node.append("text")
            .attr("class", function (d) {
                return "ia " + " metric-label " + d.Metric.replace(/ /g, '').replace(/\//g, '').replace(/&/g, '');
            })
            .style("fill", "black")
            .style("opacity", "0.3")
            .attr("x", "475")
            .attr("y", function (d, i) {
                return i * 27 + 50
            })
            .attr("text-anchor", "middle")
            .text(function (d) {
                return d.Metric
            });

        var legendrectvals = [];
        dataset.forEach(function (d, i) {
            //legendrectvals.push(d["Year1"]);
            var numerator = 0,
                denominator = 1,
                value;
            numerator = d.Year1 + d.Year2 + d.Year3;
            denominator += (global.data[2] !== 0) ? 1 : 0;
            denominator += (global.data[3] !== 0) ? 1 : 0;
            value = numerator / denominator;
            if(value > 100) value = 100;
            else if(value < 0) value = 0;
            if (denominator != 0) {
                legendrectvals.push(value);
            }
            else {
                legendrectvals.push(0)
            }
        }); // NEEDS FIXED
        node.append("rect")
            .attr("fill", "gray")
            .attr("x", "700")
            .attr("y", function (d, i) {
                return i * 27 + 40
            })
            .attr("width", function (d, i) {
                var width = legendrectvals[i] / 100 * 50;
                return width;
            })
            .attr("class", "ia")
            .attr("height", 12);

        node.append("rect")
            .attr("fill", "gray")
            .attr("x", function (d, i) {
                return 700 + legendrectvals[i] / 100 * 50;
            })
            .attr("y", function (d, i) {
                return i * 27 + 40
            })
            .attr("width", function (d, i) {
                return 50 * (1 - legendrectvals[i] / 100)
            })
            .attr("height", 12);

        /*  node.append("text")
         .attr("class", function(d) {return "ia label "+d.country + " " + objs[Math.year(d.blog*100)%4]})
         .attr("x", function(d) {return xdata(objs[Math.year(d.blog*100)%4])+25})
         .attr("y", function(d){return y(d[objs[Math.year(d.blog*100)%4]]+25);})
         .text(function(d) {return d.country})
         .style("opacity", 0)
         .style("font-size", 14)
         .style("fill", "black");
         */

        var temp;
        objs.forEach(function (obj, i) {
            node
                .append("circle")
                .style("fill", "gray")
                .attr("cx", function (d) {
                    return xdata(obj) + 10;
                })
                .attr("cy", function (d) {
                    temp = valueChangeFactory(d[obj.replace(/ /g, '')]);
                    return y(temp);
                })
                .attr("r", function (d) {
                })
                .style("opacity", 0.3)
                .attr("id", function (d) {
                    return obj
                })
                .attr("class", function (d) {
                    return "ia " + d.Metric.replace(/ /g, '').replace(/\//g, '').replace(/&/g, '') + " " + temp;
                })
                .attr("title", function (d) {
                    return d.Metric;
                })
                .attr("value", function (d) {
                    if (d["Year" + (i + 1)] > 0) {
                        return valueChangeFactory(d[obj.replace(/ /g, '')]).toFixed(2);
                    } else {
                        return 0;
                    }
                });
        });

        function valueChangeFactory(value) {
            console.assert((value > 0 || value < 100), "Value: " + value + " is out of bounds.");
            value = (value < 0 || value > 100) ? ((value < 0) ? 0 : 100) : value;
            return value;
        }

        plot.selectAll("text.rule3")
            .data(objs)
            .enter().append("text")
            .attr("class", "rule3")
            .attr("fill", "Black")
            .attr("x", function (d) {
                return xdata(d) + 10;
            })
            .attr("y", "75%")
            .attr("text-anchor", "middle")
            .text(function (d) {
                return d;
            });

        plot.selectAll(".rule3")
            .on("click", function (d) {
                legendrectvals = [];
                dataset.forEach(function (e) {
                    legendrectvals.push(e[d.replace(/ /g, '')]);
                });
                updateLegend();
                updateMetrics(MetricStack);
            });

        var MetricStack = ["CornYield", "Nitrates", "WildlifeBiodiversity"];

        updateMetrics(MetricStack);

        plot.selectAll(".ia")
            .on("click", function (d) {
                if (!MetricStack.some(function (e, i) {
                    return d.Metric.replace(/ \//g, '').replace(/ &/g, '') == e;
                })) {
                    MetricStack.push(d.Metric.replace(/ \//g, '').replace(/ &/g, ''));
                } else {
                    MetricStack = MetricStack.filter(function (e, i) {
                        return d.Metric.replace(/ \//g, '').replace(/ &/g, '') != e;
                    });
                }
                updateMetrics(MetricStack);
            });
        var origopacity;
        $(".ia").hover(
            function (d) {
                if (d.currentTarget.nodeName == "circle") {
                    var $selector = $("." + d.currentTarget.classList[1]);
                } else if (d.currentTarget.nodeName == "text") {
                    var $selector = $("." + d.currentTarget.classList[2].replace(/\//g,''));
					
                }
                origopacity = $selector.css("opacity");
                $selector.css("opacity", "1");
				
            },
            function (d) {
                if (d.currentTarget.nodeName == "circle") {
                    var $selector = $("." + d.currentTarget.classList[1]);
                } else if (d.currentTarget.nodeName == "text") {
                    var $selector = $("." + d.currentTarget.classList[2]);
                }
                $selector.css("opacity", origopacity);
            }
        );

        $(document).tooltip({
            position: {my: "left top", at: "right+50 center"},
            show: {effect: "slideDown",
                duration: 150},
            content: function () {
                var element = $(this);
                if (element.is("circle")) {
                    return element.attr("title") + ": " + element.attr("value");
                }
            }
        }).css("z-index", "2000").css("text-align", "center").css("color", "#fff");

        yTicks(y, "r");

        //DrawHistogramFor(1);
    }

    var barWidth = 30;

    function DrawHistogramFor(year) {
        var histogram = plot.append("g");

        plot.append("line")
            .attr("x1", -40)
            .attr("x2", -40)
            .attr("y1", 600)
            .attr("y2", 500)
            .style("stroke", "#ccc");

        plot.append("line")
            .attr("x1", -40)
            .attr("x2", barWidth * 14)
            .attr("y1", 500)
            .attr("y2", 500)
            .style("stroke", "#ccc");

        dataset.forEach(function (d, i) {
            histogram.append("rect")
                .attr("y", "500")
                .attr("x", i * barWidth)
                .attr("width", barWidth)
                .attr("height", d["Year" + year])
                .style("fill", "#333");
        });
    }

    var updateMetrics = function (MetricStack) {
        plot.selectAll(".ia")
            .transition()
            .duration(1000)
            .style("opacity", 0.3)
            .style("fill", "gray")
            .attr("r", 8);
        /*
         plot.selectAll("text.label")
         .transition()
         .duration(1000)
         .style("opacity", 0);
         */

        MetricStack.forEach(function (metric, i) {
            var d = plot.selectAll("circle." + metric);
            plot.selectAll(".ia")
                .filter(function (e) {
                    return metric == e.Metric.replace(/ \//g, '')
                })
                .transition()
                .duration(1000)
                .style("opacity", 1)
                .style("fill", function () {
                    return col(i)
                })
                .attr("r", 20);
        });
    };

    var yTicks = function (y, format) {
        plot.selectAll(".rule2")
            .remove();
        var arr = y.ticks(objs.length);
        //thin out log scales

        if (arr.length > 8) {
            arr = arr.filter(function (d, i) {
                return i % 2
            });
        }
        ;
    }

    function getPrecipFill(year) {
        if (global.precipitation[year] < 30) {
            return "#fee0b6";
        } else if (global.precipitation[year] < 36.47) {
            return "#fff";
        } else {
            return "#d1e5f0";
        }
    }
}