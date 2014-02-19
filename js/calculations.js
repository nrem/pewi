/**
 * Director for all calculations
 * @constructor
 */
var ScoreDirector = function () {
    var yieldVals = new Yield(),
        nitrates = new Nitrates(),
        carbon = new Carbon(),
        bio = new Biodiversity(),
        erosion = new Erosion(),
        landcover = global.data[global.year].baselandcover.data;
    this.update = function () {
       // console.log("Updating...");
        // Update
        for (var i = 0; i <= landcover.length; i++) {
            if (landcover[i] > 0) {
                yieldVals.update(i);
                nitrates.update(i);
                //phos.update(i);
                carbon.update(i);
                bio.update(i);

                //sediment.update(i);
                erosion.update(i);
            }
        }
        for (var i = 0; i <= landcover.length; i++) {
            if (landcover[i] > 0) {
                bio.updateAdj(i);
            }
        }
        yieldVals.calculate();
        nitrates.calculate();
        carbon.calculate();
        bio.calculate();
        for (var j = 0; j < subwatershedArea.length; j++) {
            erosion.calculateStepTwo(j);
        }
        erosion.calculateStepThree();
        //console.log(yieldVals.getCornYield());
        //console.log(yieldVals.soyYield);
        updatePlot = false;
        for(var i=0; i<dataset.length; i++)
        {
        	console.log(dataset[i]);
        }
        global.update = false;
    }

    this.calculateOutputMapValues = function () {
        // Update
        for (var i = 0; i <= landcover.length; i++) {
            if (landcover[i] > 0) {
                nitrates.update(i);
                erosion.update(i);
            }
        }
        for (i = 0; i < landcover.length; i++) {
            erosion.calculateStepOne(i);
        }
        nitrates.calculate();
        erosion.calculateStepThree();
    }
};

/**
 * Yield calculations
 * @constructor
 */
