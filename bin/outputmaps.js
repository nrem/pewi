/**
 * Created by rlfrahm on 11/26/13.
 */
var OutputMap = function (options) {
    var rowdata = global.data[global.year].row.data,
        coldata = global.data[global.year].column.data,
        subwatershed = global.data[global.year].subwatershed.data,
        SCALE = (options.scale !== undefined) ? options.scale : 1,
        cellWidth = SCALE * 3,
        cellHeight = SCALE * 2,
        basedata = global.data[global.year].baselandcover.data,
        LEN = basedata.length,
        svgWidth = (options.width !== undefined) ? options.width : 25 * cellWidth,
        svgHeight = (options.height !== undefined) ? options.height : 250,
        nitrates,
        erosion,
        riskAssessment;

    var colors = {
        nitrates: ["#fed98e", "#f4b350", "#fe9929", "#d95f0e", "#993404"],
        erosion: ["#fed98e", "#f4b350", "#fe9929", "#d95f0e", "#993404"],
        risk: ["#fed98e", "#f4b350", "#fe9929", "#d95f0e", "#993404"]
    };

    function drawNitrateCell(i, year, interactive) {
        if(global.watershedPercent[year].length == 0) return;
        var wp = global.watershedPercent[year];
        var r =nitrates.append("rect")
            .attr("x", function () {
                return coldata[i] * cellWidth;
            })
            .attr("y", function () {
                return rowdata[i] * cellHeight;
            })
            .attr("width", cellWidth)
            .attr("height", cellHeight)
            .style("fill", function () {
                return retColor(i);
            })
            .attr("id", function () {
                return wp[subwatershed[i]];
            })
            .attr("class", "output-map-rect")
            .style("stroke-width", 0.01)
            .style("stroke", "#000")
            .attr('year', year);

        if(interactive) {
            r.on('mouseover', function() {
                d3.selectAll('#nitrate-rect-text').remove();

                var $this = d3.select(this),
                    x = parseInt($this.attr('x')),
                    y = parseInt($this.attr('y')),
                    id = parseFloat($this.attr('id'));
                d3.select('#nitrate-svg-' + d3.select(this).attr('year')).append('text')
                    .text(Math.round(id * 1000) / 1000)
                    .attr('x', x + cellWidth + 5)
                    .attr('y', y + 18)
                    .style('font-size', 15)
                    .style('fill', 'white')
                    .style('font-family', 'arial')
                    .style('text-shadow', '0 0 5px #000')
                    .attr('text-anchor', 'start')
                    .attr('id', 'nitrate-rect-text');
            }).on('mouseleave', function() {
                d3.selectAll('#nitrate-rect-text').remove();
            });
        }


        function retColor(i) {
            if (basedata[i] === 0) return "#999";
            if (wp[subwatershed[i]] != undefined) {
                if (wp[subwatershed[i]] >= 0 && wp[subwatershed[i]] <= 0.05) return colors.nitrates[0];
                else if (wp[subwatershed[i]] > 0.05 && wp[subwatershed[i]] <= 0.1) return colors.nitrates[1];
                else if (wp[subwatershed[i]] > 0.1 && wp[subwatershed[i]] <= 0.2) return colors.nitrates[2];
                else if (wp[subwatershed[i]] > 0.2 && wp[subwatershed[i]] <= 0.25) return colors.nitrates[3];
                else if (wp[subwatershed[i]] > 0.25) return colors.nitrates[4];
            }
        }
    }

    function drawErosionCell(i, year, interactive) {
        if(global.grossErosionSeverity[year].length == 0) return;
        var grossErosionData = global.grossErosionSeverity[year];
        var r = erosion.append("rect")
            .attr("x", function () {
                return coldata[i] * cellWidth;
            })
            .attr("y", function () {
                return rowdata[i] * cellHeight;
            })
            .attr("width", cellWidth)
            .attr("height", cellHeight)
            .style("fill", function () {
                return retColor(i);
            })
            .attr("id", function () {
                return grossErosionData[i];
            })
            .attr("class", "output-map-rect")
            .style("stroke-width", 0.01)
            .style("stroke", "#000")
            .attr('year', year);

        if(interactive) {
            r.on('mouseover', function() {
                d3.selectAll('#erosion-rect-text').remove();

                var $this = d3.select(this),
                    x = parseInt($this.attr('x')),
                    y = parseInt($this.attr('y')),
                    id = parseFloat($this.attr('id'));
                d3.select('#erosion-svg-' + d3.select(this).attr('year')).append('text')
                    .text(Math.round(id * 1000) / 1000)
                    .attr('x', x + cellWidth + 5)
                    .attr('y', y + 18)
                    .style('font-size', 15)
                    .style('fill', 'white')
                    .style('font-family', 'arial')
                    .style('text-shadow', '0 0 5px #000')
                    .attr('text-anchor', 'start')
                    .attr('id', 'erosion-rect-text');
            }).on('mouseleave', function() {
                d3.selectAll('#erosion-rect-text').remove();
            });
        }


        function retColor(i) {
            return colors.erosion[grossErosionData[i] - 1];
        }
    }

    function drawRiskAssessmentCell(i, year, interactive) {
        if(global.riskAssessment[year].length == 0) return;
        var riskAssessmentData = global.riskAssessment[year];
        var r = riskAssessment.append("rect")
            .attr("x", function () {
                return coldata[i] * cellWidth;
            })
            .attr("y", function () {
                return rowdata[i] * cellHeight;
            })
            .attr("width", cellWidth)
            .attr("height", cellHeight)
            .style("fill", function () {
                return retColor(i);
            })
            .attr("id", function () {
                return riskAssessmentData[i];
            })
            .attr("class", "output-map-rect")
            .style("stroke-width", 0.01)
            .style("stroke", "#000")
            .attr('year', year);

        if(interactive) {
            r.on('mouseover', function() {
                d3.selectAll('#risk-assessment-rect-text').remove();

                var $this = d3.select(this),
                    x = parseInt($this.attr('x')),
                    y = parseInt($this.attr('y')),
                    id = $this.attr('id');
                d3.select('#risk-assessment-svg-' + d3.select(this).attr('year')).append('text')
                    .text(id)
                    .attr('x', x + cellWidth + 5)
                    .attr('y', y + 18)
                    .style('font-size', 15)
                    .style('fill', 'white')
                    .style('font-family', 'arial')
                    .style('text-shadow', '0 0 5px #000')
                    .attr('text-anchor', 'start')
                    .attr('id', 'risk-assessment-rect-text');
            }).on('mouseleave', function() {
                d3.selectAll('#risk-assessment-rect-text').remove();
            });
        }


        function retColor(i) {
            if (riskAssessmentData[i] === "Very Low") return colors.risk[0];
            else if (riskAssessmentData[i] === "Low") return colors.risk[1];
            else if (riskAssessmentData[i] === "Medium") return colors.risk[2];
            else if (riskAssessmentData[i] === "High") return colors.risk[3];
            else if (riskAssessmentData[i] === "Very High") return colors.risk[4];
        }
    }

    function drawKeys(year) {
        var offsetx = 1;
        var key = {
            nitrates: {
                0: {
                    x: cellWidth * offsetx,
                    y: cellHeight * 36 * 0.9,
                    text: "0 - 5%"
                },
                1: {
                    x: cellWidth * offsetx,
                    y: cellHeight * 36 * 0.95,
                    text: "5 - 10%"
                },
                2: {
                    x: cellWidth * offsetx,
                    y: cellHeight * 36 * 1,
                    text: "10 - 20%"
                },
                3: {
                    x: cellWidth * offsetx,
                    y: cellHeight * 36 * 1.05,
                    text: "20 - 15%"
                },
                4: {
                    x: cellWidth * offsetx,
                    y: cellHeight * 36 * 1.1,
                    text: "> 25%"
                }
            },
            erosion: {
                0: {
                    x: cellWidth * offsetx,
                    y: cellHeight * 36 * 0.9,
                    text: "< 0.5"
                },
                1: {
                    x: cellWidth * offsetx,
                    y: cellHeight * 36 * 0.95,
                    text: "0.5 - 2"
                },
                2: {
                    x: cellWidth * offsetx,
                    y: cellHeight * 36,
                    text: "2 - 3.5"
                },
                3: {
                    x: cellWidth * offsetx,
                    y: cellHeight * 36 * 1.05,
                    text: "3.5 - 5"
                },
                4: {
                    x: cellWidth * offsetx,
                    y: cellHeight * 36 * 1.1,
                    text: "> 5"
                }
            },
            risk: {
                0: {
                    x: cellWidth * offsetx,
                    y: cellHeight * 36 * 0.9,
                    text: "Very Low"
                },
                1: {
                    x: cellWidth * offsetx,
                    y: cellHeight * 36 * 0.95,
                    text: "Low"
                },
                2: {
                    x: cellWidth * offsetx,
                    y: cellHeight * 36,
                    text: "Medium"
                },
                3: {
                    x: cellWidth * offsetx,
                    y: cellHeight * 36 * 1.05,
                    text: "High"
                },
                4: {
                    x: cellWidth * offsetx,
                    y: cellHeight * 36 * 1.1,
                    text: "Very High"
                }
            }
        };
        for (var i = 0; i < colors.nitrates.length; i++) {
            nitrates.append("rect")
                .attr("x", function () {
                    return key.nitrates[i].x;
                })
                .attr("y", function () {
                    return key.nitrates[i].y;
                })
                .attr("width", 10)
                .attr("height", 10)
                .style("fill", function () {
                    return colors.nitrates[i];
                });
            nitrates.append("text")
                .attr("x", function () {
                    return key.nitrates[i].x + 15;
                })
                .attr("y", function () {
                    return key.nitrates[i].y + 10;
                })
                .attr("text-anchor", "start")
                .style("font-size", "10")
                .text(function () {
                    return key.nitrates[i].text;
                });

            erosion.append("rect")
                .attr("x", function () {
                    return key.erosion[i].x;
                })
                .attr("y", function () {
                    return key.erosion[i].y;
                })
                .attr("width", 10)
                .attr("height", 10)
                .style("fill", function () {
                    return colors.erosion[i];
                });
            erosion.append("text")
                .attr("x", function () {
                    return key.erosion[i].x + 15;
                })
                .attr("y", function () {
                    return key.erosion[i].y + 10;
                })
                .attr("text-anchor", "start")
                .style("font-size", "10")
                .text(function () {
                    return key.erosion[i].text;
                });

            riskAssessment.append("rect")
                .attr("x", function () {
                    return key.risk[i].x;
                })
                .attr("y", function () {
                    return key.risk[i].y;
                })
                .attr("width", 10)
                .attr("height", 10)
                .style("fill", function () {
                    return colors.risk[i];
                });
            riskAssessment.append("text")
                .attr("x", function () {
                    return key.risk[i].x + 15;
                })
                .attr("y", function () {
                    return key.risk[i].y + 10;
                })
                .attr("text-anchor", "start")
                .style("font-size", "10")
                .text(function () {
                    return key.risk[i].text;
                });
        }
    }

    this.draw = function (years, label, interactive) {
        for(var year = 1; year<=years; year++) {


            if(interactive) {
                d3.select('#popup-container-body')
                    .append('div')
                    .attr('class', 'year-button')
                    .attr('year', year)
                    .on('mouseover', function() {
                        var year = d3.select(this).attr('year');

                        if(year == '1') {
                            d3.select('#nitrate-svg-1').style('display', 'block');
                            d3.select('#nitrate-svg-2').style('display', 'none');
                            d3.select('#nitrate-svg-3').style('display', 'none');
                            d3.select('#erosion-svg-1').style('display', 'block');
                            d3.select('#erosion-svg-2').style('display', 'none');
                            d3.select('#erosion-svg-3').style('display', 'none');
                            d3.select('#risk-assessment-svg-1').style('display', 'block');
                            d3.select('#risk-assessment-svg-2').style('display', 'none');
                            d3.select('#risk-assessment-svg-3').style('display', 'none');
                        } else if(year == '2') {
                            d3.select('#nitrate-svg-1').style('display', 'none');
                            d3.select('#nitrate-svg-2').style('display', 'block');
                            d3.select('#nitrate-svg-3').style('display', 'none');
                            d3.select('#erosion-svg-1').style('display', 'none');
                            d3.select('#erosion-svg-2').style('display', 'block');
                            d3.select('#erosion-svg-3').style('display', 'none');
                            d3.select('#risk-assessment-svg-1').style('display', 'none');
                            d3.select('#risk-assessment-svg-2').style('display', 'block');
                            d3.select('#risk-assessment-svg-3').style('display', 'none');
                        } else if(year == '3') {
                            d3.select('#nitrate-svg-1').style('display', 'none');
                            d3.select('#nitrate-svg-2').style('display', 'none');
                            d3.select('#nitrate-svg-3').style('display', 'block');
                            d3.select('#erosion-svg-1').style('display', 'none');
                            d3.select('#erosion-svg-2').style('display', 'none');
                            d3.select('#erosion-svg-3').style('display', 'block');
                            d3.select('#risk-assessment-svg-1').style('display', 'none');
                            d3.select('#risk-assessment-svg-2').style('display', 'none');
                            d3.select('#risk-assessment-svg-3').style('display', 'block');
                        }
                    })
                    .append('a')
                    .text('Year ' + year)
                    .style('cursor', 'default');

                nitrates = d3.select("#nitrate-output-map")
                    .append("svg")
                    .attr("id", "nitrate-svg-" + year)
                    .attr("width", svgWidth + 100)
                    .attr("height", svgHeight)
                    .style('display', 'none');

                erosion = d3.select("#erosion-output-map")
                    .append("svg")
                    .attr("id", "erosion-svg-" + year)
                    .attr("width", svgWidth)
                    .attr("height", svgHeight)
                    .style('display', 'none');

                riskAssessment = d3.select("#risk-assessment-output-map")
                    .append("svg")
                    .attr("id", "risk-assessment-svg-" + year)
                    .attr("width", svgWidth + 100)
                    .attr("height", svgHeight)
                    .style('display', 'none');

                d3.select('#nitrate-svg-1').style('display', 'block');
                d3.select('#erosion-svg-1').style('display', 'block');
                d3.select('#risk-assessment-svg-1').style('display', 'block');
            } else {
                nitrates = d3.select("#nitrate-output-map-" + year)
                    .append("svg")
                    .attr("id", "nitrate-svg")
                    .attr("width", svgWidth)
                    .attr("height", svgHeight);

                erosion = d3.select("#erosion-output-map-" + year)
                    .append("svg")
                    .attr("id", "erosion-svg")
                    .attr("width", svgWidth)
                    .attr("height", svgHeight);

                riskAssessment = d3.select("#risk-assessment-output-map-" + year)
                    .append("svg")
                    .attr("id", "risk-assessment-svg")
                    .attr("width", svgWidth)
                    .attr("height", svgHeight);
            }

            //console.log(year, nitrates);
            for (var i = 0; i < LEN; i++) {
                if (basedata[i] != undefined) {
                    if(nitrates[0][0] !== null) {
                        drawNitrateCell(i,year, interactive);
                    }
                    if(erosion[0][0] != undefined) {
                        drawErosionCell(i,year, interactive);
                    }
                    if(riskAssessment[0][0] != undefined) {
                        drawRiskAssessmentCell(i,year, interactive);
                    }
                }
            }
            if(global.data[year] == 0) continue;
            drawKeys(year);
            if(!label) continue;
            nitrates.append("text")
                .attr("x", function () {
                    return cellWidth;
                })
                .attr("y", function () {
                    return cellHeight * 36 * 0.85;
                })
                .attr("text-anchor", "start")
                .style("font-size", "15")
                .text(function () {
                    return "Year " + year;
                });

            erosion.append("text")
                .attr("x", function () {
                    return cellWidth;
                })
                .attr("y", function () {
                    return cellHeight * 36 * 0.85;
                })
                .attr("text-anchor", "start")
                .style("font-size", "15")
                .text(function () {
                    return "Year " + year;
                });

            riskAssessment.append("text")
                .attr("x", function () {
                    return cellWidth;
                })
                .attr("y", function () {
                    return cellHeight * 36 * 0.85;
                })
                .attr("text-anchor", "start")
                .style("font-size", "15")
                .text(function () {
                    return "Year " + year;
                });
        }
    }

    $("#nitrate-svg rect").hover(function () {
            var i = $("#nitrate-svg rect").index(this);
            var value = parseFloat($("#nitrate-svg rect").eq(i).attr("id"));
            var v = value.toFixed(3);
            if (v != undefined && !isNaN(v)) {
                $("#watershed-percent-stat a").text(v + "%");
            }

        },
        function () {

        });

    this.dealloc = function () {
        nitrates.remove();
        erosion.remove();
        riskAssessment.remove();
    }
}
var Maps = function () {
    var miniMapState = {
        topo: false,
        flood: false,
        sub: false,
        wetland: false,
        drainage: false
    }, miniMapSlots = [
        {
            vacant: true,
            left: 0,
            bottom: 20
        },
        {
            vacant: true,
            left: 0,
            bottom: 0
        },
        {
            vacant: true,
            left: 20,
            bottom: 0
        },
        {
            vacant: true,
            left: 40,
            bottom: 0
        },
        {
            vacant: true,
            left: 60,
            bottom: 0
        }
    ],
        watershed = this;
    this.watershed = function (options) {
        var svg = d3.select(options.parent)
                .append("svg")
                .attr("id", "watershed1")
                .attr("width", options.width + options.rectWidth)
                .attr("height", options.height + options.rectHeight),
            border = false;

        centerElement($(window), $("#watershed1"));

        var opts = {};
        var background = new Background();
        opts.parent = "#watershed1";
        opts.scale = '';
        opts.x = 0;
        opts.y = 0;
        opts.width = 100;
        opts.height = 100;
        opts.file = 'images/backgrounds/Animation_Watershed_Border-002.svg';
        opts.transform = '';
//        background.draw(opts);

        var filter = svg.append('svg:defs')
            .append('svg:filter')
            .attr('id', 'f1')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', '110%')
            .attr('height', '110%');

        filter.append('svg:feOffset')
            .attr('result', 'offOut')
            .attr('in', 'SourceAlpha')
            .attr('dx', 7)
            .attr('dy', 5);

        filter.append('svg:feGaussianBlur')
            .attr('result', 'blurOut')
            .attr('in', 'offOut')
            .attr('stdDeviation', 7);

        filter.append('svg:feBlend')
            .attr('in', 'SourceGraphic')
            .attr('in2', 'blurOut')
            .attr('mode', 'normal');

        var w = options.rectWidth, h = options.rectHeight;
        initCalcs();
        for (var i = 0; i < options.landcover.length; i++) {
            if (options.landcover[i] != undefined) {
				setWatershedArea(i);
                setStrategicWetland(i);
                setStreamNetworkArea(i);
                changeBaselandcoverDataPoint(options.landcover[i], i, true, options.year);
                //setLandCoverArea(options.landcover[i]);
                setSubwatershedArea(i, true);
                setSoiltypeFactors(i);
                setTopographyFactors(i);
                var rect;
                if (options.landcover[i] != 0) {
                    var g = svg.append("g");

                    g.append("svg:defs")
                        .append("svg:pattern")
                        .attr("id", "pattern" + i)
                        .attr("patternUnits", "userSpaceOnUse")
                        .attr("height", h)
                        .attr("width", w)
                        .attr("x", options.x[i] * w)
                        .attr("y", options.y[i] * h)
                        .append("svg:image")
                        .attr("id", "image" + i)
                        .attr("xlink:href", "images/cell_images_bitmaps/" + this.setIcon(options.landcover[i]))
                        .attr("width", w)
                        .attr("height", h);

                    rect = g.append("rect")
                        .attr("id", i)
                        .attr("class", "watershed-rect")
                        .attr("x", options.x[i] * w - options.rectWidth)
                        .attr("y", options.y[i] * h - options.rectHeight)
                        .attr("width", w)
                        .attr("height", h)
                        .style("fill", "url(#pattern" + i + ")")
                        .attr("landcover", function () {
                            return landcovers[options.landcover[i]];
                        })
                        .attr("row", Math.ceil((i + 1) / 23))
                        .attr("col", 1 + i % 23)
                        .attr('filter', 'url(#f1)');
                    //$("#" + i).attr("landcover", "blah");
                } else {
                    rect = g.append("rect")
                        .attr("id", i)
                        .attr("class", "watershed-rect")
                        .attr("x", options.x[i] * w - options.rectWidth)
                        .attr("y", options.y[i] * h - options.rectHeight)
                        .attr("width", w)
                        .attr("height", h)
                        .style("fill", colorsForLandCoverGrid[options.landcover[i]])
                        .attr("landcover", function () {
                            return landcovers[options.landcover[i]];
                        })
                        .attr("row", Math.ceil((i + 1) / 23))
                        .attr("col", 1 + i % 23)
                        .attr('filter', 'url(#f1)');
                    global.streamIndices[global.year].push(i);
                }
                var timeout;
                rect.on('mouseover', function() {
                    clearTimeout(timeout);
                    d3.selectAll('#watershed-rect-text').remove();

                    var $this = d3.select(this),
                        x = parseInt($this.attr('x')),
                        y = parseInt($this.attr('y')),
                        col = $this.attr('col'),
                        row = $this.attr('row');
                    timeout = setTimeout(function() {
                        svg.append('text')
                            .text(col + ', ' + row)
                            .attr('x', x + options.rectWidth + 5)
                            .attr('y', y + 18)
                            .style('font-size', 15)
                            .style('fill', 'white')
                            .style('font-family', 'arial')
                            .style('text-shadow', '0 0 5px #000')
                            .attr('text-anchor', 'start')
                            .attr('id', 'watershed-rect-text');
                    }, 750);
                }).on('mouseleave', function() {
                    clearTimeout(timeout);
                    d3.selectAll('#watershed-rect-text').remove();
                });
            }
        }
        opts.scale = options.scale;

        global.stream = new Stream();
        global.stream.draw(opts);

        $("#watershed1 #0").dblclick(function () {
			var undoData = [];
            options.singlelandcover = 1;
            for (var i = 0; i < options.landcover.length; i++) {
                if (options.landcover[i] != undefined && global.selectedPaint !== options.landcover[i]) {
					undoData.push({location: i, previous: options.landcover[i]});
					
                    changeBaselandcoverDataPoint(global.selectedPaint, i, false, global.year);

                    if (options.landcover[i] != 0) {
                        watershed.changeWatershedRectImage(i, global.selectedPaint);
                    }
                }
            }
			addDatasetChangesToUndoLog(undoData);
            // $(".watershed-rect").hover(
//                 function() {
//                     $("#hover-selection-hud a").text($(this).attr("landcover"));
//                 },
//                 function() {
//                     $("#hover-selection-hud a").text("");
//                 }
//             );
        });

        $('.watershed-rect').hover(
            function () {
                $("#hover-selection-hud a").text($(this).attr("landcover"));
            },
            function () {
                $("#hover-selection-hud a").text("");
            }
        );
    }

    function rebindWatershedHover() {
        var $rect = $('.watershed-rect');
        $rect.unbind('mouseenter mouseleave');
        $rect.hover(
            function () {
                $("#hover-selection-hud a").text($(this).attr("landcover"));
            },
            function () {
                $("#hover-selection-hud a").text("");
            }
        );
    }

    this.updateWatershed = function (options) {
        if (options.singlelandcover == undefined) {
			// watershedArea[options.year] = 0; 
            for (var i = 0; i < options.landcover.length; i++) {
                if (options.landcover[i] != undefined) {
                    changeBaselandcoverDataPoint(options.landcover[i], i, false, options.year);

                    if (options.landcover[i] != 0) {
                        this.changeWatershedRectImage(i, options.landcover[i]);
                    }
                }
            }
        } else if(options.singlelandcover) {
            if(options.landcover == undefined) return;
            if(options.location == undefined) return;
//            setStrategicWetland(options.location);
//            setStreamNetworkArea(options.location);
            changeBaselandcoverDataPoint(options.landcover, options.location, false, options.year);
//            setSoiltypeFactors(options.location);
//            setTopographyFactors(options.location);

            this.changeWatershedRectImage(options.location, options.landcover);
        }
    }

    this.switchYear = function (options) {
        console.log("switching year");
        for(var i=0; i<options.landcover.length; i++) {
            if (options.landcover[i] != 0) {
                this.changeWatershedRectImage(i, options.landcover[i]);
            }
        }
    }

    this.changeWatershedRectImage = function(location, landcover) {
        $("#image" + location).attr("href", "images/cell_images_bitmaps/" + getIcon(landcover));
        $("#watershed1 #" + location).attr("landcover", landcovers[landcover]);
    }

    function getIcon(landcover) {
        if (landcover > 5 && landcover < 9) {
            var r = Math.floor(Math.random() * 2);
            return picsForLandCoverGrid[landcover][r];
        } else {
            return picsForLandCoverGrid[landcover];
        }
    }

    this.setIcon = function (landcover) {
        return getIcon(landcover);
    }

    this.minimap = function (options) {
        if (miniMapState[options.id]) return;
        var rowData = global.data[global.year].row.data,
            columnData = global.data[global.year].column.data,
            SCALE = 3;
        if (options.width == undefined) {
            options.width = global.mapCellWidth;
        }
        if (options.height == undefined) {
            options.height = global.mapCellHeight;
        }

        var Maps = {
            TOPOGRAPHY: "topo",
            FLOOD_FREQUENCY: "flood",
            DRAINAGE_CLASS: "drainage",
            WETLAND: "wetland",
            SUBWATERSHED: "sub"
        };

        var keys = {
            TOPOGRAPHY: {
                label: "Slope Range",
                0: "0 - 1%",
                1: "1 - 2%",
                2: "2 - 5%",
                3: "5 - 9%",
                4: "9 - 14%",
                5: "14 - 18%",
                length: 6
            },
            DRAINAGE_CLASS: {
                label: "Drainage Class",
                0: "Excessive",
                1: "Very Poor",
                topColor: "",
                bottomColor: "",
                length: 2
            },
            FLOOD_FREQUENCY: {
                label: "Flood Frequency",
                0: "None",
                1: "Rare",
                2: "Occasionally",
                3: "Frequently",
                4: "Ponded",
                length: 5
            }
        }

        var keyTypes = {
            RECTS: "rects",
            HORN: "horn"
        }

        options.width *= SCALE;
        options.height *= SCALE;
        var container = d3.select("#workspace")
            .append("div")
            .attr("id", options.id + "-minimap-container")
            .attr("class", "physical-feature-map")
            .style("width", options.width * global.data[global.year].rows + "px")
            .style("height", options.height * 2 * global.data[global.year].columns + "px");
        for (var i = 0; i < miniMapSlots.length; i++) {
            if (miniMapSlots[i].vacant) {
                $("#" + options.id + "-minimap-container").css("marginLeft", miniMapSlots[i].left + "%").css("marginBottom", miniMapSlots[i].bottom + "%");
                miniMapSlots[i].vacant = false;
                options.slot = i;
                break;
            }
        }
        $("#" + options.id + "-minimap-container").draggable({stack: ".physical-feature-map", scroll: false});

        var title = container.append("div");
        title.append("img")
            .attr("class", "physical-feature-map-close-button")
            .attr("id", "topo")
            .style("width", "1.5em")
            .style("+filter", "grayscale(1%)")
            .attr("src", "images/icons/navigation/close_mini_light-gray.svg");
        title.append("a");

        $("#" + options.id + "-minimap-container img").bind(global.selectClickType, function () {
            $(this).parent().parent().remove();
            miniMapState[options.id] = false;
            miniMapSlots[options.slot].vacant = true;
        });

        var svg = container.append("svg")
            .attr("class", "minimap-svg")
            .attr("width", options.width * global.data[global.year].rows)
            .attr("height", options.height * 2 * global.data[global.year].columns);
        miniMapState[options.id] = true;
        switch (options.id) {
            case Maps.TOPOGRAPHY:
                $("#" + options.id + "-minimap-container div>a").text("Topographic Relief");
                var topography = global.data[global.year].topography.data,
                    colors = colorbrewer.YlGnBu[6];
//                console.log(colors, topography);
                for (var i = 0; i < topography.length; i++) {
                    if (topography[i] != undefined && !isNaN(topography[i])) {
                        appendRectHelper(topography[i], colors);
                    }
                }
                buildKey("TOPOGRAPHY", colors, keyTypes.RECTS);
                break;
            case Maps.FLOOD_FREQUENCY:
                $("#" + options.id + "-minimap-container div>a").text("Flood Frequency");
                var flood = global.data[global.year].floodfrequency.data,
                    colors = colorbrewer.YlGnBu[6];
                for (var i = 0; i < flood.length; i++) {
                    if (flood[i] != undefined && !isNaN(flood[i] / 10)) {
                        appendRectHelper(flood[i] / 10, colors);
                    }
                }
                buildKey("FLOOD_FREQUENCY", colors, keyTypes.RECTS);
                break;
            case Maps.SUBWATERSHED:
                $("#" + options.id + "-minimap-container div>a").text("Subwatershed Boundaries");
                var subwatershed = global.data[global.year].subwatershed.data,
                    colors = boundaryColors;
                for (var i = 0; i < subwatershed.length; i++) {
                    if (subwatershed[i] != undefined && !isNaN(subwatershed[i])) {
                        appendRectHelper(subwatershed[i], colors);
                    }
                }
                break;
            case Maps.WETLAND:
                $("#" + options.id + "-minimap-container div>a").text("Strategic Wetland Areas");
                var wetland = global.data[global.year].wetland.data,
                    colors = colorbrewer.PuBuGn[3];
                for (var i = 0; i < wetland.length; i++) {
                    if (wetland[i] != undefined && !isNaN(wetland[i])) {
                        appendRectHelper(wetland[i], colors);
                    }
                }
                break;
            case Maps.DRAINAGE_CLASS:
                $("#" + options.id + "-minimap-container div>a").text("Drainage Class");
                var drainage = global.data[global.year].drainageclass.data,
                    colors = colorbrewer.BrBG[8];
                for (var i = 0; i < drainage.length; i++) {
                    if (drainage[i] != undefined && !isNaN(drainage[i])) {
                        appendRectHelper(drainage[i] / 10, colors);
                    }
                }
                buildKey("DRAINAGE_CLASS", ["#8c510a", "#01665e"], keyTypes.HORN);
                break;
        }

        function appendRectHelper(datapoint, colors) {
            if (isNaN(columnData[i]) || isNaN(rowData[i])) return;
            var rect = svg.append("rect")
                .attr("x", function () {
                    return columnData[i] * options.width + 100;
                })
                .attr("y", function () {
                    return rowData[i] * options.height;
                })
                .attr("width", options.width)
                .attr("height", options.height)
                .style("fill", function () {
                    return colors[datapoint];
                })
                .attr("id", options.id + "-rect-" + i)
                .attr("class", "minimap-rect")
                .attr("row", Math.ceil((i + 1) / 23))
                .attr("col", 1 + i % 23);

            rect.on('mouseover', function() {
                d3.selectAll('#pfeature-rect-text').remove();

                var $this = d3.select(this),
                    x = parseInt($this.attr('x')),
                    y = parseInt($this.attr('y')),
                    col = $this.attr('col'),
                    row = $this.attr('row');
                svg.append('text')
                    .text(col + ', ' + row)
                    .attr('x', x + options.width + 5)
                    .attr('y', y + 18)
                    .style('font-size', 15)
                    .style('fill', 'white')
                    .style('font-family', 'arial')
                    .style('text-shadow', '0 0 5px #000')
                    .attr('text-anchor', 'start')
                    .attr('id', 'pfeature-rect-text');
            }).on('mouseleave', function() {
                d3.selectAll('#pfeature-rect-text').remove();
            });
        }

        function buildKey(id, colors, type) {
            var w = options.width * 2,
                h = options.height * 2,
                ystart = parseFloat(svg.attr("height")) - (keys[id].length * 15 * 1.25);

            var keyGroup = svg.append("g");
            if (type == "rects") {
                for (var i = 0; i < keys[id].length; i++) {
                    keyGroup.append("rect")
                        .attr("x", 10)
                        .attr("y", ystart + (i * 15))
                        .attr("width", w)
                        .attr("height", h)
                        .style("fill", colors[i])
                        .attr("id", id + "-" + "key-" + i)
                        .attr("class", "pfeature-key-rect");

                    keyGroup.append("text")
                        .attr("x", (10 + w) * 1.25)
                        .attr("y", ystart + (i * 14 + h))
                        .text(keys[id][i])
                        .style("fill", "#fff")
                        .style("font-size", "0.5em");

                }
            } else if (type == "horn") {
                //var path = "M6 0L12 5L8 5L8 50L12 50L6 55L0 50L4 50L4 5L0 5z";
                var path = "M0,0L15,0C15,0 0,40 15,80L0,80C0,80 15,40 0,0z";

                var gradient = keyGroup.append("svg:defs")
                    .append("svg:linearGradient")
                    .attr("id", "pfeature-key-color-gradient")
                    .attr("x1", "0%")
                    .attr("y1", "0%")
                    .attr("x2", "0%")
                    .attr("y2", "100%");

                gradient.append("svg:stop")
                    .attr("offset", "0%")
                    .style("stop-color", colors[0])
                    .style("stop-opacity", "1");

                gradient.append("svg:stop")
                    .attr("offset", "100%")
                    .style("stop-color", colors[1])
                    .style("stop-opacity", "1");

                keyGroup.append("svg:path")
                    .attr("d", function () {
                        return path;
                    })
                    .style("fill", "url(#pfeature-key-color-gradient)");

                keyGroup.append("text")
                    .attr("x", 20)
                    .attr("y", 7)
                    .text("Excessive")
                    .style("fill", "#fff")
                    .style("font-size", "0.5em");

                keyGroup.append("text")
                    .attr("x", 20)
                    .attr("y", 80)
                    .text("Very Poor")
                    .style("fill", "#fff")
                    .style("font-size", "0.5em");

                keyGroup.attr("transform", "translate(10, " + (ystart - (90)) + ") scale(1.25)");
            }
        }
    }
}