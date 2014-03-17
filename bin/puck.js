/**
 * Created by rlfrahm on 11/19/13.
 */

function togglePuk(type, coords) {
    if (type == "layer") {
        if (!$(".pfeature-puk-item-container").is(":visible")) {
            initLayerPuk();
        } else {
            d3.selectAll(".pfeature-puk-item-container").remove();
        }
    }
    else if (type == "rclick") {
        if (!$("#rclick-puk-container").is(":visible")) {
            $("#rclick-puk-container").show();
            initRclickPuk();
        } else {
            $("#rclick-puk-container").hide();
            d3.select("#rclick").remove();
        }
    }

    function initLayerPuk() {
        var pfeatureButtonPos = $("#sidebar-left #layer").position(),
            radius = 4;
        pfeatureButtonPos.height = $("#sidebar-left #layer").height();
//        var puck = d3.select("#layer-puck-container")
//            .append("svg")
//            .attr("width", "100%")
//            .attr("height", "100%")
//            .attr("id", "pfeature")
//            .attr("class", "removable-displays-container");
        var puck = d3.select("#main");

        var center = centerOfElement($("#pfeature"));

        var offsetx = 30,
            offsety = 50,
            features = {
                topo: {
                    name: "Topographic Relief",
                    x: offsetx,
                    y: -offsety,
                    width: 100,
                    id: "topo",
                    file: "Icon_Topography.svg"
                },
                flood: {
                    name: "Flood Frequency",
                    x: offsetx,
                    y: 0,
                    width: 130,
                    id: "flood",
                    file: "Icon_Flood_Frequency.svg"
                },
                wetland: {
                    name: "Strategic Wetland Areas",
                    x: offsetx,
                    y: offsety,
                    width: 300,
                    id: "wetland",
                    file: "Icon_Strategic_Wetlands.svg"
                },
                sub: {
                    name: "Subwatershed Boundaries",
                    x: offsetx,
                    y: offsety * 2,
                    width: 210,
                    id: "sub",
                    file: "Icon_Subwatershed_Boundaries.svg"
                },
                drain: {
                    name: "Drainage Class",
                    x: offsetx,
                    y: offsety * 3,
                    width: 130,
                    id: "drainage",
                    key: {
                        label: "Drainage Class",
                        topLabel: "Excessive"

                    },
                    file: "Icon_Drainage_Class.svg"
                }
            };


        console.log(pfeatureButtonPos);
        for (var key in features) {
            var id = "pfeature-" + key,
                containerWidth = 4;
            var node = d3.select('#main').append('div')
                .attr("class", "pfeature-puk-item-container removable-displays")
                .style("left", pfeatureButtonPos.left + "px")
                .style("top", (pfeatureButtonPos.top + (pfeatureButtonPos.height / 2)) + "px")
                .attr("id", id)
                .style("width", containerWidth + "em")
                .style("text-align", "center")
                .style("padding-top", function() {
                    return containerWidth * 0.07 + "em";
                })
                .style("border-radius", 5 + "em");

            var img = node.append("img")
                .attr("src", "images/icons/navigation/" + features[key].file)
                .style("width", "86%")
                .attr("class", "selectable-feature")
                .attr("id", function () {
                    return features[key].id
                })
                .attr("title", function () {
                    return features[key].name
                });


            $("#" + id).animate({
                left: features[key].x + pfeatureButtonPos.left + "px",
                top: features[key].y + pfeatureButtonPos.top + "px"
            }, 100, "linear");
//            var node = puck.append("rect")
//                .attr("x", function () {
//                    return features[key].x
//                })
//                .attr("y", function () {
//                    return features[key].y
//                })
//                .attr("width", function () {
//                    return features[key].width
//                })
//                .attr("height", 20)
//                .attr("id", function () {
//                    return features[key].name + "-rect"
//                })
//                .attr("class", "puk-rect")
//                .style("fill", "#333")
//                .style("opacity", "0.8")
//                .style("border", "2px solid #cccc00");
//
//            puck.append("text")
//                .style("fill", "white")
//                .attr("id", function () {
//                    return features[key].id
//                })
//                .attr("x", function () {
//                    return features[key].x
//                })
//                .attr("y", function () {
//                    return features[key].y + 16
//                })
//                .attr("text-anchor", "start")
//                .text(function () {
//                    return features[key].name
//                })
//                .attr("class", "selectable-feature");
        }

//        $("#pfeature").mousemove(function (e) {
//            puck.select("line").remove();
//            var offset = $("#pfeature").offset();
//            var mouse = {
//                x: e.pageX - offset.left,
//                y: e.pageY - offset.top
//            };
//            puck.append("line")
//                .attr("x1", coords.x)
//                .attr("y1", coords.y)
//                .attr("x2", mouse.x - 2)
//                .attr("y2", mouse.y)
//                .style("stroke", "#cccc00")
//                .style("stroke-width", "3")
//                .attr("id", "pfeature-indicator-line");
//        })/*.mouseout(function(){puck.select("line").remove();})*/;

        $(".selectable-feature")
            .click(function () {
                var id = $(this).attr("id");
                console.log(id);
                displayMiniMap(id);
                $("#layer-puck-container").hide();
                puck.select("#pfeature-indicator-line").remove();
                d3.select("#pfeature").remove();
            });
        //*/


    }

    function initRclickPuk() {
        var puck = d3.select("#rclick-puk-container")
            .append("svg")
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("id", "rclick");

        var center = centerOfElement($("#rclick"));

        var offset = 0,
            features = {
                corn: {
                    name: "Corn",
                    x: center.x - 100,
                    y: center.y + 50,
                    width: 84,
                    id: "corn-landcover",
                    url: "images/toolbar_icons_bitmaps/Icon_Corn.png",
                    val: 1
                },
                ccorn: {
                    name: "Conservation Corn",
                    x: center.x - 125,
                    y: center.y + 15,
                    width: 150,
                    id: "ccorn-landcover",
                    url: "images/toolbar_icons_bitmaps/Icon_Conservation_Corn.png",
                    val: 2
                },
                soybean: {
                    name: "Soybean",
                    x: center.x - 100,
                    y: center.y - 20,
                    width: 150,
                    id: "soybean-landcover",
                    url: "images/toolbar_icons_bitmaps/Icon_Soybean.png",
                    val: 3
                },
                csoybean: {
                    name: "Conservation Soybean",
                    x: center.x - 75,
                    y: center.y - 55,
                    width: 150,
                    id: "csoybean-landcover",
                    url: "images/toolbar_icons_bitmaps/Icon_Conservation_Soybean.png",
                    val: 4
                },
                alfalfa: {
                    name: "Alfalfa",
                    x: center.x - 50,
                    y: center.y - 80,
                    width: 150,
                    id: "alfalfa-landcover",
                    url: "images/toolbar_icons_bitmaps/Icon_Alfalfa.png",
                    val: 5
                },
                mfnv: {
                    name: "Mixed Fruit & Veggies",
                    x: center.x - 25,
                    y: center.y - 115,
                    width: 150,
                    id: "fruitveggie-landcover",
                    url: "images/toolbar_icons_bitmaps/Icon_Mixed_Fruit_and_Vegetable.png",
                    val: 6
                },
                hay: {
                    name: "Hay",
                    x: center.x,
                    y: center.y - 145,
                    width: 150,
                    id: "hay-landcover",
                    url: "images/toolbar_icons_bitmaps/Icon_Hay.png",
                    val: 7
                },
                hbio: {
                    name: "Herbaceous Bioenergy",
                    x: center.x + 25,
                    y: center.y - 115,
                    width: 150,
                    id: "herbbioenergy-landcover",
                    url: "images/toolbar_icons_bitmaps/Icon_Herbaceous_Bioenergy.png",
                    val: 8
                },
                ppasture: {
                    name: "Permanent Pasture",
                    x: center.x + 50,
                    y: center.y - 80,
                    width: 150,
                    id: "permpasture-landcover",
                    url: "images/toolbar_icons_bitmaps/Icon_Permanent_Pasture.png",
                    val: 9
                },
                rotgrazing: {
                    name: "Rotational_Grazing",
                    x: center.x + 75,
                    y: center.y - 55,
                    width: 150,
                    id: "rotgrazing-landcover",
                    url: "images/toolbar_icons_bitmaps/Icon_Rotational_Grazing.png",
                    val: 10
                },
                wetland: {
                    name: "Wetland",
                    x: center.x + 100,
                    y: center.y - 20,
                    width: 150,
                    id: "wetland-landcover",
                    url: "images/toolbar_icons_bitmaps/Icon_Wetland.png",
                    val: 11
                },
                prairie: {
                    name: "Prairie",
                    x: center.x + 115,
                    y: center.y + 15,
                    width: 150,
                    id: "prairie-landcover",
                    url: "images/toolbar_icons_bitmaps/Icon_Prairie.png",
                    val: 12
                },
                forest: {
                    name: "Conventional Forest",
                    x: center.x + 100,
                    y: center.y + 40,
                    width: 150,
                    id: "forest-landcover",
                    url: "images/toolbar_icons_bitmaps/Icon_Conventional_Forest.png",
                    val: 13
                },
                cforest: {
                    name: "Conservation Forest",
                    x: center.x + 75,
                    y: center.y + 75,
                    width: 150,
                    id: "cforest-landcover",
                    url: "images/toolbar_icons_bitmaps/Icon_Conservation_Forest.png",
                    val: 14
                },
                wbio: {
                    name: "Woody Bioenergy",
                    x: center.x + 50,
                    y: center.y + 100,
                    width: 150,
                    id: "woodybioenergy-landcover",
                    url: "images/toolbar_icons_bitmaps/Icon_Woody_Bioenergy.png",
                    val: 15
                }//*/
            };

        for (var key in features) {
            //console.log(features[key].name);
            var g = puck.append("g");

            g.append("svg:defs")
                .append("svg:pattern")
                .attr("id", "landcover-image")
                .attr("patternUnits", "userSpaceOnUse")
                .attr("height", "40")
                .attr("width", "40")
                .attr("x", function () {
                    return features[key].x + 20;
                })
                .attr("y", function () {
                    return features[key].y + 20;
                })
                .append("svg:image")
                .attr("x", "0")
                .attr("y", "0")
                .attr("xlink:href", function () {
                    return features[key].url;
                })
                .attr("width", "40")
                .attr("height", "40");

            g.append("circle")
                .attr("id", "quick-puk-circle")
                .attr("cx", function () {
                    return features[key].x;
                })
                .attr("cy", function () {
                    return features[key].y;
                })
                .attr("r", "20")
                .attr("fill", "url(#landcover-image)")
                .attr("data", function () {
                    return features[key].val;
                });

            /*var node = puck.append("rect")
             .attr("x", function() {return features[key].x})
             .attr("y", function() {return features[key].y})
             .attr("width", function() {return features[key].width})
             .attr("height", 20)
             .attr("id", function() {return features[key].name + "-rect"})
             .attr("class", "puk-rect")
             .style("fill", "#333")
             .style("opacity", "0.8")
             .style("border", "2px solid #cccc00");

             puck.append("text")
             .style("fill", "white")
             .attr("id", function() {return features[key].id})
             .attr("x", function() {return features[key].x})
             .attr("y", function() {return features[key].y + 16})
             .attr("text-anchor", "start")
             .text(function() {return features[key].name})
             .attr("class", "selectable-feature");
             */
        }

        $("#rclick").mousemove(function (e) {
            puck.select("line").remove();
            var offset = $("#rclick").offset();
            var mouse = {
                x: e.pageX - offset.left,
                y: e.pageY - offset.top
            };
            //console.log(e.pageX, e.pageY);
            //console.log(offset.left, offset.top);
            /*puck.append("line")
             .attr("x1", coords.x - offset.left)
             .attr("y1", coords.y - offset.top)
             .attr("x2", mouse.x - 5)
             .attr("y2", mouse.y)
             .style("stroke", "#cccc00")
             .style("stroke-width", "3");
             */
        });

        $(".selectable-feature")
            .click(function () {
                var id = $(this).attr("id");
                displayPuk(id);
                $("#rclick-puk-container").hide();
                puck.select("line").remove();
                d3.select("svg").remove();
            });

        var quickpuk = -1;
        $("#quick-puk-circle").click(function (e) {
            if (e.which == 3) {
                //$(this).toggleClass("highlighted");
                var i = $("#quick-puk-circle").index(this);
                //console.log(this);
                selectedPaint = $("#quick-puk-circle").eq(i).attr("value");
                alert(selectedPaint);
                global.selectedPaint = selectedPaint;
                updatePaintSelection();
            }
        }).mouseenter(function () {
                console.log("lkjansd");
                var i = $("#quick-puk-circle").index(this);
                quickpuk = parseInt($("#quick-puk-circle").eq(i).attr("value"));
                console.log(quickpuk);
            }).mouseleave(function () {
                quickpuk = -1;
            });
    }

    function centerOfElement(element) {
        var $this = element;
        var offset = $this.offset();
        var width = $this.width();
        var height = $this.height();
        var arr = {
            x: width / 2,
            y: height / 2
        };
        return arr;
    }

    function displayPuk(id) {
        alert("Display" + id);
    }


}