var Yield = function () {
    var landcover = global.data[global.year].baselandcover.data,
        soilType = getSubdataValueWithName("soiltype", global.year),
        datapointarea = getSubdataValueWithName("area", global.year),
        soilTypeId = ["A", "B", "C", "D", "G", "K", "L", "M", "N", "O", "Q", "T", "Y"],
        yieldMultiplier = [0.5, 0.3333, 1, 0.7],
        yieldPrecipitationMultiplier,
        CATTLE_BODY_WEIGHT = 1200,
        GRAZING_SEASON_LENGTH = 200,
        cattleAverageDailyIntake = 0.03 * CATTLE_BODY_WEIGHT,
        unitYield = [
            [223, 0, 214, 206, 0, 200, 210, 221, 228, 179, 235, 240, 209], //corn
            [65, 0, 62, 60, 0, 58, 61, 64, 66, 52, 68, 70, 61], //soybean
            [6.3, 0, 4.3, 5.6, 0, 4.1, 4.2, 6.5, 6.4, 3.6, 6.9, 6.7, 6.3], //alfalfa, grass/hay
            [275, 125, 85, 275, 245, 105, 85, 275, 175, 85, 275, 175, 275], //timber
            [6.3, 0, 4.3, 5.6, 0, 4.1, 4.2, 6.5, 6.4, 3.6, 6.9, 6.7, 6.3], //cattle
            [1.04, 0, 1, 0.96, 0, 0.93, 0.98, 1.03, 1.06, 0.83, 1.09, 1.12, 0.97],
            [2.4426229508,0,2.1475409836,1.8852459016,0,1.6885245902,2.0163934426,2.3770491803,2.606557377,1,2.8360655738,3,1.9836065574] //herb
        ],
        conservationYieldFactor = [0.945, 0.975, 0.975, 0.975, 0.9, 0.9, 0.9, 0.975, 0.9, 0.975, 0.975, 0.9, 0.9, 0.9],
        yieldVals = {
            corn: {
                index: 0,
                max: 0,
                val: 0
            },
            soybean: {
                index: 0,
                max: 0,
                val: 0
            },
            alfalfa: {
                index: 0,
                max: 0,
                val: 0
            },
            grass: {
                index: 0,
                max: 0,
                val: 0
            },
            timber: {
                index: 0,
                max: 0,
                val: 0
            },
            cattle: {
                index: 0,
                max: 0,
                val: 0
            },
            fruitveggie: {
                index: 0,
                max: 0,
                val: 0
            },
            herb: {
                index: 0,
                max: 0,
                val: 0
            },
            woody: {
                index: 0,
                max: 0,
                val: 0
            }
        },
        soiltype;

    for(var i=1; i<landcovers.length; i++) {
        global.landcovers[global.year][landcovers[i]] = {
            name: landcovers[i],
            area: 0,
            percent: 0
        };
    }

    this.update = function (i) {
        //landCoverType(i);
        soiltype = getSoilType(i);
        yieldPrecipitationMultiplier = getYieldPrecipitationMultiplier(i);
        // Corn Yield
        setCornYield(i);
        global.landcovers[global.year]["Corn"].area += (landcover[i] == 1) ? datapointarea[i] : 0;
        global.landcovers[global.year]["Conservation Corn"].area += (landcover[i] == 2) ? datapointarea[i] : 0;
        
        // Soy Yield
        setSoyYield(i);
        global.landcovers[global.year]["Soybeans"].area += (landcover[i] == 3) ? datapointarea[i] : 0;
        global.landcovers[global.year]["Conservation Soybeans"].area += (landcover[i] == 4) ? datapointarea[i] : 0;
        
        // Alfalfa Yield
        setAlfalfaYield(i);
        global.landcovers[global.year]["Alfalfa"].area += (landcover[i] == 5) ? datapointarea[i] : 0;
        
        // GrassHay Yield
        setGrassHayYield(i);
        global.landcovers[global.year]["Grass Hay"].area += (landcover[i] == 8) ? datapointarea[i] : 0;
        
        // Timer Yield
        setTimberYield(i);
        global.landcovers[global.year]["Conventional Forest"].area += (landcover[i] == 11) ? datapointarea[i] : 0;
        global.landcovers[global.year]["Conservation Forest"].area += (landcover[i] == 10) ? datapointarea[i] : 0;
        
        // Cattle Yield
        setCattleYield(i);
        global.landcovers[global.year]["Permanent Pasture"].area += (landcover[i] == 6) ? datapointarea[i] : 0;
        global.landcovers[global.year]["Rotational Grazing"].area += (landcover[i] == 7) ? datapointarea[i] : 0;
        
        // Herbaceous Bioenergy Yield
        setHerbaceousBioenergyYield(i);
        global.landcovers[global.year]["Herbaceous Bioenergy"].area += (landcover[i] == 12) ? datapointarea[i] : 0;
        
        // Woody Bioenergy Yield
        setWoodyBioenergyYield(i);
        global.landcovers[global.year]["Woody Bioenergy"].area += (landcover[i] == 13) ? datapointarea[i] : 0;
        
        // Wetland Yield
        global.landcovers[global.year]["Wetlands"].area += (landcover[i] == 14) ? datapointarea[i] : 0;
        
        // FruitVeggie Yield
        setFruitVeggieYield(i);
        global.landcovers[global.year]["Mixed Fruit & Vegetables"].area += (landcover[i] == 15) ? datapointarea[i] : 0;
        // Results calculations
//        global.results[global.year].yield.corn_percent += (data[i] == 1) ? area
    };
    this.calculate = function () {
        // Corn Yield
        dataset[0]["Value" + global.year] = yieldVals.corn.val;
        dataset[0]["Year" + global.year] = 100 * (yieldVals.corn.val / yieldVals.corn.max);
        global.landcovers[global.year]["Corn"].percent = global.landcovers[global.year]["Corn"].area / watershedArea * 100;
        global.landcovers[global.year]["Conservation Corn"].percent = global.landcovers[global.year]["Conservation Corn"].area / watershedArea * 100;
        
        // Soy Yield
        dataset[1]["Value" + global.year] = yieldVals.soybean.val;
        yieldVals.soybean.index = 100 * (yieldVals.soybean.val / yieldVals.soybean.max);
        dataset[1]["Year" + global.year] = yieldVals.soybean.index;
        global.landcovers[global.year]["Soybeans"].percent = global.landcovers[global.year]["Soybeans"].area / watershedArea * 100;
        global.landcovers[global.year]["Conservation Soybeans"].percent = global.landcovers[global.year]["Conservation Soybeans"].area / watershedArea * 100;

        // Alfalfa Yield
        dataset[2]["Value" + global.year] = yieldVals.alfalfa.val;
        yieldVals.alfalfa.index = 100 * (yieldVals.alfalfa.val / yieldVals.alfalfa.max);
        dataset[2]["Year" + global.year] = yieldVals.alfalfa.index;
        global.landcovers[global.year]["Alfalfa"].percent = global.landcovers[global.year]["Alfalfa"].area / watershedArea * 100;
        
        // GrassHay Yield
        dataset[3]["Value" + global.year] = yieldVals.grass.val;
        yieldVals.grass.index = 100 * (yieldVals.grass.val / yieldVals.grass.max);
        dataset[3]["Year" + global.year] = yieldVals.grass.index;
        global.landcovers[global.year]["Grass Hay"].percent = global.landcovers[global.year]["Grass Hay"].area / watershedArea * 100;
        
        // Timer Yield
        dataset[4]["Value" + global.year] = yieldVals.timber.val;
        yieldVals.timber.index = 100 * (yieldVals.timber.val / yieldVals.timber.max);
        dataset[4]["Year" + global.year] = yieldVals.timber.index;
        global.landcovers[global.year]["Conventional Forest"].percent = global.landcovers[global.year]["Conventional Forest"].area / watershedArea * 100;
        global.landcovers[global.year]["Conservation Forest"].percent = global.landcovers[global.year]["Conservation Forest"].area / watershedArea * 100;
        
        // Cattle
        dataset[5]["Value" + global.year] = yieldVals.cattle.val;
        yieldVals.cattle.index = 100 * (yieldVals.cattle.val / yieldVals.cattle.max);
        dataset[5]["Year" + global.year] = yieldVals.cattle.index;
        global.landcovers[global.year]["Permanent Pasture"].percent = global.landcovers[global.year]["Permanent Pasture"].area / watershedArea * 100;
        global.landcovers[global.year]["Rotational Grazing"].percent = global.landcovers[global.year]["Rotational Grazing"].area / watershedArea * 100;
        
        // Herbaceous Bioenergy Yield
        dataset[14]["Value" + global.year] = yieldVals.herb.val;
        dataset[14]["Year" + global.year] = 100 * (yieldVals.herb.val / yieldVals.herb.max);
        global.landcovers[global.year]["Herbaceous Bioenergy"].percent = global.landcovers[global.year]["Herbaceous Bioenergy"].area / watershedArea * 100;
        
        // Woody Bioenergy Yield
        dataset[15]["Value" + global.year] = yieldVals.woody.val;
        dataset[15]["Year" + global.year] = 100 * (yieldVals.woody.val / yieldVals.woody.max);
        global.landcovers[global.year]["Woody Bioenergy"].percent = global.landcovers[global.year]["Woody Bioenergy"].area / watershedArea * 100;
        
        // FruitVeggie Yield
        dataset[6]["Value" + global.year] = yieldVals.fruitveggie.val;
        dataset[6]["Year" + global.year] = 100 * (yieldVals.fruitveggie.val / yieldVals.fruitveggie.max);
        global.landcovers[global.year]["Mixed Fruit & Vegetables"].percent = global.landcovers[global.year]["Mixed Fruit & Vegetables"].area / watershedArea * 100;

    };

    //////////////Corn Yield///////////////////
    function setCornYield(i) {
        yieldVals.corn.val += yieldPrecipitationMultiplier * getCornYield(i);
        setCornMax(i);
    }

    function getCornYield(i) {
        if (landcover[i] == 1 || landcover[i] == 2) {

            return unitYield[0][soiltype] * datapointarea[i];
        } else {
            return 0;
        }
    }

    function setCornMax(i) {
        yieldVals.corn.max += unitYield[0][soiltype] * datapointarea[i];
    }

    //////////////Soy Yield///////////////////
    function setSoyYield(i) {
        yieldVals.soybean.val += yieldPrecipitationMultiplier * getBaseSoyYield(i);
        setSoyMax(i);
    }

    function getBaseSoyYield(i) {
        if (landcover[i] == 3 || landcover[i] == 4) {
            return unitYield[1][soiltype] * datapointarea[i];
        } else {
            return 0;
        }
    }

    function setSoyMax(i) {
        yieldVals.soybean.max += unitYield[1][soiltype] * datapointarea[i];
    }

    //////////////Alfalfa Yield///////////////////
    function setAlfalfaYield(i) {
        yieldVals.alfalfa.val += yieldPrecipitationMultiplier * getAlfalfaYield(i);
        setAlfalfaMax(i);
    }

    function getAlfalfaYield(i) {
        if (landcover[i] == 5) return unitYield[2][soiltype] * datapointarea[i];
        else return 0;
    }

    function setAlfalfaMax(i) {
        yieldVals.alfalfa.max += unitYield[2][soiltype] * datapointarea[i];
    }

    //////////////GrassHay Yield///////////////////
    function setGrassHayYield(i) {
        yieldVals.grass.val += yieldPrecipitationMultiplier * getGrassHayYield(i);
        setGrassHayMax(i);
    }

    function getGrassHayYield(i) {
        if (landcover[i] == 8) return unitYield[2][soiltype] * datapointarea[i];
        else return 0;
    }

    function setGrassHayMax(i) {
        yieldVals.grass.max += unitYield[2][soiltype] * datapointarea[i];
    }

    //////////////Timber Yield///////////////////
    function setTimberYield(i) {
        yieldVals.timber.val += yieldPrecipitationMultiplier * getTimberYield(i);
        setTimberMax(i);
    }

    function getTimberYield(i) {
        if (landcover[i] == 10 || landcover[i] == 11) return (unitYield[3][soiltype] * datapointarea[i]);
        else return 0;
    }

    function setTimberMax(i) {
        yieldVals.timber.max += unitYield[3][soiltype] * datapointarea[i];
    }

    //////////////Cattle Yield///////////////////
    function setCattleYield(i) {
        yieldVals.cattle.val += yieldPrecipitationMultiplier * getCattleSupported(i);
        setCattleMax(i);
    }

    function getCattleSupported(i) {
        if(landcover[i] == 6 || landcover[i] == 7) {
//            console.log(getSeasonalUtilizationRate(i), cattleAverageDailyIntake, GRAZING_SEASON_LENGTH, unitYield[4][soiltype], datapointarea[i]);
            return (getSeasonalUtilizationRate(i) / ((cattleAverageDailyIntake / 2000) * GRAZING_SEASON_LENGTH) * unitYield[4][soiltype] * datapointarea[i]);
        }
        else return 0;
    }
    
    function getSeasonalUtilizationRate(i) {
        if (landcover[i] == 6) return 0.35;
        else if(landcover[i] == 7) return 0.55;
        else return 0;
    }

    function setCattleMax(i) {
        yieldVals.cattle.max += (0.55 / ((cattleAverageDailyIntake / 2000) * GRAZING_SEASON_LENGTH) * unitYield[4][soiltype] * datapointarea[i]);
    }
    
    //////////////Herbaceous Bioenergy Yield///////////////////
    function setHerbaceousBioenergyYield(i) {
        yieldVals.herb.val += yieldPrecipitationMultiplier * getHerbaceousBioenergyYield(i);
        setHerbaceousBioenergyMax(i);
    }
    
    function getHerbaceousBioenergyYield(i) {
        if (landcover[i] == 12) return unitYield[6][soiltype] * datapointarea[i];
        else return 0;
    }
    
    function setHerbaceousBioenergyMax(i) {
        yieldVals.herb.max += unitYield[6][soiltype] * datapointarea[i];
    }
    
    //////////////Woody Bioenergy Yield///////////////////
    function setWoodyBioenergyYield(i) {
        yieldVals.woody.val += getWoodyBioenergyYield(i);
        setWoodyBioenergyMax(i);
    }
    
    function getWoodyBioenergyYield(i) {
        return (landcover[i] == 13) ? 60.8608 * datapointarea[i] : 0;
    }
    
    function setWoodyBioenergyMax(i) {
        yieldVals.woody.max += 60.8608 * datapointarea[i];
    }

    //////////////Mixed Fruit/Veggie Yield///////////////////
    function setFruitVeggieYield(i) {
        yieldVals.fruitveggie.val += getFruitVeggieYield(i);
        setFruitVeggieMax(i);
    }

    function getFruitVeggieYield(i) {
        if (landcover[i] == 15) return getYieldPrecipitationMultiplier(i) * 7.34 * area * getSoilTypeMultiplier(i);
        else return 0;
    }

    function setFruitVeggieMax(i) {
        yieldVals.fruitveggie.max += 7.34 * datapointarea[i] * getSoilTypeMultiplier(i);
    }

    function getYieldPrecipitationMultiplier(i) {
        if(landcover[i] > 0 && landcover[i] < 5) {
            if(global.precipitation[global.year] == 24.58 || global.precipitation[global.year] == 45.10) return 0.75;
            else if(global.precipitation[global.year] == 28.18 || global.precipitation[global.year] == 36.47) return 0.9;
            else if(global.precipitation[global.year] == 30.39 || global.precipitation[global.year] == 32.16 || global.precipitation[global.year] == 34.34) return 1;
        } else if ((landcover[i] > 4 && landcover[i] < 9) || landcover[i] == 12) {
            if (global.precipitation[global.year] > 24.58 && global.precipitation[global.year] < 45.10) return 1;
            else return 0.95;
        } else if (landcover[i] == 15) {
            if (global.precipitation[global.year] < 36.47) return 1;
            else if (global.precipitation[global.year] == 36.47) return 0.9
            else return 0.75;
        }
        return 1;
    }

    function getSoilTypeMultiplier(i) {
        var soiltexture = getSoilTexture(i);
        if(soiltexture == "FSL") return 1;
        else if(soiltexture == "SL") return 0.9;
        else if(soiltexture == "L") return 0.85;
        else return 0.4;
    }

    function getSoilTexture(i) {
        switch (soilType[i]) {
            case soilTypeId[0]:
                return "L";
                break;
            case soilTypeId[1]:
                return "FSL";
                break;
            case soilTypeId[2]:
                return "SICL";
                break;
            case soilTypeId[3]:
                return "SIL";
                break;
            case soilTypeId[4]:
                return "L";
                break;
            case soilTypeId[5]:
                return "SIL";
                break;
            case soilTypeId[6]:
                return "CL";
                break;
            case soilTypeId[7]:
                return "SICL";
                break;
            case soilTypeId[8]:
                return "L";
                break;
            case soilTypeId[9]:
                return "MK-SIL";
                break;
            case soilTypeId[10]:
                return "SICL";
                break;
            case soilTypeId[11]:
                return "SICL";
                break;
            case soilTypeId[12]:
                return "SIL";
                break;
        }
        return;
    }

    function getSoilType(i) {
        var y = 0;
        switch (soilType[i]) {
            case soilTypeId[0]:
                return y = 0;
                break;
            case soilTypeId[1]:
                return y = 1;
                break;
            case soilTypeId[2]:
                return y = 2;
                break;
            case soilTypeId[3]:
                return y = 3;
                break;
            case soilTypeId[4]:
                return y = 4;
                break;
            case soilTypeId[5]:
                return y = 5;
                break;
            case soilTypeId[6]:
                return y = 6;
                break;
            case soilTypeId[7]:
                return y = 7;
                break;
            case soilTypeId[8]:
                return y = 8;
                break;
            case soilTypeId[9]:
                return y = 9;
                break;
            case soilTypeId[10]:
                return y = 10;
                break;
            case soilTypeId[11]:
                return y = 11;
                break;
            case soilTypeId[12]:
                return y = 12;
                break;

        }
    }
};

/**
 * Nitrate calculations
 * @constructor
 */
