var landCoverArea,
    watershedArea,
    streamArea,
    strategicArea,
    subwatershedArea,
    subsoilGroup,
    topoSlopeRangeHigh,
    permeabilityCode;

function initCalcs() {
    landCoverArea = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    watershedArea = 0, streamArea = 0, strategicArea = 0;
    area = 1;
    subwatershedArea = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    subsoilGroup = [];
    topoSlopeRangeHigh = [];
    permeabilityCode = [];
}

function setStrategicWetland(i) {
    if (global.data[global.year].wetland.data[i] == 1) {
        strategicArea += global.data[global.year].area.data[i];
    }
}
function setSubwatershedArea(i) {
    var subwatershed = global.data[global.year].subwatershed.data;
    if (subwatershed[i] != undefined && subwatershed[i] != "Subwatershed") {
        subwatershedArea[subwatershed[i]] += global.data[global.year].area.data[i];
    }
}
function setStreamNetworkArea(i) {
    if (global.data[global.year].streamnetwork.data[i] == 1) {
        streamArea += global.data[global.year].area.data[i];
    }
}
function setSoiltypeFactors(i) {
    switch (global.data[global.year].soiltype.data[i]) {
        case "A":
            subsoilGroup[i] = 1;
            permeabilityCode[i] = 50;
            break;
        case "B":
            subsoilGroup[i] = 1;
            permeabilityCode[i] = 10;
            break;
        case "C":
            subsoilGroup[i] = 1;
            permeabilityCode[i] = 50;
            break;
        case "D":
            subsoilGroup[i] = 1;
            permeabilityCode[i] = 50;
            break;
        case "G":
            subsoilGroup[i] = 1;
            permeabilityCode[i] = 80;
            break;
        case "K":
            subsoilGroup[i] = 1;
            permeabilityCode[i] = 50;
            break;
        case "L":
            subsoilGroup[i] = 1;
            permeabilityCode[i] = 50;
            break;
        case "M":
            subsoilGroup[i] = 1;
            permeabilityCode[i] = 50;
            break;
        case "N":
            subsoilGroup[i] = 1;
            permeabilityCode[i] = 50;
            break;
        case "O":
            subsoilGroup[i] = 1;
            permeabilityCode[i] = 55;
            break;
        case "Q":
            subsoilGroup[i] = 1;
            permeabilityCode[i] = 50;
            break;
        case "T":
            subsoilGroup[i] = 1;
            permeabilityCode[i] = 50;
            break;
        case "Y":
            subsoilGroup[i] = 1;
            permeabilityCode[i] = 50;
            break;
    }
}
function setTopographyFactors(i) {
    switch (global.data[global.year].topography.data[i]) {
        case 0:
            topoSlopeRangeHigh[i] = 0;
            break;
        case 1:
            topoSlopeRangeHigh[i] = 2;
            break;
        case 2:
            topoSlopeRangeHigh[i] = 5;
            break;
        case 3:
            topoSlopeRangeHigh[i] = 9;
            break;
        case 4:
            topoSlopeRangeHigh[i] = 14;
            break;
        case 5:
            topoSlopeRangeHigh[i] = 18;
            break;

    }
}

/**
 *
 * @param value - landcover type
 * @param i - index that the landcover occurs
 * @param firstpass - true if we are building the watershed from scratch, false if we are simply updating data points
 */
function changeBaselandcoverDataPoint(value, i, firstpass) {
    if(global.data[global.year].baselandcover.data[i] !== 0 && !firstpass) {
        setLandCoverArea(value, i, global.data[global.year].baselandcover.data[i]);
    } else {
        setLandCoverArea(value, i);
    }
	$("#watershed1 #" + i).attr("landcover", landcovers[value]);
    global.data[global.year].baselandcover.data[i] = value;
    global.update = true;
}


/**
 *
 * @param newIdx - the old landcover type
 * @param oldIdx - the new landcover type
 */
