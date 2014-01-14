/**
 * Created by rlfrahm on 11/26/13.
 */
var OutputMap = function () {
  var rowdata = global.data[global.year].row.data,
    coldata = global.data[global.year].column.data,
    subwatershed = global.data[global.year].subwatershed.data,
    wp = global.watershedPercent,
    SCALE = 3,
    cellWidth = SCALE * 3,
    cellHeight = SCALE * 2,
    basedata = global.data[global.year].baselandcover.data,
    LEN = basedata.length,
    grossErosionData = global.grossErosion,
    riskAssessmentData = global.riskAssessment,
    svgWidth = 350, svgHeight = 250;

  var nitrates = d3.select("#nitrate-output-map")
    .append("svg")
    .attr("id", "nitrate-svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

  var erosion = d3.select("#erosion-output-map")
    .append("svg")
    .attr("id", "erosion-svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

  var riskAssessment = d3.select("#risk-assessment-output-map")
    .append("svg")
    .attr("id", "risk-assessment-svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

  var colors = {
    nitrates: ["#ffffd4", "fed98e", "fe9929", "#d95f0e", "#993404"],
    erosion: ["#ffffd4", "fed98e", "fe9929", "#d95f0e", "#993404"],
    risk: ["#ffffd4", "fed98e", "fe9929", "#d95f0e", "#993404"]
  };

  function drawNitrateCell(i) {
    nitrates.append("rect")
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
      .attr("class", "output-map-rect");

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

  function drawErosionCell(i) {
    erosion.append("rect")
      .attr("x", function() {
        return coldata[i] * cellWidth;
      })
      .attr("y", function() {
        return rowdata[i] * cellHeight;
      })
      .attr("width", cellWidth)
      .attr("height", cellHeight)
      .style("fill", function() {
        return retColor(i);
      })
      .attr("id", function() {
        return grossErosionData[i];
      })
      .attr("class", "output-map-rect");

    function retColor(i) {
      return colors.erosion[grossErosionData[i] - 1];
    }
  }

  function drawRiskAssessmentCell(i) {
    riskAssessment.append("rect")
      .attr("x", function() {
        return coldata[i] * cellWidth;
      })
      .attr("y", function() {
        return rowdata[i] * cellHeight;
      })
      .attr("width", cellWidth)
      .attr("height", cellHeight)
      .style("fill", function() {
        return retColor(i);
      })
      .attr("id", function() {
        return riskAssessmentData[i];
      })
      .attr("class", "output-map-rect");

    function retColor(i) {
      if(riskAssessmentData[i] === "Very Low") return colors.risk[0];
      else if(riskAssessmentData[i] === "Low") return colors.risk[1];
      else if(riskAssessmentData[i] === "Medium") return colors.risk[2];
      else if(riskAssessmentData[i] === "High") return colors.risk[3];
      else if(riskAssessmentData[i] === "Very High") return colors.risk[4];
    }
  }

  function drawKeys() {
    var key = {
      nitrates: {
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
      },
      erosion: {
        0: {
          x: 250,
          y: 100,
          text: "< 0.001"
        },
        1: {
          x: 250,
          y: 125,
          text: "0.025 - 0.001"
        },
        2: {
          x: 250,
          y: 150,
          text: "0.1 - 0.025"
        },
        3: {
          x: 250,
          y: 175,
          text: "0.1 - 2"
        },
        4: {
          x: 250,
          y: 200,
          text: "> 2"
        }
      },
      risk: {
        0: {
          x: 250,
          y: 100,
          text: "Very Low"
        },
        1: {
          x: 250,
          y: 125,
          text: "Low"
        },
        2: {
          x: 250,
          y: 150,
          text: "Medium"
        },
        3: {
          x: 250,
          y: 175,
          text: "High"
        },
        4: {
          x: 250,
          y: 200,
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
        .text(function () {
          return key.risk[i].text;
        });
    }
  }

  this.draw = function() {

    for (var i = 0; i < LEN; i++) {
      if (basedata[i] != undefined) {
        drawNitrateCell(i);
        drawErosionCell(i);
        drawRiskAssessmentCell(i);
      }
    }
    drawKeys();
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
  }, miniMapSlots = [{
    vacant: true,
    left: 0,
    bottom:20
  },{
    vacant: true,
    left: 0,
    bottom:0
  },{
    vacant: true,
    left: 20,
    bottom: 0
  },{
    vacant: true,
    left: 40,
    bottom: 0
  },{
    vacant: true,
    left: 60,
    bottom: 0
  }];
  this.watershed = function (options) {
    var svg = d3.select(options.parent)
        .append("svg")
        .attr("id", "watershed1")
        .attr("width", options.width)
        .attr("height", options.height + 20),
      border = false;

    /*svg.append("svg:defs")
     .append("svg:pattern")
     .attr("id", "watershed-pattern")
     .attr("patternUnits", "userSpaceOnUse")
     .attr("height", options.width)
     .attr("width", options.height + 20)
     .attr("x", 0)
     .attr("y", 0)
     .append("svg:image")
     .attr("id", "watershed-image")
     .attr("xlink:href", "images/border/Animation_Watershed_Border.png")
     .attr("preserveAspectRatio", "defer")
     .attr("width", options.width + 100)
     .attr("height", options.height + 100);

     svg.append("rect")
     .attr("width", options.width)
     .attr("height", options.height)
     .style("fill", "url(#watershed-pattern)");//*/
    centerElement($(window), $("#watershed1"));

    var w = 30, h = 20;
    initCalcs();
    for (var i = 0; i < options.landcover.length; i++) {
      if (options.landcover[i] != undefined) {
        setStrategicWetland(i);
        setStreamNetworkArea(i);
        setLandCoverArea(options.landcover[i]);
        setSubwatershedArea(i);
        setSoiltypeFactors(i);
        setTopographyFactors(i);
        if (options.landcover[i] != 0) {
          var g = svg.append("g");

          if (options.landcover[i] > 5 && options.landcover[i] < 9) {
            var r = Math.floor(Math.random() * 2);
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
              .attr("xlink:href", "images/cell_images_bitmaps/" + picsForLandCoverGrid[options.landcover[i]][r])
              .attr("width", w)
              .attr("height", h);
          } else {
            g.append("svg:defs")
              .append("svg:pattern")
              .attr("id", "pattern" + i)
              .attr("patternUnits", "userSpaceOnUse")
              .attr("height", h)
              .attr("width", w)
              .attr("x", options.x[i] * w)
              .attr("y", options.y[i] * h)
              .append("svg:image")
              .attr("x", "0")
              .attr("y", "0")
              .attr("id", "image" + i)
              .attr("xlink:href", "images/cell_images_bitmaps/" + picsForLandCoverGrid[options.landcover[i]])
              .attr("width", w)
              .attr("height", h);
          }


          g.append("rect")
            .attr("id", i)
            .attr("class", "watershed-rect")
            .attr("x", options.x[i] * w)
            .attr("y", options.y[i] * h)
            .attr("width", w)
            .attr("height", h)
            .style("fill", "url(#pattern" + i + ")");
        } else {
          g.append("rect")
            .attr("id", i)
            .attr("class", "watershed-rect")
            .attr("x", options.x[i] * w)
            .attr("y", options.y[i] * h)
            .attr("width", w)
            .attr("height", h)
            .style("fill", colorsForLandCoverGrid[options.landcover[i]]);
          global.streamIndices[global.year].push(i);
        }
      }
    }

    /*if(data[i-1]===undefined && data[i-24]===undefined && data[i-23]===undefined) {
     roundTopLeft();
     }
     if(data[i+1]===undefined && data[i-22]===undefined && data[i-23]===undefined) {
     roundTopRight();
     }
     if(data[i-1]===undefined && data[i+22]===undefined && data[i+23]===undefined) {
     roundBottomLeft();
     }
     if(data[i+1]===undefined && data[i+24]===undefined && data[i+23]===undefined) {
     roundBottomRight();
     }
     if(data[i-1]===undefined && data[i-24]>0 && data[i-23]===undefined && data[i-22]>0) {
     roundTopLeft();
     }
     if(data[i+1]===undefined && data[i+24]>0 && data[i+23]===undefined && data[i+22]>0) {
     roundBottomRight();
     }
     if(i===1) {
     roundTopLeft();
     }

     function roundTopLeft(x, y, width, height, radius) {
     //http://stackoverflow.com/questions/12115691/svg-d3-js-rounded-corner-on-one-corner-of-a-rectangle?answertab=active#tab-top
     }
     function roundTopRight() {

     }
     function roundBottomLeft() {

     }
     function roundBottomRight() {

     }//*/

    /*var pathStr = "M";
     function constructPath(data, i) {
     if(data.landcover[i - 23] == undefined) {
     if(data.landcover[i - 24] == undefined) {
     addStr(data.x[i] * 30,data.y[i] * 20);
     addStr(data.x[i] * 30 + 30,data.y[i] * 20);
     } else {
     addStr(data.x[i] * 30 + 30,data.y[i] * 20);
     }

     }
     if(data.landcover[i + 1] == undefined) {}
     if(data.landcover[i ])

     function addStr(x, y) {
     pathStr = pathStr + x + " " + y + "L";
     }
     }*/

  }
  this.minimap = function (options) {
    if(miniMapState[options.id]) return;
    var rowData = global.data[global.year].row.data,
      columnData = global.data[global.year].column.data,
      SCALE = 3;
    if(options.width == undefined) {
      options.width = global.mapCellWidth;
    } if(options.height == undefined) {
      options.height = global.mapCellHeight;
    }
    options.width *= SCALE; options.height *= SCALE;
    var container = d3.select("#workspace")
      .append("div")
      .attr("id",options.id + "-minimap-container")
      .attr("class","physical-feature-map");
    for(var i=0; i<miniMapSlots.length; i++) {
      if(miniMapSlots[i].vacant) {
        $("#" + options.id + "-minimap-container").css("marginLeft", miniMapSlots[i].left + "%").css("marginBottom",miniMapSlots[i].bottom + "%");
        miniMapSlots[i].vacant = false;
        options.slot = i;
        break;
      }
    }
    $("#" + options.id + "-minimap-container").draggable().click(function() {
      $(this).remove();
      miniMapState[options.id] = false;
      miniMapSlots[options.slot].vacant = true;
    });
    var title = container.append("div");
    title.append("img")
      .attr("class","close")
      .attr("id","topo")
      .attr("src","images/icons/cross.png");
    title.append("a");

    var svg = container.append("svg")
      .attr("class","minimap-svg")
      .attr("width",options.width*global.data[global.year].rows)
      .attr("height",options.height*2*global.data[global.year].columns);
    miniMapState[options.id] = true;
    switch (options.id) {
      case "topo":
        $("#" + options.id + "-minimap-container div>a").text("Topographic Relief");
        var topography = global.data[global.year].topography.data,
            colors = colorbrewer.YlGnBu[6];
        for(var i=0; i<topography.length; i++) {
          if(topography[i] != undefined && !isNaN(topography[i])) {
            appendRectHelper(topography[i], colors);
          }
        }
        break;
      case "flood":
        $("#" + options.id + "-minimap-container div>a").text("Flood Frequency");
        var flood = global.data[global.year].floodfrequency.data,
          colors = colorbrewer.YlGnBu[6];
        for(var i=0; i<flood.length; i++) {
          if(flood[i] != undefined && !isNaN(flood[i] / 10)) {
            appendRectHelper(flood[i] / 10, colors);
          }
        }
        break;
      case "sub":
        $("#" + options.id + "-minimap-container div>a").text("Subwatershed Boundaries");
        var subwatershed = global.data[global.year].subwatershed.data,
          colors = boundaryColors;
        for(var i=0; i<subwatershed.length; i++) {
          if(subwatershed[i] != undefined && !isNaN(subwatershed[i])) {
            appendRectHelper(subwatershed[i], colors);
          }
        }
        break;
      case "wetland":
        $("#" + options.id + "-minimap-container div>a").text("Strategic Wetland Areas");
        var wetland = global.data[global.year].wetland.data,
          colors = colorbrewer.PuBuGn[3];
        for(var i=0; i<wetland.length; i++) {
          if(wetland[i] != undefined && !isNaN(wetland[i])) {
            appendRectHelper(wetland[i], colors);
          }
        }
        break;
      case "drainage":
        $("#" + options.id + "-minimap-container div>a").text("Drainage Class");
        var drainage = global.data[global.year].drainageclass.data,
          colors = colorbrewer.BrBG[8];
        for(var i=0; i<drainage.length; i++) {
          if(drainage[i] != undefined && !isNaN(drainage[i])) {
            svg.append("rect")
              .attr("x", function() {
                return columnData[i] * options.width;
              })
              .attr("y", function() {
                return rowData[i] * options.height;
              })
              .attr("width", options.width)
              .attr("height", options.height)
              .style("fill", function() {
                d = drainage[i] / 10;
                if (d === 4.5) {
                  return colors[4];
                } else if (d < 4.5) {
                  return colors[d - 1];
                } else {
                  return colors[d];
                }
              })
              .attr("id", options.id + "-rect-" + i)
              .attr("class", "minimap-rect");
          }
        }
        break;
    }

    function appendRectHelper(datapoint, colors) {
      if(isNaN(columnData[i]) || isNaN(rowData[i])) return;
      svg.append("rect")
        .attr("x", function() {
          return columnData[i] * options.width;
        })
        .attr("y", function() {
          return rowData[i] * options.height;
        })
        .attr("width", options.width)
        .attr("height", options.height)
        .style("fill", function() {
          return colors[datapoint];
        })
        .attr("id", options.id + "-rect-" + i)
        .attr("class", "minimap-rect");
    }
  }
}