var Nitrates = function () {
    var nitratesPPM = 0,
        subwatershedData = global.data[global.year].subwatershed.data,
    // Holds the multiplier accumulators for each subwatershed
        subwatershed = [],
        ppmSubwatershed = [];

    for (var i = 0; i < subwatershedArea.length; i++) {
        var arr = {"row": 0,
            "wetland": 0,
            "conservation": 0,
            "precipitation": 0};

        subwatershed.push(arr);
    }

    var landcover = global.data[global.year].baselandcover.data,
        wetland = global.data[global.year].wetland.data,
        watershedPercent = [],
        max = 100 * 0.14 * 2.11, min = 2,
        soilType = global.data[global.year].soiltype.data,
        dataPointArea = global.data[global.year].area.data;

    this.update = function (i) {
        var f = subwatershedData[i];
        if (subwatershed[f] != null) {

            subwatershed[f].row += setRowCropMultiplier(i);
            subwatershed[f].wetland += setWetlandMultiplier(i);
            subwatershed[f].conservation += setConservationMultiplier(i);
        }
        subwatershed[f].precipitation = setPrecipitationMultiplier(i);
    };

    function setRowCropMultiplier(i) {
        if ((landcover[i] > 0 && landcover[i] < 6) || landcover[i] == 15) {
            return dataPointArea[i];
        } else {
            return 0;
        }
    }

    function setWetlandMultiplier(i) {
        if (wetland[i] == 1 && landcover[i] == 14) {
            return 1;
        } else {
            return 0;
        }
    }

    function setConservationMultiplier(i) {
        if (landcover[i] == 2 || landcover[i] == 4) {
            if (soilType[i] == "A" || soilType[i] == "B" || soilType[i] == "C" || soilType[i] == "L" || soilType[i] == "N" || soilType[i] == "O") {
                return dataPointArea[i] * 0.69;
            } else {
                return dataPointArea[i] * 0.62;
            }
        } else {
            return dataPointArea[i];
        }
    }

    function setPrecipitationMultiplier(i) {
        var p = global.precipitation[global.year];
        if (p == 24.58 || p == 28.18) // If it's a dry year
        {
            return 0.86;
        } else if (p == 30.39 || p == 32.16 || p == 34.34) { // If it's a normal year
            if (global.precipitation[global.year - 1] == 24.58 || global.precipitation[global.year - 1] == 28.18) {
                return 1.69;
            } else {
                return 1;
            }
        } else { // If it's a flood year
            if (global.precipitation[global.year - 1] == 24.58 || global.precipitation[global.year - 1] == 28.18) {
                return 2.11;
            } else {
                return 1;
            }
        }
    }

    function mapIt()	// The function updates the data for the watershed Nitrate map
    {
        if (subwatershed == undefined || subwatershed.length == null) {
            return console.alert("The subwatersheds are not defined. Try Nitrates.update() before calling this function.");
        }
        for (var i = 1; i < subwatershed.length; i++) {
            nitratesPPM += (subwatershedArea[i] * ppmSubwatershed[i]) / watershedArea;
        }

        for (var i = 1; i < subwatershed.length; i++) {
            watershedPercent[i] = ppmSubwatershed[i] * (subwatershedArea[i] / watershedArea) / nitratesPPM;
            global.watershedPercent[i] = watershedPercent[i];
        }
    }

    this.calculate = function () {

        for (var i = 0; i < subwatershedArea.length; i++) {
            var row = 0, wet = 0, cons = 0, precip = 0;
            if (subwatershedArea[i] != null && subwatershed != undefined && subwatershedArea[i] != 0) {
                if (subwatershed[i].row != null) {
                    row = 0.14 * (subwatershed[i].row / subwatershedArea[i]);
                } else {
                    row = 0;
                }
                if (subwatershed[i].wetland != 0 && subwatershed[i].wetland != null) {
                    wet = 0.6;
                } else {
                    wet++;
                }
                if (subwatershed[i].conservation != 0 && subwatershed[i].conservation != null) {
                    cons = (subwatershed[i].conservation / subwatershedArea[i]);
                } else {
                    cons = 0;
                }
                /*
                 if(subwatershed[i].precipitation != 0 && subwatershed[i].precipitation != null)
                 {
                 precip += subwatershed[i].precipitation / subwatershedArea[i];
                 } else {
                 precip += 0;
                 }*/

                precip = setPrecipitationMultiplier(i);
                console.log(row, wet, cons, precip);
            }
            if ((100 * row * wet * cons * precip) < 2) {
                ppmSubwatershed[i] = 2;
            } else {
                ppmSubwatershed[i] = 100 * row * wet * cons * precip;
            }
            //console.log("Crop: " + row);
            //console.log("Wetland: " + wet);
            //console.log("Conservation: " + cons);
            //console.log("Precipitation: " + precip);
            //console.log("Subwatershed PPM: " + ppmSubwatershed[i]);
        }

        mapIt();
        console.log(watershedArea);
        console.log("Nitrates PPM: " + nitratesPPM, max, min);
        dataset[7]['Year' + global.year] = 100 * ((max - nitratesPPM) / (max - min));
        dealloc();
    };

    function dealloc() {

    }
};

/**
 * Carbon calculations
 * @constructor
 */
var Carbon = function () {
    var landCover = global.data[global.year].baselandcover.data;
    var carbonMultiplier = [0, 161.87, 0, 161.87, 202.34, 117.36, 117.36, 117.36, 433.01, 1485.20, 1485.20, 485.62, 1897.98, 1234.29, 0];
    var carbon = 0;
    var max = 1897.98 * watershedArea;
    var min = 485.6,
        dataPointArea = global.data[global.year].area.data;
    //console.log(max);
    this.update = function (i) {
        setCarbon(i);
    };

    function setCarbon(i) {
        //console.log("j");
        carbon += carbonMultiplier[landCover[i] - 1] * dataPointArea[i];
        //console.log(carbon);
        //console.log(landCoverArea[landCover[i]]);
        //pewiData[21][i] = carbonMultiplier[i-1]*10;
    }

    this.calculate = function () {
        // Needs a look-see
        dataset[9]["Year" + global.year] = 100 * (carbon - min) / (max - min);
        carbon = 0;
    }
};

/**
 * Biodiversity calculations
 * @constructor
 */
