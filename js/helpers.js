/**
 * Created by rlfrahm on 2/3/14.
 */

/**
 *
 * @param value - landcover type
 * @param i - index that the landcover occurs
 * @param firstpass - true if we are building the watershed from scratch, false if we are simply updating data points
 */
function changeBaselandcoverDataPoint(value, i, firstpass) {
    if(global.data[global.year].baselandcover.data[i] !== 0 && !firstpass) {
        console.log(global.data[global.year].baselandcover.data[i]);
        setLandCoverArea(value, global.data[global.year].baselandcover.data[i]);
    } else {
        setLandCoverArea(value);
    }
    global.data[global.year].baselandcover.data[i] = value;
    global.update = true;
}


/**
 *
 * @param newIdx - the old landcover type
 * @param oldIdx - the new landcover type
 */
function setLandCoverArea(newIdx, oldIdx) {
    if (landCoverArea[newIdx] == undefined) {
        landCoverArea[newIdx] = 0;
    } else {
        landCoverArea[newIdx] += unitArea;
        if(oldIdx) {
            // We need to subtract this area from it's respective landcover
            landCoverArea[oldIdx] -= unitArea;
            console.log(landCoverArea);
        } else {
            // We haven't accounted for this area yet
            area += unitArea;
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
        var data = {name: "", data: []};
        if (obj[property].data != undefined) {
            for (var i = 0; i < obj[property].data.length; i++) {
                data.data[i] = obj[property].data[i];
            }
            data.name = obj[property].name;
            returnObj[property] = data;
        }
    }
    //console.log(returnObj);
    return returnObj;
}