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

function setWatershedArea(i) {
	watershedArea += global.data[global.year].area.data[i];
}

function setStrategicWetland(i) {
    if (global.data[global.year].wetland.data[i] == 1) {
        strategicArea++;
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
 * @param firstpass - true if we are building the watershed from scratch, false if we are updating already existing data points
 */
function changeBaselandcoverDataPoint(value, i, firstpass, year) {
    if (global.data[year].baselandcover.data[i] !== 0 && !firstpass) {
        setLandCoverArea(value, i, year, global.data[year].baselandcover.data[i]);
    } else {
        setLandCoverArea(value, i, year);
    }
    global.data[year].baselandcover.data[i] = value;
    if(!global.update[year]) {
        flagUpdateToTrue(year);
		if(year + 1 < 4 && global.data[year + 1] !== 0) {
			if((value > 0 && value < 5) || value == 15) {
				flagUpdateToTrue(year + 1);
			}
		}
    }
}


/**
 *
 * @param newIdx - the old landcover type
 * @param oldIdx - the new landcover type
 */
function setLandCoverArea(newIdx, i, year, oldIdx) {
    var dataPointArea = global.data[year].area.data[i];
    landCoverArea[newIdx] += dataPointArea;
    if(!global.landuse[year][newIdx]) global.landuse[year][newIdx] = 0;
    global.landuse[year][newIdx] += dataPointArea;
    if (oldIdx) {
        // We need to subtract this area from it's respective landcover
        landCoverArea[oldIdx] -= dataPointArea;
        if(!global.landuse[year][oldIdx]) global.landuse[year][newIdx] = 0;
        global.landuse[year][oldIdx] -= dataPointArea;
    } else {
        // We haven't accounted for this area yet
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
    if (overrideValue) {
        global.data.precipitation[year] = overrideValue;

        if (global.data.precipitation[year] < 28.19) {
            global.data.r[year] = 0;
        } else if (global.data.precipitation[year] < 36.47) {
            global.data.r[year] = 1;
        } else {
            global.data.r[year] = 2;
        }
    } else {
        var r = Math.floor(Math.random() * precip.length);
        global.data.precipitation[year] = precip[r];

        if (r === 0 || r === 1) {
            global.data.r[year] = 0;
        } else if (r === 2 || r === 3 || r === 4) {
            global.data.r[year] = 1;
        } else {
            global.data.r[year] = 2;
        }
    }
    if(global.data[year] != 0 && global.data[year] != undefined) {
        flagUpdateToTrue(year);
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
    global.landcovers[year][landcovers[1]].area = 0;
    global.landcovers[year][landcovers[2]].area = 0;
    global.landcovers[year][landcovers[3]].area = 0;
    global.landcovers[year][landcovers[4]].area = 0;
    global.landcovers[year][landcovers[5]].area = 0;
    global.landcovers[year][landcovers[8]].area = 0;
    global.landcovers[year][landcovers[11]].area = 0;
    global.landcovers[year][landcovers[10]].area = 0;
    global.landcovers[year][landcovers[6]].area = 0;
    global.landcovers[year][landcovers[7]].area = 0;
    global.landcovers[year][landcovers[12]].area = 0;
    global.landcovers[year][landcovers[13]].area = 0;
    global.landcovers[year][landcovers[14]].area = 0;
    global.landcovers[year][landcovers[15]].area = 0;
}

function closeAllRemovableDisplays() {
    $(".removable-displays-container").each(function () {
        $(this).remove();
    });
    d3.selectAll(".removable-displays").remove();
}

function addDatasetChangesToUndoLog(actions) {
    global.undo[global.year].push(actions);
}

function undoLastDatasetChanges() {
    if(!global.undo[global.year][0]) return;

    var lastaction = global.undo[global.year].pop();
    for(var i = 0; i<lastaction.length; i++) {
        var opts = {
            singlelandcover: true,
            landcover: lastaction[i].previous,
            location: lastaction[i].location,
			year: global.year
        };
        global.maps.updateWatershed(opts);
    }
}

function updateDataPoint(i, options) {
	//setStrategicWetland(i);
	//setStreamNetworkArea(i);
    changeBaselandcoverDataPoint(options.landcover, i, true, options.year);
	//setSubwatershedArea(i, false);
	//setSoiltypeFactors(i);
	//setTopographyFactors(i);
}

function reinitialize() {
	for(var index in dataset) {
		for(var year=1; year<=global.years; year++) {
			if(dataset[index]['Year' + year] !== 0) dataset[index]['Year' + year] = 0;
			if(dataset[index]['Value' + year] !== 0) dataset[index]['Value' + year] = 0;
		}
	}
	
    global.landuse = {
        1: [],
        2: [],
        3: []
    };
	
    global.watershedPercent = {
        1: [],
        2: [],
        3: []
    };

    global.grossErosionSeverity = {
        1: [],
        2: [],
        3: []
    };

    global.riskAssessment = {
        1: [],
        2: [],
        3: []
    };
	
	global.strategicWetland = {};

    landCoverArea = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
}

function flagUpdateToTrue(year) {
    global.update[year] = true;
//    console.log("Year " + year + " update set to true");
}

function flagUpdateToFalse(year) {
    global.update[year] = false;
//    console.log("Year " + year + " update set to false");
}