var Biodiversity = function () {
    var data = global.data[global.year].group.data;
    var cols = global.data[global.year].columns, rows = global.data[global.year].rows,
        dataPointArea = global.data[global.year].area.data;
    // Group ID,Count,proportion,percent of watershed
    var heterogeneityGroup = [
        ["Low Spatial Low Temporal", 0, 0, 0],
        ["Low Spatial Medium Temporal", 0, 0, 0], 		// 1
        ["Low Spatial Medium Temporal 2", 0, 0, 0],
        ["Low Spatial High Temporal", 0, 0, 0],		// 3
        ["Medium Spatial Low Temporal", 0, 0, 0],
        ["Medium Spatial Medium Temporal", 0, 0, 0],	// 5
        ["Medium Spatial Medium Temporal 2", 0, 0, 0],
        ["High Spatial High Temporal", 0, 0, 0],		// 7
        ["High Spatial High Temporal 2", 0, 0, 0],
        ["High Spatial High Temporal 3", 0, 0, 0], 	// 9
        ["High Spatial High Temporal 4", 0, 0, 0]
    ];
    var distinctCount = 0;

    var adjSubtotal = {
        0: 0,
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
        6: 0,
        7: 0,
        8: 0,
        9: 0,
        10: 0
    };

    var adjacencyGroup = [
        ["low-low -> low-low", 0, 0],
        ["low-low -> low-medium", 0, 0],
        ["low-low -> low-medium 2", 0, 0],
        ["low-low -> low-high", 0, 0],
        ["low-low -> medium-low", 0, 0],
        ["low-low -> medium-medium", 0, 0],
        ["low-low -> medium-medium 2", 0, 0],
        ["low-low -> high-high", 0, 0],
        ["low-low -> high-high 2", 0, 0],
        ["low-low -> high-high 3", 0, 0],
        ["low-low -> high-high 4", 0, 0],
        ["low-medium -> low-low", 0, 0],
        ["low-medium -> low-medium", 0, 0],
        ["low-medium -> low-medium 2", 0, 0],
        ["low-medium -> low-high", 0, 0],
        ["low-medium -> medium-low", 0, 0],
        ["low-medium -> medium-medium", 0, 0],
        ["low-medium -> medium-medium 2", 0, 0],
        ["low-medium -> high-high", 0, 0],
        ["low-medium -> high-high 2", 0, 0],
        ["low-medium -> high-high 3", 0, 0],
        ["low-medium -> high-high 4", 0, 0],
        ["low-medium 2 -> low-low", 0, 0],
        ["low-medium 2 -> low-medium", 0, 0],
        ["low-medium 2 -> low-medium 2", 0, 0],
        ["low-medium 2 -> low-high", 0, 0],
        ["low-medium 2 -> medium-low", 0, 0],
        ["low-medium 2 -> medium-medium", 0, 0],
        ["low-medium 2 -> medium-medium 2", 0, 0],
        ["low-medium 2 -> high-high", 0, 0],
        ["low-medium 2 -> high-high 2", 0, 0],
        ["low-medium 2 -> high-high 3", 0, 0],
        ["low-medium 2 -> high-high 4", 0, 0],
        ["low-high -> low-low", 0, 0],
        ["low-high -> low-medium", 0, 0],
        ["low-high -> low-medium 2", 0, 0],
        ["low-high -> low-high", 0, 0],
        ["low-high -> medium-low", 0, 0],
        ["low-high -> medium-medium", 0, 0],
        ["low-high -> medium-medium 2", 0, 0],
        ["low-high -> high-high", 0, 0],
        ["low-high -> high-high 2", 0, 0],
        ["low-high -> high-high 3", 0, 0],
        ["low-high -> high-high 4", 0, 0],
        ["medium-low -> low-low", 0, 0],
        ["medium-low -> low-medium", 0, 0],
        ["medium-low -> low-medium 2", 0, 0],
        ["medium-low -> low-high", 0, 0],
        ["medium-low -> medium-low", 0, 0],
        ["medium-low -> medium-medium", 0, 0],
        ["medium-low -> medium-medium 2", 0, 0],
        ["medium-low -> high-high", 0, 0],
        ["medium-low -> high-high 2", 0, 0],
        ["medium-low -> high-high 3", 0, 0],
        ["medium-low -> high-high 4", 0, 0],
        ["medium-medium -> low-low", 0, 0],
        ["medium-medium -> low-medium", 0, 0],
        ["medium-medium -> low-medium 2", 0, 0],
        ["medium-medium -> low-high", 0, 0],
        ["medium-medium -> medium-low", 0, 0],
        ["medium-medium -> medium-medium", 0, 0],
        ["medium-medium -> medium-medium 2", 0, 0],
        ["medium-medium -> high-high", 0, 0],
        ["medium-medium -> high-high 2", 0, 0],
        ["medium-medium -> high-high 3", 0, 0],
        ["medium-medium -> high-high 4", 0, 0],
        ["medium-medium 2 -> low-low", 0, 0],
        ["medium-medium 2 -> low-medium", 0, 0],
        ["medium-medium 2 -> low-medium 2", 0, 0],
        ["medium-medium 2 -> low-high", 0, 0],
        ["medium-medium 2 -> medium-low", 0, 0],
        ["medium-medium 2 -> medium-medium", 0, 0],
        ["medium-medium 2 -> medium-medium 2", 0, 0],
        ["medium-medium 2 -> high-high", 0, 0],
        ["medium-medium 2 -> high-high 2", 0, 0],
        ["medium-medium 2 -> high-high 3", 0, 0],
        ["medium-medium 2 -> high-high 4", 0, 0],
        ["high-high -> low-low", 0, 0],
        ["high-high -> low-medium", 0, 0],
        ["high-high -> low-medium 2", 0, 0],
        ["high-high -> low-high", 0, 0],
        ["high-high -> medium-low", 0, 0],
        ["high-high -> medium-medium", 0, 0],
        ["high-high -> medium-medium 2", 0, 0],
        ["high-high -> high-high", 0, 0],
        ["high-high -> high-high 2", 0, 0],
        ["high-high -> high-high 3", 0, 0],
        ["high-high -> high-high 4", 0, 0],
        ["high-high 2 -> low-low", 0, 0],
        ["high-high 2 -> low-medium", 0, 0],
        ["high-high 2 -> low-medium 2", 0, 0],
        ["high-high 2 -> low-high", 0, 0],
        ["high-high 2 -> medium-low", 0, 0],
        ["high-high 2 -> medium-medium", 0, 0],
        ["high-high 2 -> medium-medium 2", 0, 0],
        ["high-high 2 -> high-high", 0, 0],
        ["high-high 2 -> high-high 2", 0, 0],
        ["high-high 2 -> high-high 3", 0, 0],
        ["high-high 2 -> high-high 4", 0, 0],
        ["high-high 3 -> low-low", 0, 0],
        ["high-high 3 -> low-medium", 0, 0],
        ["high-high 3 -> low-medium 2", 0, 0],
        ["high-high 3 -> low-high", 0, 0],
        ["high-high 3 -> medium-low", 0, 0],
        ["high-high 3 -> medium-medium", 0, 0],
        ["high-high 3 -> medium-medium 2", 0, 0],
        ["high-high 3 -> high-high", 0, 0],
        ["high-high 3 -> high-high 2", 0, 0],
        ["high-high 3 -> high-high 3", 0, 0],
        ["high-high 3 -> high-high 4", 0, 0],
        ["high-high 4 -> low-low", 0, 0],
        ["high-high 4 -> low-medium", 0, 0],
        ["high-high 4 -> low-medium 2", 0, 0],
        ["high-high 4 -> low-high", 0, 0],
        ["high-high 4 -> medium-low", 0, 0],
        ["high-high 4 -> medium-medium", 0, 0],
        ["high-high 4 -> medium-medium 2", 0, 0],
        ["high-high 4 -> high-high", 0, 0],
        ["high-high 4 -> high-high 2", 0, 0],
        ["high-high 4 -> high-high 3", 0, 0],
        ["high-high 4 -> high-high 4", 0, 0]
    ];
    var adjacencySubtotal = 0,
        nativePerennialsArea = 0, nativePerennialsPercent,
        nonNativePerennialsArea = 0, nonNativePerennialsPercent,
        streamBufferArea = 0, streamBufferPercent,
        wetlandArea = 0, wetlandPercent,
        strategicWetlandArea = 0, strategicWetlandPercent,
        forestArea = 0, forestPercent;

    var nativePNindex = 0, nonNativePNindex = 0, pGindex = 0, streamNindex = 0,
        streamGindex = 0, wetlandNindex = 0, wetlandGindex = 0, forestGindex = 0;

    this.update = function (i) {
        setHeterogeneityGroup(i);

        setNativePerennialsArea(i);
        setNonNativePerennialsArea(i);
        setStreamBufferArea(i);
        setWetlandArea(i);
        setStrategicWetlandArea(i);
        setForestArea(i);
    };
    var x = 0;
    this.updateAdj = function (i) {
        if (x < heterogeneityGroup.length) {
            setHeterogeneityGroupProportions(x);
            setHeterogeneityGroupDistinctCount(x);
        }
        x++;
        setAdjacencyGroup(i);
        //setAdjacencyGroupCount(i);
        setAdjacencyGroupSubtotal(i);
    };
    var contagion = 0;
    this.calculate = function () {
        //console.log(adjacencyGroup);
        //console.log(heterogeneityGroup);
        setAdjacencyGroupProportion();
        //console.log(heterogeneityGroup);
        //console.log("Adjacency Subtotal: " + adjacencySubtotal);
        //console.log(adjacencyGroup);
        var x = 0, y = 0;
        for (var i = 0; i < heterogeneityGroup.length; i++) {
            for (var j = 0; j < 11; j++) {
                if (adjacencyGroup[y][2] != 0 && heterogeneityGroup[i][2] != 0) {
                    var product1 = heterogeneityGroup[i][2] * adjacencyGroup[y][2];
                    var product2 = Math.log(heterogeneityGroup[i][2] * adjacencyGroup[y][2]);
                    //console.log(product2, "Het: " + heterogeneityGroup[i][2], "Adj: " + adjacencyGroup[j][2]);
                    x += adjacencyGroup[y][2];
                    contagion += (product1 * product2);
                    //console.log("Heterogeneity: " + heterogeneityGroup[i][2], "Adj: " + adjacencyGroup[y][2]);
                    //console.log("Product1: " + product1, "Product2: " + product2);
                    //console.log("Numerator: " + (product1 * product2));
                    //console.log(j);
                }
                y++;
            }
        }
        //console.log(x);
        //console.log(distinctCount);

        var product3 = 2 * Math.log(distinctCount);
        //console.log(contagion, "Denomimator: " + product3, (contagion/product3));
        contagion = 1 + (contagion / product3);
        //console.log("Contagion: " + contagion, "Product3: " + product3);
        //console.log(contagion);
        setNativePerennialsPercent();
        setNonNativePerennialsPercent();
        setStreamBufferPercent();
        setWetlandPercent();
        setStrategicWetlandPercent();
        setForestPercent();
        setTheIndexes();
        setNativeIndex();
        setGameIndex();

        global.strategicWetland = {
            actual: strategicWetlandArea,
            possible: strategicArea
        };
        global.streamNetwork = streamBufferPercent;
        // dataset[x]["Year"+global.year] = setGameIndex();
        // dataset[x]["Year"+global.year] = setNativeIndex();
    };

    /**
     * Sets the following Biodiversity indices:
     * -Native Perennials Native Index
     * -Non-native Perennials Native Index
     * -Perennials Points Game Index
     * -Stream Buffer Points Native Index
     * -Stream Buffer Points Game Index
     * -Wetland Points Native Index
     * -Wetland Points Game Index
     * -Forest Points Game Index
     */
    function setTheIndexes() {
        // Native Perennials Native Index
        if (nativePerennialsPercent >= 0.05 && nativePerennialsPercent < 0.25) {
            nativePNindex = 1;
        }
        else if (nativePerennialsPercent >= 0.25 && nativePerennialsPercent < 0.50) {
            nativePNindex = 2;
        }
        else if (nativePerennialsPercent >= 0.50) {
            nativePNindex = 3;
        }

        // Non-Native Perennials Native Index
        if (nonNativePerennialsPercent >= 0.05 && nonNativePerennialsPercent < 0.25) {
            nonNativePNindex = 1;
        }
        else if (nonNativePerennialsPercent >= 0.25 && nonNativePerennialsPercent < 0.50) {
            nonNativePNindex = 2;
        }
        else if (nonNativePerennialsPercent >= 0.50) {
            nonNativePNindex = 3;
        }

        // Perennials Points Game Index
        if (nativePerennialsPercent + nonNativePerennialsPercent >= 0.05 && nativePerennialsPercent + nonNativePerennialsPercent < 0.25) {
            pGindex = 1;
        }
        else if (nativePerennialsPercent + nonNativePerennialsPercent >= 0.25 && nativePerennialsPercent + nonNativePerennialsPercent < 0.50) {
            pGindex = 2;
        }
        else if (nativePerennialsPercent + nonNativePerennialsPercent >= 0.50) {
            pGindex = 3;
        }

        // Steam Buffer Points Native Index
        if (streamBufferPercent >= 0.50 && streamBufferPercent < 1) {
            streamNindex = 1;
        }
        else if (streamBufferPercent == 1) {
            streamNindex = 2;
        }

        // Stream Buffer Points Game Index
        if (streamBufferPercent >= 0.3 && streamBufferPercent < 0.7) {
            streamGindex = 1;
        } else if(streamBufferPercent >= 0.7) {
            streamGindex = 2;
        } else streamGindex = 0;

        // Wetland Points Native Index
        if (wetlandPercent >= 0.05 && strategicWetlandPercent >= 0.50) {
            wetlandNindex = 2;
        }

        // Wetland Points Game Index
        if (wetlandPercent >= 0.05 && strategicWetlandPercent >= 0.5) {
            wetlandGindex = 1;
        }

        // Forest Points Game Index
        if (forestPercent >= 0.2) {
            forestGindex = 1;
        }
    }

    function setNativeIndex() {
        // Calculated once per watershed
        //console.log("Contagion Native Index: " + getContagionPointsNativeIndex());
        //console.log("Native Perennial Native Index: " + nativePNindex);
        //console.log("Non N Perennials Native Index: " + nonNativePNindex);
        //console.log("Stream Native Index: " + streamNindex);
        //console.log("Wetland Native Index: " + wetlandNindex);
        dataset[11]['Year' + global.year] = 10 * (getContagionPointsNativeIndex() + nativePNindex + nonNativePNindex + streamNindex + wetlandNindex);
    }

    function setGameIndex() {
        // Calculated once per watershed
        //console.log("Contagion Game Index: " + getContagionPointsGameIndex());
        //console.log("Perennial Game Index: " + pGindex);
        //console.log("Stream Game Index: " + streamGindex);
        //console.log("Wetland Game Index: " + wetlandGindex);
        //console.log("Forest Game Index: " + forestGindex);
        dataset[10]['Year' + global.year] = 10 * (getContagionPointsGameIndex() + pGindex + streamGindex + wetlandGindex + forestGindex);
    }

    function getContagionPointsNativeIndex() {
        // Calculated once per watershed
        if (contagion >= 0 && contagion < 0.15) return 1.5;
        else if (contagion >= 0.15 && contagion < 0.35) return 1;
        else if (contagion >= 0.35) return 0.5;
        else return 0;
    }

    function getContagionPointsGameIndex() {
        // Calculated once per watershed
        if (contagion >= 0 && contagion < 0.15) return 3;
        else if (contagion >= 0.15 && contagion < 0.35) return 2;
        else if (contagion >= 0.55) return 1;
        else return 0;
    }

    function setHeterogeneityGroup(j) {
        // Calculates for each point in the watershed (attached to main loop)
        // Heterogeneity group setter
        // Heterogeneity group count setter
        switch (global.data[global.year].baselandcover.data[j]) {
            case 1:
                global.data[global.year].group.data[j] = 0;        // Set Hetero Group in pewiData to identified group
                heterogeneityGroup[0][1]++; // Add 1 to count for Low Spatial Low Temporal
                break;
            case 2:
                global.data[global.year].group.data[j] = 4;
                heterogeneityGroup[4][1]++;
                break;
            case 3:
                global.data[global.year].group.data[j] = 0;
                heterogeneityGroup[0][1]++;
                break;
            case 4:
                global.data[global.year].group.data[j] = 4;
                heterogeneityGroup[4][1]++;
                break;
            case 5:
                global.data[global.year].group.data[j] = 1;
                heterogeneityGroup[1][1]++;
                break;
            case 6:
                global.data[global.year].group.data[j] = 0;
                heterogeneityGroup[0][1]++;
                break;
            case 7:
                global.data[global.year].group.data[j] = 5;
                heterogeneityGroup[5][1]++;
                break;
            case 8:
                global.data[global.year].group.data[j] = 2;
                heterogeneityGroup[2][1]++;
                break;
            case 9:
                global.data[global.year].group.data[j] = 7;
                heterogeneityGroup[7][1]++;
                break;
            case 10:
                global.data[global.year].group.data[j] = 8;
                heterogeneityGroup[8][1]++;
                break;
            case 11:
                global.data[global.year].group.data[j] = 6;
                heterogeneityGroup[6][1]++;
                break;
            case 12:
                global.data[global.year].group.data[j] = 2;
                heterogeneityGroup[2][1]++;
                break;
            case 13:
                global.data[global.year].group.data[j] = 3;
                heterogeneityGroup[3][1]++;
                break;
            case 14:
                global.data[global.year].group.data[j] = 9;
                heterogeneityGroup[9][1]++;
                break;
            case 15:
                global.data[global.year].group.data[j] = 10;
        }
    }

    function setHeterogeneityGroupProportions(i) {
        // Calculates for each hetero group (attached to secondary loop)
        // Heterogeneity group proportion setter
        //console.log(heterogeneityGroup[i][1], watershedArea);
        heterogeneityGroup[i][2] = heterogeneityGroup[i][1] / (dataPointArea);
    }

    function setHeterogeneityGroupDistinctCount(i) {
        // Calculates for each hetero group (attached to secondary loop)
        if (heterogeneityGroup[i][1] > 0)
            distinctCount++;
    }

    function setAdjacencyGroup(i) {
        try {
            // Calculates for each point in the watershed
            if (i > cols + 1 + 1 && data[i - (cols + 1)] != undefined) {
                //console.log(i);
                //console.log(global.data[global.year].group.data[i]);
                //console.log(global.data[global.year].group.data[i-(cols+1)]);
                //console.log(((global.data[global.year].group.data[i]*10) + global.data[global.year].group.data[i-1]));

                adjacencyGroup[((data[i] * 11) + data[i - (cols + 1)])][1]++;
                adjSubtotal[data[i - (cols + 1)]]++;

//            console.assert(data[i] == undefined, adjacencyGroup);
            }
            //global.data[global.year].group.data[i-(cols)] != undefined && parseInt(global.data[global.year].group.data[i-(cols)]) >= 0
            if (i > cols + 1 && data[i - (cols)] != undefined) {
                adjacencyGroup[((data[i] * 11) + data[i - (cols)])][1]++;
                adjSubtotal[data[i - (cols)]]++;
            }
            if (i > cols && data[i - (cols - 1)] != undefined) {
                adjacencyGroup[((data[i] * 11) + data[i - (cols - 1)])][1]++;
                adjSubtotal[data[i - (cols - 1)]]++;
            }
            if (i > 1 && data[i - 1] != undefined) {
                adjacencyGroup[((data[i] * 11) + data[i - 1])][1]++;
                adjSubtotal[data[i - 1]]++;
            }
            if (data[i + 1] != undefined) {
                adjacencyGroup[((data[i] * 11) + data[i + 1])][1]++;
                adjSubtotal[data[i + 1]]++;
            }
            if (data[i + (cols - 1)] != undefined) {
                //console.log(global.data[global.year].group.data[i+(cols-1)]);
                adjacencyGroup[((data[i] * 11) + data[i + (cols - 1)])][1]++;
                adjSubtotal[data[i + (cols - 1)]]++;
            }
            if (data[i + (cols)] != undefined) {
                adjacencyGroup[((data[i] * 11) + data[i + (cols)])][1]++;
                adjSubtotal[data[i + (cols)]]++;
            }
            if (data[i + (cols + 1)] != undefined) {
                adjacencyGroup[((data[i] * 11) + data[i + (cols + 1)])][1]++;
                adjSubtotal[data[i + (cols + 1)]]++;
            }
        } catch(error) {
            console.warn(error + " in setAdjacencyGroup");
        }
    }

    function setAdjacencyGroupCount(i) {
        // Calculates for each point in the watershed
        adjacencyGroup[global.data[global.year].group.data[i]][1]++;
    }

    function setAdjacencyGroupSubtotal(i) {
        // Calculates for each point in the watershed
        if (global.data[global.year].group.data[i - (cols + 1)] == global.data[global.year].group.data[i]) {
            adjacencySubtotal++;
        }
        if (global.data[global.year].group.data[i - (cols)] == global.data[global.year].group.data[i]) {
            adjacencySubtotal++;
        }
        if (global.data[global.year].group.data[i - (cols - 1)] == global.data[global.year].group.data[i]) {
            adjacencySubtotal++;
        }
        if (global.data[global.year].group.data[i - 1] == global.data[global.year].group.data[i]) {
            adjacencySubtotal++;
        }
        if (global.data[global.year].group.data[i + 1] == global.data[global.year].group.data[i]) {
            adjacencySubtotal++;
        }
        if (global.data[global.year].group.data[i + (cols - 1)] == global.data[global.year].group.data[i]) {
            adjacencySubtotal++;
        }
        if (global.data[global.year].group.data[i + (cols)] == global.data[global.year].group.data[i]) {
            adjacencySubtotal++;
        }
        if (global.data[global.year].group.data[i + (cols + 1)] == global.data[global.year].group.data[i]) {
            adjacencySubtotal++;
        }
    } // Needs deleted
    function setAdjacencyGroupProportion() {
        var x = 0;
        //console.log(adjSubtotal);
        for (var i = 0; i < 11; i++) {
            for (var j = 0; j < 11; j++) {
                if (adjSubtotal[i] != 0) {
                    adjacencyGroup[x][2] = adjacencyGroup[x][1] / adjSubtotal[i];
                }
                x++;
            }
        }
    }

    function setNativePerennialsArea(i) {
        if (global.data[global.year].baselandcover.data[i] == 9 || global.data[global.year].baselandcover.data[i] == 10 || global.data[global.year].baselandcover.data[i] == 14) {
            nativePerennialsArea += dataPointArea[i];
        }
    }

    function setNativePerennialsPercent() {
        nativePerennialsPercent = nativePerennialsArea / watershedArea;
    }

    function setNonNativePerennialsArea(i) {
        if (global.data[global.year].baselandcover.data[i] == 2 || global.data[global.year].baselandcover.data[i] == 4 || global.data[global.year].baselandcover.data[i] == 7 || global.data[global.year].baselandcover.data[i] == 11 || global.data[global.year].baselandcover.data[i] == 12) {
            nonNativePerennialsArea += dataPointArea[i];
        }
    }

    function setNonNativePerennialsPercent() {
        nonNativePerennialsPercent = nonNativePerennialsArea / watershedArea;
    }

    function setStreamBufferArea(i) {
        if (global.data[global.year].streamnetwork.data[i] == 1) {
            if (global.data[global.year].baselandcover.data[i] == 2 || global.data[global.year].baselandcover.data[i] == 4 || global.data[global.year].baselandcover.data[i] == 7 || global.data[global.year].baselandcover.data[i] == 9 || global.data[global.year].baselandcover.data[i] == 10 || global.data[global.year].baselandcover.data[i] == 11 || global.data[global.year].baselandcover.data[i] == 14) {
                streamBufferArea += dataPointArea[i];
            }
        }
    }

    function setStreamBufferPercent() {
        //console.log("Stream Buffer Area: " + streamBufferArea);
        //console.log("Stream Area: " + streamArea);
        streamBufferPercent = streamBufferArea / streamArea;
    }

    function setWetlandArea(i) {
        if (global.data[global.year].baselandcover.data[i] == 14) {
            wetlandArea += dataPointArea[i];
        }
    }

    function setWetlandPercent() {
        wetlandPercent = wetlandArea / watershedArea;
    }

    function setStrategicWetlandArea(i) {
        if (global.data[global.year].wetland.data[i] == 1) {
            if (global.data[global.year].baselandcover.data[i] == 14) {
                strategicWetlandArea++;
            }
        }
    }

    function setStrategicWetlandPercent() {
        strategicWetlandPercent = strategicWetlandArea / strategicArea;
    }

    function setForestArea(i) {
        if (global.data[global.year].baselandcover.data[i] == 10 || global.data[global.year].baselandcover.data[i] == 11) {
            forestArea += dataPointArea[i];
        }
    }

    function setForestPercent() {
        forestPercent = forestArea / watershedArea;
    }
};