function setLandCoverArea(newIdx, i, oldIdx) {
    var dataPointArea = global.data[global.year].area.data[i];
    if (landCoverArea[newIdx] == undefined) {
        landCoverArea[newIdx] = 0;
        global.landuse[global.year] = 0;
    } else {
        landCoverArea[newIdx] += dataPointArea;
        global.landuse[global.year] += dataPointArea;
        if(oldIdx) {
            // We need to subtract this area from it's respective landcover
            landCoverArea[oldIdx] -= dataPointArea;
            global.landuse[global.year] -= dataPointArea;
        } else {
            // We haven't accounted for this area yet
            watershedArea += dataPointArea;
//            console.log("Area");
        }

    }
}

/**
 * Removes pointers
 * Compliments of: http://webdevwonders.com/deep-copy-javascript-objects/
 * @param obj
 * @returns {{}}
 */
function copy(obj) {
//    console.log(obj.baselandcover.data[0]);
    var returnObj = {};
    for (var property in obj) {
//        console.log(property);
        var data = {name: "", data: []};
        if (obj[property].data != undefined) {
            for (var i = 0; i < obj[property].data.length; i++) {
                data.data[i] = obj[property].data[i];
            }
            data.name = obj[property].name;
            returnObj[property] = data;
        } else {
            returnObj[property] = obj[property];
        }
    }
    return returnObj;
}

/**
 * Centers an element relative to another
 * @param parent - The parent element to center relative to
 * @param child - The container that needs to be centered
 */
function centerElement(parent, child) { // Check for less than zero margin top!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    var viewwidth = parent.width();
    var viewheight = parent.height();
    var width = child.width();
    var height = child.height();
    var marginleft = (viewwidth - width) / 2;
    var margintop = (viewheight - height) / 4;

    child.css("marginLeft", marginleft)/*.css("marginTop", margintop)*/;
}

/**
 * Sets the precipitation for year 0 through year 3 in the watershed
 */
function setPrecipitation(year, overrideValue) {
    var precip = [24.58, 28.18, 30.39, 32.16, 34.34, 36.47, 45.10];
    if(overrideValue) {
        global.precipitation[year] = overrideValue;
    } else {
        var r = Math.floor(Math.random() * precip.length);
        global.precipitation[year] = precip[r];

        if (r === 0 || r === 1) {
            global.r[year] = 0;
        } else if (r === 2 || r === 3 || r === 4) {
            global.r[year] = 1;
        } else {
            global.r[year] = 2;
        }
    }
}

function getPrecipitationValue(index) {
    var precip = [24.58, 28.18, 30.39, 32.16, 34.34, 36.47, 45.10];
    return precip[index];
}

/**
 * Get a log with base 10
 * @param x
 * @returns log base 10
 */
function log10(x) {
    return Math.log(x) / Math.LN10;
}

/**
 *
 * @param year
 */
function resetLandCoverValuesAreasFor(year) {
    global.landcovers[year]["Corn"].area = 0;
    global.landcovers[year]["Conservation Corn"].area = 0;
    global.landcovers[year]["Soybeans"].area = 0;
    global.landcovers[year]["Conservation Soybeans"].area = 0;
    global.landcovers[year]["Alfalfa"].area = 0;
    global.landcovers[year]["Grass Hay"].area = 0;
    global.landcovers[year]["Conventional Forest"].area = 0;
    global.landcovers[year]["Conservation Forest"].area = 0;
    global.landcovers[year]["Permanent Pasture"].area = 0;
    global.landcovers[year]["Rotational Grazing"].area = 0;
    global.landcovers[year]["Herbaceous Bioenergy"].area = 0;
    global.landcovers[year]["Woody Bioenergy"].area = 0;
    global.landcovers[year]["Wetlands"].area = 0;
    global.landcovers[year]["Mixed Fruit & Vegetables"].area = 0;
}