/**
 * Erosion calculations
 * @constructor
 */
var Erosion = function () {
    var SOILTESTPDRAINAGEFACTOR = 0.1,
        drainageclass = getSubdataValueWithName("drainageclass", global.year),
        landcover = getSubdataValueWithName("baselandcover", global.year),
        soiltype = getSubdataValueWithName("soiltype", global.year),
        topography = getSubdataValueWithName("topography", global.year),
        streamnetwork = getSubdataValueWithName("streamnetwork", global.year),
        subwatershed = getSubdataValueWithName("subwatershed", global.year),
        wetland = getSubdataValueWithName("wetland", global.year),
        cols = 23,
        rows = 36,
        subwatersheds = [],
        subwatershedSubsurfaceDrainageComponent = 0,
        subwatershedRunoffComponent = 0,
        subwatershedErosionComponent = 0,
        pIndex = [],
        risk = [], grossErosion = [], phosBufferedStreamMultiplier = [],
        phosphorusWetlandMultiplier = [], phosphorusLoad = 0,
        sedimentDeliveredMin = 0, sedimentDeliveredMax = 0,
        datapointarea = getSubdataValueWithName("area", global.year),
        phosphorusLoadMax = 0, phosphorusLoadMin = 0,
        erosionMax = 0, erosionMin = 0;

    global.sedimentDelivered[global.year] = 0;
    global.grossErosion[global.year] = 0;
    global.phosphorusLoad[global.year] = 0;

    for (var i = 0; i < subwatershedArea.length; i++) {
        var arr = {
            erosion: 0,
            runoff: 0,
            drainage: 0,
            pindex: 0,
            streamMultiplier: 0
        };
        subwatersheds.push(arr);
    }

    this.update = function (i) {
        risk[i] = pIndexRiskAssessment(pIndex[i]);
        global.sedimentDelivered[global.year] += getSedimentDelivered(i);
        global.grossErosion[global.year] += getGrossErosion(i);
        global.phosphorusLoad[global.year] += phosphorusIndex(i, false) * datapointarea[i] / 2000;
        // Max & Min Values
        sedimentDeliveredMax += getSedimentDeliveredMax(i);
        sedimentDeliveredMin += getSedimentDeliveredMin(i);
        phosphorusLoadMax += getPhosphorusLoadMax(i);
        phosphorusLoadMin += getPhosphorusLoadMin(i);
        erosionMax += getErosionMax(i);
        erosionMin += getErosionMin(i);
    };

    this.calculateStepOne = function () {

    };
    this.calculateStepTwo = function (j) {
    };
    this.calculateStepThree = function () {
        dataset[12]["Year" + global.year] = 100 * ((sedimentDeliveredMax - global.sedimentDelivered[global.year]) / (sedimentDeliveredMax - sedimentDeliveredMin));
        dataset[8]["Year" + global.year] = 100 * ((phosphorusLoadMax - global.phosphorusLoad[global.year]) / (phosphorusLoadMax - phosphorusLoadMin));
        dataset[13]["Year" + global.year] = 100 * ((erosionMax - global.grossErosion[global.year]) / (erosionMax - erosionMin));
//        console.log("Sediment: " + global.sedimentDelivered[global.year], sedimentDeliveredMax, sedimentDeliveredMin);
//        console.log("Phosphorus: " + global.phosphorusLoad[global.year], phosphorusLoadMax, phosphorusLoadMin);
//        console.log("Erosion: " + global.grossErosion[global.year], erosionMax, erosionMin);

        dataset[12]["Value" + global.year] = global.sedimentDelivered[global.year];
        dataset[8]["Value" + global.year] = global.phosphorusLoad[global.year];
        dataset[13]["Value" + global.year] = global.grossErosion[global.year];
    };

    function getSedimentDelivered(i) {
//        console.log(rusle(i, false), ephemeralGullyErosion(i, false), bufferFactor(i, false), datapointarea[i]);
//        console.log(phosphorusIndex(i, false));
        return (((rusle(i, global.precipitation[global.year], false) + ephemeralGullyErosion(i, false)) * sedimentDeliveryRatio(i) * bufferFactor(i, false)) * datapointarea[i]);
    }

    function getGrossErosion(i) {
        var eph = ephemeralGullyErosion(i, false),
            rusl = rusle(i, global.precipitation[global.year], false);
//        console.log(coverManagementFactor(i, false));
//        console.log(eph, rusl);
//        if (rusl + eph >= 2) return 5;
//        else if (rusl + eph < 2 && rusl + eph >= 0.1) return 4;
//        else if (rusl + eph < 0.1 && rusl + eph >= 0.025) return 3;
//        else if (rusl + eph < 0.025 && rusl + eph >= 0.001) return 2;
//        else if (rusl + eph < 0.001) return 1;
//        console.log("hello");
//        console.log((rusl + eph) * datapointarea[i]);
        return (rusl + eph) * datapointarea[i];
    }

    function grossErosionIndex(i) {
        return rusle(i, false) + ephemeralGullyErosion(i, false);
    }

    function pIndexRiskAssessment(pindex) {
        if (pindex >= 0 && pindex <= 1) return "Very Low";
        else if (pindex > 1 && pindex <= 2) return "Low";
        else if (pindex > 2 && pindex <= 5) return "Medium";
        else if (pindex > 5 && pindex <= 15) return "High";
        else if (pindex > 15) return "Very High";
        return "";
    }

    function phosphorusIndex(i, point) {
        return erosionComponent(i, point) + runoffComponent(i, point) + subsurfaceDrainageComponent(i);
    }

    function pWetlandMultiplier(i) {
        if (wetland[i] == 1 && landcover[i] == 14) {
            return 1;
        }
        return 0;
    }
    
    function getErosionMin(i) {
        return ((rusle(i, 24.58, 9) + ephemeralGullyErosion(i, 9)) * datapointarea[i]);
    }
    
    function getErosionMax(i) {
//        console.log(rusle(i, 45.10, 3), ephemeralGullyErosion(i, 3));
//        console.log(rainfallRunoffErosivityFactor(i, 45.1), soilErodibilityFactor(i), slopeLengthSteepnessFactor(i, 3), coverManagementFactor(i, 3), supportPracticeFactor(i, 3));
        return ((rusle(i, 45.10, 3) + ephemeralGullyErosion(i, 3)) * datapointarea[i]);
    }
    
    function getPhosphorusLoadMin(i) {
        return (phosphorusIndex(i, 9) * datapointarea[i] / 2000);
    }
    
    function getPhosphorusLoadMax(i) {
        return (phosphorusIndex(i, 3) * datapointarea[i] / 2000);
    }
    
    function getSedimentDeliveredMin(i) {
    	return (((rusle(i, 24.58, 9) + ephemeralGullyErosion(i, 9)) * sedimentDeliveryRatio(i) * bufferFactor(i, 9)) * datapointarea[i]);
    }

    function getSedimentDeliveredMax(i) {
//        console.log(rusle(i, 2));
//        console.log(rainfallRunoffErosivityFactor(i, 45.10));
//        console.log(soilErodibilityFactor(i));
//        console.log(slopeLengthSteepnessFactor(i, 2));
//        console.log(coverManagementFactor(i, 2));
        return (((rusle(i, 45.10, 3) + ephemeralGullyErosion(i, 3)) * sedimentDeliveryRatio(i) * bufferFactor(i, 3)) * datapointarea[i]);
    }

    function erosionComponent(i, point) {
        //console.log(rusle(i), ephemeralGullyErosion(i), sedimentDeliveryRatio(i), bufferFactor(i), enrichmentFactor(i), soilTestPErosionFactor(i));
        return (rusle(i, global.precipitation[global.year], point) + ephemeralGullyErosion(i, point)) * sedimentDeliveryRatio(i) * bufferFactor(i, point) * enrichmentFactor(i) * soilTestPErosionFactor(i);
    }

    function runoffComponent(i, point) {
        //console.log(runoffFactor(i), precipitationFactor(i), SOILTESTPRUNOFFFACTOR, pApplicationFactor(i));
        var cover = (point != false) ? point : landcover[i];
        return runoffFactor(i, cover) * precipitationFactor() * (getSoilTestPRunoffFactor(i) + getPApplicationFactor(i, cover));
    }

    function subsurfaceDrainageComponent(i) {
        return precipitationFactor() * getFlowFactor(i) * SOILTESTPDRAINAGEFACTOR;
    }

    function rusle(i, precip, point) {
//        console.log(rainfallRunoffErosivityFactor(i), soilErodibilityFactor(i)/*, slopeLengthSteepnessFactor(i, point), coverManagementFactor(i, point), supportPracticeFactor(i, point)*/);
//        console.log(rainfallRunoffErosivityFactor(i, precip));
        return rainfallRunoffErosivityFactor(i, precip) * soilErodibilityFactor(i) * slopeLengthSteepnessFactor(i, point) * coverManagementFactor(i, point) * supportPracticeFactor(i, point);
    }

    function rainfallRunoffErosivityFactor(i, precip) {
        if(precip <= 33.46) {
            return (0.0483 * (Math.pow((precip * 25.4), 1.61))) / 17.02;
        }
        else return (587.8 - (1.219 * precip * 25.4) + (0.004105 * (Math.pow((precip * 25.4), 2)))) / 17.02;
    }

    function soilErodibilityFactor(i) {
        switch (soiltype[i]) {
            case "A":
                return 0.24
                break;
            case "B":
                return 0.2
                break;
            case "C":
                return 0.28
                break;
            case "D":
                return 0.32
                break;
            case "G":
                return 0.32
                break;
            case "K":
                return 0.37
                break;
            case "L":
                return 0.24
                break;
            case "M":
                return 0.28
                break;
            case "N":
                return 0.24
                break;
            case "O":
                return 0.32
                break;
            case "Q":
                return 0.28
                break;
            case "T":
                return 0.28
                break;
            case "Y":
                return 0.37
                break;
        }
    }

    function slopeLengthSteepnessFactor(i, point) {
        var cover = (point != false) ? point : landcover[i];
        if ((cover > 0 && cover < 6) || cover == 15) {
            if (topography[i] == 0) return 0.05;
            else if (topography[i] == 1) return 0.31;
            else if (topography[i] == 2) return 0.67;
            else if (topography[i] == 3) return 1.26;
            else if (topography[i] == 4) return 1.79;
            else if (topography[i] == 5) return 2.2;
        } else if (cover == 6 || cover == 7) {
            if (topography[i] == 0) return 0.05;
            else if (topography[i] == 1) return 0.28;
            else if (topography[i] == 2) return 0.58;
            else if (topography[i] == 3) return 1.12;
            else if (topography[i] == 4) return 1.69;
            else if (topography[i] == 5) return 2.18;
        }
        return 1;
    }

    function coverManagementFactor(i, point) {
        var temp = getSubdataValueWithName("baselandcover", global.year - 1),
            cover = (point !== false) ? point : landcover[i];
        if (temp != undefined) {
            if (temp[i] == 1) {
                if (cover == 1) return 0.15;
                else if (cover == 2) return 0.085;
                else if (cover == 3 || cover == 15) return 0.2;
                else if (cover == 4) return 0.116;
            } if (temp[i] == 2) {
                if (cover == 1) return 0.085;
                else if (cover == 2) return 0.02;
                else if (cover == 3 || cover == 15) return 0.116;
                else if (cover == 4) return 0.031;
            } else if (temp[i] == 3 || temp[i] == 15) {
                if (cover == 1) return 0.26;
                else if (cover == 2) return 0.156;
                else if (cover == 3 || cover == 15) return 0.3;
                else if (cover == 4) return 0.178;
            } else if (temp[i] == 4) {
                if (cover == 1) return 0.156;
                else if (cover == 2) return 0.052;
                else if (cover == 3 || cover == 15) return 0.178;
                else if (cover == 4) return 0.055;
            } else if (temp[i] != 1 || temp[i] != 2 || temp[i] != 3 || temp[i] != 4 || temp[i] != 15) {
                if (cover == 1) return 0.085;
                else if (cover == 2) return 0.052;
                else if (cover == 3 || cover == 15) return 0.116;
                else if (cover == 4) return 0.031;
            }
        }

        if(point != false) {
            if (cover == 3) return 0.3;
            else if (cover == 9) return 0.001;
        }

        if (cover == 1) return 0.085;
        else if (cover == 2) return 0.052;
        else if (cover == 3 || cover == 15) return 0.116;
        else if (cover == 4) return 0.031;
        else if (cover == 5 || cover == 8 || cover == 14) return 0.005;
        else if (cover == 6) return 0.03;
        else if (cover == 7) return 0.02;
        else if (cover == 9 || cover == 12) return 0.001;
        else if (cover == 10 || cover == 11 || cover == 13) return 0.004;
    }

    function supportPracticeFactor(i, point) {
        var slopelimit = slopeLengthLimit(i),
            slopefactor = slopeLengthFactor(i),
            cover = (point != false) ? point : landcover[i];
        //console.log(slopelimit, slopefactor, topography[i]);
        if (slopelimit != null) {
            //console.log(slopelimit, slopefactor, topography[i]);
            if (cover == 2 || cover == 4) {
                if (topography[i] > 1 && slopefactor <= slopelimit) return contourSubfactor(i) * terraceSubfactor(i);
                else if (topography[i] > 1 && slopefactor > slopelimit) return ((slopelimit * contourSubfactor(i) * terraceSubfactor(i)) + (slopelimit - slopefactor)) / slopefactor;
                return 1;
            }
        }
        return 1;
    }

    function slopeLengthFactor(i) {
        if (topography[i] == 0) return 200;
        else if (topography[i] == 1) return 200;
        else if (topography[i] == 2) return 200;
        else if (topography[i] == 3) return 150;
        else if (topography[i] == 4) return 100;
        else if (topography[i] == 5) return 75;
    }

    function slopeLengthLimit(i) {
        if (topography[i] == 0) return null;
        else if (topography[i] == 1) return 400;
        else if (topography[i] == 2) return 300;
        else if (topography[i] == 3) return 200;
        else if (topography[i] == 4) return 120;
        else if (topography[i] == 5) return 80;
    }

    function terraceSubfactor(i) {
        var temp = terraceInterval(i);
        if (temp < 100) return 0.5;
        else if (temp >= 100 && temp < 140) return 0.6;
        else if (temp >= 140 && temp < 180) return 0.7;
        else if (temp >= 180 && temp < 225) return 0.8;
        else if (temp >= 225 && temp < 300) return 0.9;
        else if (temp >= 300) return 1;
    }

    function terraceInterval(i) {
        var temp = slopeSteepnessFactor(i);
        if (temp == 0.002) return 300;
        else if (temp == 0.02) return 240;
        else if (temp == 0.04) return 180;
        else if (temp == 0.08) return 150;
        else if (temp == 0.12) return 120;
        else if (temp == 0.16) return 105;
    }

    function contourSubfactor(i) {
        var temp = slopeSteepnessFactor(i);
        if (landcover[i] == 2 || landcover[i] == 4) {
            if (temp == 0.04) return (0.9 + 0.95) / 2;
            else if (temp == 0.08) return (0.85 + 0.9) / 2;
            else if (temp == 0.12) return 0.9;
            else if (temp == 0.16) return 1;
        }
        return 1;
    }

    function slopeSteepnessFactor(i) {
        if (topography[i] == 0) return 0.002;
        else if (topography[i] == 1) return 0.02;
        else if (topography[i] == 2) return 0.04;
        else if (topography[i] == 3) return 0.08;
        else if (topography[i] == 4) return 0.12;
        else if (topography[i] == 5) return 0.16;
    }

    function ephemeralGullyErosion(i, point) {
        var cover = (point != false) ? point : landcover[i]
        if (cover == 1 || cover == 3 || cover == 15) return 4.5;
        else if (cover == 2 || cover == 4) return 1.5;
        return 0;
    }

    function sedimentDeliveryRatio(i) {
        if (soiltype[i] == 'A' || soiltype[i] == 'B' || soiltype[i] == 'C' || soiltype[i] == 'L' || soiltype[i] == 'N' || soiltype[i] == 'O') return (Math.pow(10, (log10(4/6) * log10(watershedArea) + (log10(4) - (4 * log10(4/6)))))) / 100;
        else if (soiltype[i] == 'D' || soiltype[i] == 'G' || soiltype[i] == 'K' || soiltype[i] == 'M' || soiltype[i] == 'Q' || soiltype[i] == 'T' || soiltype[i] == 'Y') return (Math.pow(10, (log10(26/35) * log10(watershedArea) + (log10(26) - (4 * log10(26/35)))))) / 100;
//        if (distanceToStream < 58.528) return 1;
//        return (distanceToStream ^ sedimentDeliveryRatioSlope(i)) * (10 ^ sedimentDeliveryRatioIntercept(i));
    }

//    function sedimentDeliveryRatioSlope(i) {
//        if (distanceToStream <= 928.393) {
//            if (soiltype[i] == 'A' || soiltype[i] == 'B' || soiltype[i] == 'C' || soiltype[i] == 'L' || soiltype[i] == 'N' || soiltype[i] == 'O') return -0.83308;
//            else if (soiltype[i] == 'D' || soiltype[i] == 'G' || soiltype[i] == 'K' || soiltype[i] == 'M' || soiltype[i] == 'Q' || soiltype[i] == 'T' || soiltype[i] == 'Y') return -0.2905;
//        } else {
//            if (soiltype[i] == 'A' || soiltype[i] == 'B' || soiltype[i] == 'C' || soiltype[i] == 'L' || soiltype[i] == 'N' || soiltype[i] == 'O') return -0.25078;
//            else if (soiltype[i] == 'D' || soiltype[i] == 'G' || soiltype[i] == 'K' || soiltype[i] == 'M' || soiltype[i] == 'Q' || soiltype[i] == 'T' || soiltype[i] == 'Y') return -0.22108;
//        }
//    }
//
//    function sedimentDeliveryRatioIntercept(i) {
//        if (distanceToStream <= 928.393) {
//            if (soiltype[i] == 'A' || soiltype[i] == 'B' || soiltype[i] == 'C' || soiltype[i] == 'L' || soiltype[i] == 'N' || soiltype[i] == 'O') return 1.472351;
//            else if (soiltype[i] == 'D' || soiltype[i] == 'G' || soiltype[i] == 'K' || soiltype[i] == 'M' || soiltype[i] == 'Q' || soiltype[i] == 'T' || soiltype[i] == 'Y') return -0.13786;
//        } else {
//            if (soiltype[i] == 'A' || soiltype[i] == 'B' || soiltype[i] == 'C' || soiltype[i] == 'L' || soiltype[i] == 'N' || soiltype[i] == 'O') return 0.443222;
//            else if (soiltype[i] == 'D' || soiltype[i] == 'G' || soiltype[i] == 'K' || soiltype[i] == 'M' || soiltype[i] == 'Q' || soiltype[i] == 'T' || soiltype[i] == 'Y') return 0.355086;
//        }
//    }
//
//    function setDistanceToStream(i) {
//        var temp;
//        for (var j = 0; j < global.streamIndices[global.year].count; j++) {
//            temp = ((Math.sqrt(43600 * (10 / 6)) * 2 * (row(global.streamIndices[global.year][j]) - row(i))) ^ 2) +
//                ((Math.sqrt(43600 * (10 / 6)) * 3 * (column(global.streamIndices[global.year][j]) - column(i))) ^ 2);
//            if (distanceToStream[i] != undefined) distanceToStream[i] = Math.min(temp, distanceToStream[i]);
//            else distanceToStream[i] = temp;
//        }
//    }

    function row(x) {
        return x % rows;
    } // As needed
    function column(x) {
        return x % cols;
    } // As needed
    function bufferFactor(i, point) {
        var cover = (point != false) ? point : landcover[i];
        if (cover == 2 || cover == 4 || (cover > 7 && cover < 15)) return 0.5;
        return 1;
    } // For every land cover point
    function enrichmentFactor(i) {
        if (landcover[i] == 1 || landcover[i] == 3 || landcover[i] == 15) return 1.1;
        return 1.3;
    } // For every land cover point
    function soilTestPErosionFactor(i) {
        if (soiltype[i] == 'A' || soiltype[i] == 'B' || soiltype[i] == 'C' || soiltype[i] == 'L' || soiltype[i] == 'N' || soiltype[i] == 'O') return 0.83;
        else if (soiltype[i] == 'D' || soiltype[i] == 'G' || soiltype[i] == 'K' || soiltype[i] == 'M' || soiltype[i] == 'Q' || soiltype[i] == 'T' || soiltype[i] == 'Y') return 0.82;
    } // For every land cover point
    function runoffFactor(i, cover) {
        var temp = runoffCurveNumber(i, cover);
        return (0.000000799 * Math.pow(temp, 3)) - (0.0000484 * Math.pow(temp, 2)) + (0.00265 * temp - 0.085)
    } // For every land cover point
    function runoffCurveNumber(i, cover) {
        var hydrogroup = getHydrologicGroup(i),
            flowfactor = getFlowFactor(i);
        if (cover == 1 || cover == 3 || cover == 15) {
            if (topography[i] == 0 || topography[i] == 1) {
                if (hydrogroup == 'A') return 70;
                else if (hydrogroup == 'B' || ((hydrogroup == 'C' || hydrogroup == 'D' || hydrogroup == 'B/D') && flowfactor > 0)) return 79;
                else if (hydrogroup == 'C' && flowfactor == 0) return 84;
                else if ((hydrogroup == 'D' || hydrogroup == 'B/D') && flowfactor == 0) return 88;
            } else if (topography[i] >= 2) {
                if (hydrogroup == 'A') return 72;
                else if (hydrogroup == 'B' || ((hydrogroup == 'C' || hydrogroup == 'D' || hydrogroup == 'B/D') && flowfactor > 0)) return 81;
                else if (hydrogroup == 'C' && flowfactor == 0) return 88;
                else if ((hydrogroup == 'D' || hydrogroup == 'B/D') && flowfactor == 0) return 91;
            }
        } else if (cover == 2 || cover == 4) {
            if (topography[i] == 0 || topography[i] == 1 || topography[i] == 2 || topography[i] == 3) {
                if (hydrogroup == 'A') return 64;
                else if (hydrogroup == 'B' || ((hydrogroup == 'C' || hydrogroup == 'D' || hydrogroup == 'B/D') && flowfactor > 0)) return 74;
                else if (hydrogroup == 'C' && flowfactor == 0) return 81;
                else if ((hydrogroup == 'D' || hydrogroup == 'B/D') && flowfactor == 0) return 85;
            } else if (topography[i] == 4 || topography[i] == 5) {
                if (hydrogroup == 'A') return 61;
                else if (hydrogroup == 'B') return 70;
                else if (hydrogroup == 'C') return 77;
                else if (hydrogroup == 'D') return 80;
            }
        } else if (cover == 5) {
            if (topography[i] == 0 || topography[i] == 1 || topography[i] == 2 || topography[i] == 3) {
                if (hydrogroup == 'A') return 55;
                else if (hydrogroup == 'B' || ((hydrogroup == 'C' || hydrogroup == 'D' || hydrogroup == 'B/D') && flowfactor > 0)) return 69;
                else if (hydrogroup == 'C' && flowfactor == 0) return 78;
                else if ((hydrogroup == 'D' || hydrogroup == 'B/D') && flowfactor == 0) return 83;
            } else if (topography[i] == 4 || topography[i] == 5) {
                if (hydrogroup == 'A') return 58;
                else if (hydrogroup == 'B') return 72;
                else if (hydrogroup == 'C') return 81;
                else if (hydrogroup == 'D') return 85;
            }
        } else if (cover == 6) {
            if (hydrogroup == 'A') return 68;
            else if (hydrogroup == 'B' || ((hydrogroup == 'C' || hydrogroup == 'D' || hydrogroup == 'B/D') && flowfactor > 0)) return 79;
            else if (hydrogroup == 'C' && flowfactor == 0) return 86;
            else if ((hydrogroup == 'D' || hydrogroup == 'B/D') && flowfactor == 0) return 89;
        } else if (cover == 7) {
            if (hydrogroup == 'A') return 49;
            else if (hydrogroup == 'B' || ((hydrogroup == 'C' || hydrogroup == 'D' || hydrogroup == 'B/D') && flowfactor > 0)) return 69;
            else if (hydrogroup == 'C' && flowfactor == 0) return 79;
            else if ((hydrogroup == 'D' || hydrogroup == 'B/D') && flowfactor == 0) return 84;
        } else if (cover == 8 || cover == 13) {
            if (hydrogroup == 'A') return 30;
            else if (hydrogroup == 'B' || ((hydrogroup == 'C' || hydrogroup == 'D' || hydrogroup == 'B/D') && flowfactor > 0)) return 58;
            else if (hydrogroup == 'C' && flowfactor == 0) return 71;
            else if ((hydrogroup == 'D' || hydrogroup == 'B/D') && flowfactor == 0) return 78;
        } else if (cover == 9) {
            if (hydrogroup == 'A') return 30;
            else if (hydrogroup == 'B' || ((hydrogroup == 'C' || hydrogroup == 'D' || hydrogroup == 'B/D') && flowfactor > 0)) return 48;
            else if (hydrogroup == 'C' && flowfactor == 0) return 65;
            else if ((hydrogroup == 'D' || hydrogroup == 'B/D') && flowfactor == 0) return 73;
        } else if (cover == 10 || cover == 11 || cover == 14) {
            if (hydrogroup == 'A') return 30;
            else if (hydrogroup == 'B' || ((hydrogroup == 'C' || hydrogroup == 'D' || hydrogroup == 'B/D') && flowfactor > 0)) return 55;
            else if (hydrogroup == 'C' && flowfactor == 0) return 70;
            else if ((hydrogroup == 'D' || hydrogroup == 'B/D') && flowfactor == 0) return 77;
        }
        return 1;
    } // For every land cover point
    function getHydrologicGroup(i) {
        switch (soiltype[i]) {
            case 'A':
                return 'B';
                break;
            case 'B':
                return 'B';
                break;
            case 'C':
                return 'B/D';
                break;
            case 'D':
                return 'B';
                break;
            case 'G':
                return 'C';
                break;
            case 'K':
                return 'B/D';
                break;
            case 'L':
                return 'B/D';
                break;
            case 'M':
                return 'B';
                break;
            case 'N':
                return 'B';
                break;
            case 'O':
                return 'B/D';
                break;
            case 'Q':
                return 'B';
                break;
            case 'T':
                return 'B';
                break;
            case 'Y':
                return 'B';
                break;
            default:
                break;
        }
        return "";
    }
    function precipitationFactor() {
        return global.precipitation[global.year] / 4.415;
    } // Once
    function getSoilTestPRunoffFactor(i) {
        if (soiltype[i] == 'A' || soiltype[i] == 'B' || soiltype[i] == 'C' || soiltype[i] == 'L' || soiltype[i] == 'N' || soiltype[i] == 'O') return 0.2;
        else if (soiltype[i] == 'D' || soiltype[i] == 'G' || soiltype[i] == 'K' || soiltype[i] == 'M' || soiltype[i] == 'Q' || soiltype[i] == 'T' || soiltype[i] == 'Y') return 0.19;
    }
    function getPApplicationFactor(i, cover) {
        var papprate = getPApplicationRate(i, cover);
        if(cover == 2 || cover == 4 || cover == 6 || cover == 7 || cover == 8) {
            return papprate * 0.00054585152838;
        } else if(cover == 1 || cover == 3 || cover == 5 || cover == 15) {
            return papprate * 0.00043668122271;
        } return 0;
    } // For every land cover point
    function getPApplicationRate(i, cover) {
        if (cover == 1 || cover == 2) {
            if (soiltype[i] == 'A' || soiltype[i] == 'B' || soiltype[i] == 'C' || soiltype[i] == 'L' || soiltype[i] == 'N' || soiltype[i] == 'O') return 59;
            else if (soiltype[i] == 'D' || soiltype[i] == 'G' || soiltype[i] == 'K' || soiltype[i] == 'M' || soiltype[i] == 'Q' || soiltype[i] == 'T' || soiltype[i] == 'Y') return 58;
        } else if (cover == 3 || cover == 4) {
            if (soiltype[i] == 'A' || soiltype[i] == 'B' || soiltype[i] == 'C' || soiltype[i] == 'L' || soiltype[i] == 'N' || soiltype[i] == 'O') return 35;
            else if (soiltype[i] == 'D' || soiltype[i] == 'G' || soiltype[i] == 'K' || soiltype[i] == 'M' || soiltype[i] == 'Q' || soiltype[i] == 'T' || soiltype[i] == 'Y') return 38;
        } else if (cover == 5) {
            var retvar;
            switch (soiltype[i]) {
                case 'A':
                    retvar = 6.3;
                    break;
                case 'B':
                    retvar = 0;
                    break;
                case 'C':
                    retvar = 4.3;
                    break;
                case 'D':
                    retvar = 5.6;
                    break;
                case 'G':
                    retvar = 0;
                    break;
                case 'K':
                    retvar = 4.1;
                    break;
                case 'L':
                    retvar = 4.2;
                    break;
                case 'M':
                    retvar = 6.5;
                    break;
                case 'N':
                    retvar = 6.4;
                    break;
                case 'O':
                    retvar = 3.6;
                    break;
                case 'Q':
                    retvar = 6.9;
                    break;
                case 'T':
                    retvar = 6.7;
                    break;
                case 'Y':
                    retvar = 6.3;
                    break;
                default:
                    break;
            }
            return retvar * 13;
        } else if (cover == 6 || cover == 7) {
            var retvar;
            switch (soiltype[i]) {
                case 'A':
                    retvar = 6.3;
                    break;
                case 'B':
                    retvar = 0;
                    break;
                case 'C':
                    retvar = 4.3;
                    break;
                case 'D':
                    retvar = 5.6;
                    break;
                case 'G':
                    retvar = 0;
                    break;
                case 'K':
                    retvar = 4.1;
                    break;
                case 'L':
                    retvar = 4.2;
                    break;
                case 'M':
                    retvar = 6.5;
                    break;
                case 'N':
                    retvar = 6.4;
                    break;
                case 'O':
                    retvar = 3.6;
                    break;
                case 'Q':
                    retvar = 6.9;
                    break;
                case 'T':
                    retvar = 6.7;
                    break;
                case 'Y':
                    retvar = 6.3;
                    break;
                default:
                    break;
            }
            return retvar * 0.053 * 2.2 * 2.29 * (getSeasonalUtilizationRate(i)/(getCattleAverageDailyIntake()/2000));
        } else if (cover == 8) {
            if (soiltype[i] == 'A' || soiltype[i] == 'B' || soiltype[i] == 'C' || soiltype[i] == 'L' || soiltype[i] == 'N' || soiltype[i] == 'O') return 34;
            else if (soiltype[i] == 'D' || soiltype[i] == 'G' || soiltype[i] == 'K' || soiltype[i] == 'M' || soiltype[i] == 'Q' || soiltype[i] == 'T' || soiltype[i] == 'Y') return 39;
        }  else if (cover == 15) {
            return 1.95;
        }
        return 0;
    } // For every land cover point
    function getSeasonalUtilizationRate(i) {
        return (landcover[i] == 6 || landcover[i] == 7) ? 0.35 : 0;
    }
    function getCattleAverageDailyIntake() {
        var cattleBodyWeight = 1200;
        return 0.03 * cattleBodyWeight;
    }
    function getFlowFactor(i) {
        if (topoSlopeRangeHigh[i] <= 5 && drainageclass[i] >= 60) {
            if (subsoilGroup[i] == 1 || subsoilGroup[i] == 2) {
                return 0.1;
            } else if (permeabilityCode[i] <= 35 || permeabilityCode == 58 || permeabilityCode[i] == 72 || permeabilityCode[i] == 75) {
                return 0.1;
            }
        } else {
            return 0;
        }
    } // For every land cover point
};