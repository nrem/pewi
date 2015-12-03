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
        landcover;
    this.update = function () {
//        console.log("Updating...");
//		console.log(global.update);
        // Update
		for(var year in global.update) {
            if(global.data[year] == 0 || global.data[year] == undefined) continue;
			if(global.update[year] == true) {
				setLandcover(year);
				setYear(year);
				updateYear(year);
			}
		}
	}

	function setLandcover(year) {
		landcover = global.data[year].baselandcover.data;
	}

	function setYear(year) {
		yieldVals.year(year);
		nitrates.year(year);
		carbon.year(year);
		bio.year(year);
		erosion.year(year);
	}

	function updateYear(year) {
//        console.log('---------------------------- Year ' + year + ' calculations ------------------------------');
        resetLandCoverValuesAreasFor(year);

//        bio.init();
        erosion.init();

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
//       for(var i=0; i<dataset.length; i++)
//       {
//       		console.log(dataset[i]);
//       }
        flagUpdateToFalse(year);
    	}

    this.calculateOutputMapValues = function () {
        // Update
		for(year in global.update) {
			if(global.update[year] == true) {
				setLandcover(year);
				setYear(year);

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
		}

    }
};

/**
 * Yield calculations
 * @constructor
 */
var Yield = function () {
	this.year = function(y) {
		year = y;
		landcover = global.data[year].baselandcover.data;
		soilType = getSubdataValueWithName("soiltype", year);
		datapointarea = getSubdataValueWithName("area", year);
	    for (var i = 1; i < landcovers.length; i++) {

	        global.landcovers[year][landcovers[i]] = {
	            name: landcovers[i],
	            area: 0,
	            percent: 0
	        };
	    }
	}
    var landcover,
        soilType,
        datapointarea,
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
            [2.4426229508, 0, 2.1475409836, 1.8852459016, 0, 1.6885245902, 2.0163934426, 2.3770491803, 2.606557377, 1, 2.8360655738, 3, 1.9836065574] //herb
        ],
        conservationYieldFactor = [0.945, 0.975, 0.975, 0.975, 0.9, 0.9, 0.9, 0.975, 0.9, 0.975, 0.975, 0.9, 0.9, 0.9],
        yieldVals = {1:0, 2:0, 3:0},
        soiltype, year = global.year;

    for(var i=1; i<4; i++) {
        yieldVals[i] = {
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
        };
    }

    this.update = function (i) {
        //landCoverType(i);
        soiltype = getSoilType(i);
        yieldPrecipitationMultiplier = getYieldPrecipitationMultiplier(i);
        // Corn Yield
        setCornYield(i);
        global.landcovers[year][landcovers[1]].area += (landcover[i] == 1) ? datapointarea[i] : 0;
        global.landcovers[year][landcovers[2]].area += (landcover[i] == 2) ? datapointarea[i] : 0;

        // Soy Yield
        setSoyYield(i);
        global.landcovers[year][landcovers[3]].area += (landcover[i] == 3) ? datapointarea[i] : 0;
        global.landcovers[year][landcovers[4]].area += (landcover[i] == 4) ? datapointarea[i] : 0;

        // Alfalfa Yield
        setAlfalfaYield(i);
        global.landcovers[year][landcovers[5]].area += (landcover[i] == 5) ? datapointarea[i] : 0;

        // GrassHay Yield
        setGrassHayYield(i);
        global.landcovers[year][landcovers[8]].area += (landcover[i] == 8) ? datapointarea[i] : 0;

        // Timer Yield
        setTimberYield(i);
        global.landcovers[year][landcovers[11]].area += (landcover[i] == 11) ? datapointarea[i] : 0;
        global.landcovers[year][landcovers[10]].area += (landcover[i] == 10) ? datapointarea[i] : 0;

        // Cattle Yield
        setCattleYield(i);
        global.landcovers[year][landcovers[6]].area += (landcover[i] == 6) ? datapointarea[i] : 0;
        global.landcovers[year][landcovers[7]].area += (landcover[i] == 7) ? datapointarea[i] : 0;

        // Herbaceous Bioenergy Yield
        setHerbaceousBioenergyYield(i);
        global.landcovers[year][landcovers[12]].area += (landcover[i] == 12) ? datapointarea[i] : 0;

        // Woody Bioenergy Yield
        setWoodyBioenergyYield(i);
        global.landcovers[year][landcovers[13]].area += (landcover[i] == 13) ? datapointarea[i] : 0;

        // Wetland Yield
        global.landcovers[year][landcovers[14]].area += (landcover[i] == 14) ? datapointarea[i] : 0;

        // FruitVeggie Yield
        setFruitVeggieYield(i);
        global.landcovers[year][landcovers[15]].area += (landcover[i] == 15) ? datapointarea[i] : 0;
        // Results calculations
//        global.results[year].yield.corn_percent += (data[i] == 1) ? area
    };
    this.calculate = function () {
        // Corn Yield
        dataset['corn']["Value" + year] = yieldVals[year].corn.val;
        dataset['corn']["Year" + year] = 100 * (yieldVals[year].corn.val / yieldVals[year].corn.max);
        global.landcovers[year][landcovers[1]].percent = global.landcovers[year][landcovers[1]].area / watershedArea * 100;
        global.landcovers[year][landcovers[2]].percent = global.landcovers[year][landcovers[2]].area / watershedArea * 100;

        // Soy Yield
        dataset['soybean']["Value" + year] = yieldVals[year].soybean.val;
        yieldVals[year].soybean.index = 100 * (yieldVals[year].soybean.val / yieldVals[year].soybean.max);
        dataset['soybean']["Year" + year] = yieldVals[year].soybean.index;
        global.landcovers[year][landcovers[3]].percent = global.landcovers[year][landcovers[3]].area / watershedArea * 100;
        global.landcovers[year][landcovers[4]].percent = global.landcovers[year][landcovers[4]].area / watershedArea * 100;

        // Alfalfa Yield
        dataset['alfalfa']["Value" + year] = yieldVals[year].alfalfa.val;
        yieldVals[year].alfalfa.index = 100 * (yieldVals[year].alfalfa.val / yieldVals[year].alfalfa.max);
        dataset['alfalfa']["Year" + year] = yieldVals[year].alfalfa.index;
        global.landcovers[year][landcovers[5]].percent = global.landcovers[year][landcovers[5]].area / watershedArea * 100;

        // GrassHay Yield
        dataset['hay']["Value" + year] = yieldVals[year].grass.val;
        yieldVals[year].grass.index = 100 * (yieldVals[year].grass.val / yieldVals[year].grass.max);
        dataset['hay']["Year" + year] = yieldVals[year].grass.index;
        global.landcovers[year][landcovers[8]].percent = global.landcovers[year][landcovers[8]].area / watershedArea * 100;

        // Timer Yield
        dataset['timber']["Value" + year] = yieldVals[year].timber.val;
        yieldVals[year].timber.index = 100 * (yieldVals[year].timber.val / yieldVals[year].timber.max);
        dataset['timber']["Year" + year] = yieldVals[year].timber.index;
        global.landcovers[year][landcovers[11]].percent = global.landcovers[year][landcovers[11]].area / watershedArea * 100;
        global.landcovers[year][landcovers[10]].percent = global.landcovers[year][landcovers[10]].area / watershedArea * 100;

        // Cattle
        dataset['cattle']["Value" + year] = yieldVals[year].cattle.val;
        yieldVals[year].cattle.index = 100 * (yieldVals[year].cattle.val / yieldVals[year].cattle.max);
        dataset['cattle']["Year" + year] = yieldVals[year].cattle.index;
        global.landcovers[year][landcovers[6]].percent = global.landcovers[year][landcovers[6]].area / watershedArea * 100;
        global.landcovers[year][landcovers[7]].percent = global.landcovers[year][landcovers[7]].area / watershedArea * 100;

        // Herbaceous Bioenergy Yield
        dataset['herbaceous']["Value" + year] = yieldVals[year].herb.val;
        dataset['herbaceous']["Year" + year] = 100 * (yieldVals[year].herb.val / yieldVals[year].herb.max);
        global.landcovers[year][landcovers[12]].percent = global.landcovers[year][landcovers[12]].area / watershedArea * 100;

        // Woody Bioenergy Yield
        dataset['woody']["Value" + year] = yieldVals[year].woody.val;
        dataset['woody']["Year" + year] = 100 * (yieldVals[year].woody.val / yieldVals[year].woody.max);
        global.landcovers[year][landcovers[13]].percent = global.landcovers[year][landcovers[13]].area / watershedArea * 100;

        // FruitVeggie Yield
        dataset['mixed']["Value" + year] = yieldVals[year].fruitveggie.val;
        dataset['mixed']["Year" + year] = 100 * (yieldVals[year].fruitveggie.val / yieldVals[year].fruitveggie.max);
        global.landcovers[year][landcovers[15]].percent = global.landcovers[year][landcovers[15]].area / watershedArea * 100;

    };

    //////////////Corn Yield///////////////////
    function setCornYield(i) {
        yieldVals[year].corn.val += yieldPrecipitationMultiplier * getCornYield(i);
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
        yieldVals[year].corn.max += unitYield[0][soiltype] * datapointarea[i];
    }

    //////////////Soy Yield///////////////////
    function setSoyYield(i) {
        yieldVals[year].soybean.val += yieldPrecipitationMultiplier * getBaseSoyYield(i);
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
        yieldVals[year].soybean.max += unitYield[1][soiltype] * datapointarea[i];
    }

    //////////////Alfalfa Yield///////////////////
    function setAlfalfaYield(i) {
        yieldVals[year].alfalfa.val += yieldPrecipitationMultiplier * getAlfalfaYield(i);
        setAlfalfaMax(i);
    }

    function getAlfalfaYield(i) {
        if (landcover[i] == 5) return unitYield[2][soiltype] * datapointarea[i];
        else return 0;
    }

    function setAlfalfaMax(i) {
        yieldVals[year].alfalfa.max += unitYield[2][soiltype] * datapointarea[i];
    }

    //////////////GrassHay Yield///////////////////
    function setGrassHayYield(i) {
        yieldVals[year].grass.val += yieldPrecipitationMultiplier * getGrassHayYield(i);
        setGrassHayMax(i);
    }

    function getGrassHayYield(i) {
        if (landcover[i] == 8) return unitYield[2][soiltype] * datapointarea[i];
        else return 0;
    }

    function setGrassHayMax(i) {
        yieldVals[year].grass.max += unitYield[2][soiltype] * datapointarea[i];
    }

    //////////////Timber Yield///////////////////
    function setTimberYield(i) {
        yieldVals[year].timber.val += yieldPrecipitationMultiplier * getTimberYield(i);
        setTimberMax(i);
    }

    function getTimberYield(i) {
        if (landcover[i] == 10 || landcover[i] == 11) return (unitYield[3][soiltype] * datapointarea[i]);
        else return 0;
    }

    function setTimberMax(i) {
        yieldVals[year].timber.max += unitYield[3][soiltype] * datapointarea[i];
    }

    //////////////Cattle Yield///////////////////
    function setCattleYield(i) {
        yieldVals[year].cattle.val += yieldPrecipitationMultiplier * getCattleSupported(i);
        setCattleMax(i);
    }

    function getCattleSupported(i) {
        if (landcover[i] == 6 || landcover[i] == 7) {
//            console.log(getSeasonalUtilizationRate(i), cattleAverageDailyIntake, GRAZING_SEASON_LENGTH, unitYield[4][soiltype], datapointarea[i]);
            return (getSeasonalUtilizationRate(i) / ((cattleAverageDailyIntake / 2000) * GRAZING_SEASON_LENGTH) * unitYield[4][soiltype] * datapointarea[i]);
        }
        else return 0;
    }

    function getSeasonalUtilizationRate(i) {
        if (landcover[i] == 6) return 0.35;
        else if (landcover[i] == 7) return 0.55;
        else return 0;
    }

    function setCattleMax(i) {
        yieldVals[year].cattle.max += (0.55 / ((cattleAverageDailyIntake / 2000) * GRAZING_SEASON_LENGTH) * unitYield[4][soiltype] * datapointarea[i]);
    }

    //////////////Herbaceous Bioenergy Yield///////////////////
    function setHerbaceousBioenergyYield(i) {
        yieldVals[year].herb.val += yieldPrecipitationMultiplier * getHerbaceousBioenergyYield(i);
        setHerbaceousBioenergyMax(i);
    }

    function getHerbaceousBioenergyYield(i) {
        if (landcover[i] == 12) return unitYield[6][soiltype] * datapointarea[i];
        else return 0;
    }

    function setHerbaceousBioenergyMax(i) {
        yieldVals[year].herb.max += unitYield[6][soiltype] * datapointarea[i];
    }

    //////////////Woody Bioenergy Yield///////////////////
    function setWoodyBioenergyYield(i) {
        yieldVals[year].woody.val += getWoodyBioenergyYield(i);
        setWoodyBioenergyMax(i);
    }

    function getWoodyBioenergyYield(i) {
        return (landcover[i] == 13) ? 60.8608 * datapointarea[i] : 0;
    }

    function setWoodyBioenergyMax(i) {
        yieldVals[year].woody.max += 60.8608 * datapointarea[i];
    }

    //////////////Mixed Fruit/Veggie Yield///////////////////
    function setFruitVeggieYield(i) {
        yieldVals[year].fruitveggie.val += getFruitVeggieYield(i);
        setFruitVeggieMax(i);
    }

    function getFruitVeggieYield(i) {
        if (landcover[i] == 15) return getYieldPrecipitationMultiplier(i) * 7.34 * datapointarea[i] * getSoilTypeMultiplier(i);
        else return 0;
    }

    function setFruitVeggieMax(i) {
        yieldVals[year].fruitveggie.max += 7.34 * datapointarea[i] * getSoilTypeMultiplier(i);
    }

    function getYieldPrecipitationMultiplier(i) {
        if (landcover[i] > 0 && landcover[i] < 5) {
            if (global.data.precipitation[year] == 24.58 || global.data.precipitation[year] == 45.10) return 0.75;
            else if (global.data.precipitation[year] == 28.18 || global.data.precipitation[year] == 36.47) return 0.9;
            else if (global.data.precipitation[year] == 30.39 || global.data.precipitation[year] == 32.16 || global.data.precipitation[year] == 34.34) return 1;
        } else if ((landcover[i] > 4 && landcover[i] < 9) || landcover[i] == 12) {
            if (global.data.precipitation[year] > 24.58 && global.data.precipitation[year] < 45.10) return 1;
            else return 0.95;
        } else if (landcover[i] == 15) {
            if (global.data.precipitation[year] < 36.47) return 1;
            else if (global.data.precipitation[year] == 36.47) return 0.9
            else return 0.75;
        }
        return 1;
    }

    function getSoilTypeMultiplier(i) {
        var soiltexture = getSoilTexture(i);
        if (soiltexture == "FSL") return 1;
        else if (soiltexture == "SIL") return 0.9;
        else if (soiltexture == "L") return 0.85;
        else if (soiltexture == "SICL" || soiltexture == "CL" || soiltexture == "MK-SIL") return 0.4;
        else return 1;
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
	this.year = function(y) {
		year = y;
		subwatershedData = global.data[year].subwatershed.data;
		landcover = global.data[year].baselandcover.data;
		wetland = global.data[year].wetland.data;
		soilType = global.data[year].soiltype.data;
		dataPointArea = global.data[year].area.data;
	}
    var nitratesPPM = {
            1: 0,
            2: 0,
            3: 0
        },
        subwatershedData,
    // Holds the multiplier accumulators for each subwatershed
        subwatershed = {
            1: [],
            2: [],
            3: []
        },
        ppmSubwatershed = {
            1: [],
            2: [],
            3: []
        },
		year = global.year;
    for(var j=1; j<4; j++) {
        for (var i = 0; i < subwatershedArea.length; i++) {
            var arr = {"row": 0,
                "wetland": 0,
                "conservation": 0,
                "precipitation": 0};

            subwatershed[j].push(arr);
        }
    }

    var landcover,
        wetland,
        watershedPercent = [],
        max = 100 * 0.14 * 2.11, min = 2,
        soilType,
        dataPointArea;

    this.update = function (i) {
        var f = subwatershedData[i];
        if (subwatershed[year][f] != null) {

            subwatershed[year][f].row += setRowCropMultiplier(i);
            subwatershed[year][f].wetland += setWetlandMultiplier(i);
            subwatershed[year][f].conservation += setConservationMultiplier(i);
//            console.log(setConservationMultiplier(i));
//            console.log(subwatershed[year][f].conservation);
        }
        subwatershed[year][f].precipitation = setPrecipitationMultiplier(i);
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
        var p = global.data.precipitation[year];
        if (p == 24.58 || p == 28.18) // If it's a dry year
        {
            return 0.86;
        } else if (p == 30.39 || p == 32.16 || p == 34.34) { // If it's a normal year
            if (global.data.precipitation[year - 1] == 24.58 || global.data.precipitation[year - 1] == 28.18) {
                return 1.69;
            } else {
                return 1;
            }
        } else { // If it's a flood year
            if (global.data.precipitation[year - 1] == 24.58 || global.data.precipitation[year - 1] == 28.18) {
                return 2.11;
            } else {
                return 1;
            }
        }
    }

    function mapIt()	// The function updates the data for the watershed Nitrate map
    {
//        console.log("NITRATES PPM *****************" + nitratesPPM[year], watershedArea, year);
        if (subwatershed[year] == undefined || subwatershed[year].length == null) {
            return console.alert("The subwatersheds are not defined. Try Nitrates.update() before calling this function.");
        }
		//console.log(ppmsubwatershed[year]);
        for (var i = 0; i < subwatershed[year].length; i++) {
            nitratesPPM[year] += (subwatershedArea[i] * ppmSubwatershed[year][i]) / watershedArea;
        }
//        console.log("NITRATESPPM ******************", nitratesPPM[year]);
        for (var i = 0; i < subwatershed[year].length; i++) {
            watershedPercent[i] = ppmSubwatershed[year][i] * (subwatershedArea[i] / watershedArea) / nitratesPPM[year];
            global.watershedPercent[year][i] = watershedPercent[i];
        }
    }

    this.calculate = function () {
        var sum = 0;
        for (var i = 0; i < subwatershedArea.length; i++) {
            var row = 0, wet = 0, cons = 0, precip = 0;
            if (subwatershedArea[i] != null && subwatershed[year] != undefined && subwatershedArea[i] != 0) {
                if (subwatershed[year][i].row != null) {
                    row = 0.14 * (subwatershed[year][i].row / subwatershedArea[i]);
                } else {
                    row = 0;
                }
                if (subwatershed[year][i].wetland != 0 && subwatershed[year][i].wetland != null) {
                    wet = 0.6;
                } else {
                    wet = 1;
                }

                if (subwatershed[year][i].conservation != 0 && subwatershed[year][i].conservation != null) {
                    cons = (subwatershed[year][i].conservation / subwatershedArea[i]);
                } else {
                    cons = 0;
                }
//                subwatershed[i].conservation = 0;
                /*
                 if(subwatershed[i].precipitation != 0 && subwatershed[i].precipitation != null)
                 {
                 precip += subwatershed[i].precipitation / subwatershedArea[i];
                 } else {
                 precip += 0;
                 }*/

                precip = setPrecipitationMultiplier(i);
                // console.log(row, wet, cons, precip);
            }
            if ((100 * row * wet * cons * precip) < 2) {
                ppmSubwatershed[year][i] = 2;
            } else {
                ppmSubwatershed[year][i] = 100 * row * wet * cons * precip;
            }
//            console.log(ppmSubwatershed[year][i]);
//            console.log("Crop: " + row);
//            console.log("Wetland: " + wet);
//            console.log("Conservation: " + cons);
//            console.log("Precipitation: " + precip);
            // console.log("Subwatershed PPM: " + ppmSubwatershed[year][i]);
            sum += subwatershedArea[i];
        }
        mapIt();
        // console.log("Nitrates PPM: " + nitratesPPM[year], max, min);
        dataset['nitrate']['Year' + year] = 100 * ((max - nitratesPPM[year]) / (max - min));
        dataset['nitrate']['Value' + year] = nitratesPPM[year];
        dealloc();
    };

    function dealloc() {
		nitratesPPM[year] = 0;
//        for(var i = 0; i < subwatershed.length; i++) {
//            subwatershed[i].row = 0;
//            subwatershed[i].wetland = 0;
//            subwatershed[i].conservation = 0;
//            subwatershed[i].precipitation = 0;
//        }

    }
};

/**
 * Carbon calculations
 * @constructor
 */
var Carbon = function () {
	this.year = function(y) {
		year = y;
		landCover = global.data[year].baselandcover.data;
		dataPointArea = global.data[year].area.data;
	}
	var year = global.year;
    var landCover;
    var carbonMultiplier = [0, 161.87, 0, 161.87, 202.34, 117.36, 117.36, 117.36, 433.01, 1485.20, 1485.20, 485.62, 1897.98, 1234.29, 0];
    var carbon = {1:0, 2:0, 3:0};
    var max = 1897.98 * watershedArea;
    var min = 0,
        dataPointArea;
    //console.log(max);
    this.update = function (i) {
        setCarbon(i);
    };

    function setCarbon(i) {
        //console.log("j");
        carbon[year] += carbonMultiplier[landCover[i] - 1] * dataPointArea[i];
        //console.log(carbon);
        //console.log(landCoverArea[landCover[i]]);
        //pewiData[21][i] = carbonMultiplier[i-1]*10;
    }

    this.calculate = function () {
        // Needs a look-see
        dataset['carbon']["Year" + year] = 100 * (carbon[year] - min) / (max - min);
        dataset['carbon']["Value" + year] = carbon[year];
        carbon[year] = 0;
    }
};

/**
 * Biodiversity calculations
 * @constructor
 */
var Biodiversity = function () {
	this.year = function(y) {
		year = y;
		data = global.data[year].group.data;
		cols = global.data[year].columns;
		rows = global.data[year].rows;
		dataPointArea = global.data[year].area.data;
	}
	var year = global.year,
        data,
        cols,
        rows,
        dataPointArea,
        distinctCount = 0,
        adjSubtotal = {
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
        },
        adjacencySubtotal = 0,
        nativePerennialsArea = 0, nativePerennialsPercent,
        nonNativePerennialsArea = 0, nonNativePerennialsPercent,
        streamBufferArea = 0, streamBufferPercent,
        wetlandArea = 0, wetlandPercent,
        strategicWetlandArea = {1:0, 2:0, 3:0}, strategicWetlandPercent,
        forestArea = 0, conservationForestPercent,
        conservationForestArea = 0,
        nativePNindex = 0, nonNativePNindex = 0, pGindex = 0, streamNindex = 0,
        streamGindex = 0, wetlandNindex = 0, wetlandGindex = 0, forestGindex = 0,
        heterogeneityGroup = [// Group ID,Count,proportion,percent of watershed
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
        ],
        adjacencyGroup = [
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

//    this.init = function() {
//        for(var i=1; i<4; i++) {
//
//
//        }
//        console.log(heterogeneityGroup);
//    };

    this.update = function (i) {
        if(year == 2) {
            console.log(year);
        }

        setHeterogeneityGroup(i);

        setNativePerennialsArea(i);
        setNonNativePerennialsArea(i);
        setStreamBufferArea(i);
        setWetlandArea(i);
        setStrategicWetlandArea(i);
		// console.log(strategicWetlandArea, year);
        setForestArea(i);
        setConservationForestArea(i);
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
//        setAdjacencyGroupSubtotal(i);
    };
    var contagion = 0;
    this.calculate = function () {
//        console.log("//////////////////// BIO INDICES START ///////////////////")
        //console.log(adjacencyGroup);
        //console.log(heterogeneityGroup);
        setAdjacencyGroupProportion();

//        for(var object in adjacencyGroup) {
//            console.log(adjacencyGroup[object]);
//        }
//        console.log("Heterogeneity Group Numbers");
//        for(var thing in heterogeneityGroup) {
//            console.log(heterogeneityGroup[thing]);
//        }

        //console.log(heterogeneityGroup);
        //console.log("Adjacency Subtotal: " + adjacencySubtotal);
        //console.log(adjacencyGroup);
        var y = 0;
        x = 0;
        for (var i = 0; i < heterogeneityGroup.length; i++) {
            for (var j = 0; j < 11; j++) {
                if (adjacencyGroup[y][2] != 0 && heterogeneityGroup[i][2] != 0) {
                    var product1 = heterogeneityGroup[i][2] * adjacencyGroup[y][2];
                    var product2 = Math.log(heterogeneityGroup[i][2] * adjacencyGroup[y][2]);

                    //console.log(product2, "Het: " + heterogeneityGroup[i][2], "Adj: " + adjacencyGroup[j][2]);
                    x += adjacencyGroup[y][2];
                    contagion += (product1 * product2);
//                    console.log("Heterogeneity: " + heterogeneityGroup[i][2], "Adj: " + adjacencyGroup[y][2]);
//                    console.log("Product1: " + product1, "Product2: " + product2);
//                    console.log("Numerator: " + (product1 * product2));
                    //console.log(j);
                }
                y++;
            }
        }
        //console.log(x);
        //console.log(distinctCount);
//        console.log("Numerator: ", contagion);
        // If there is only one landcover, the ln of distinctCount equals 0
        // therefore, override the value such that the final contagion value
        // equals 1
        var product3 = 2 * ((Math.log(distinctCount) == 0) ? 0.5 : Math.log(distinctCount));
//        console.log("Denomimator: ", product3);
        contagion = 1 + (contagion / product3);
//        console.log('Contagion: ' + contagion);
        //console.log("Contagion: " + contagion, "Product3: " + product3);
        //console.log(contagion);
        setNativePerennialsPercent();
        setNonNativePerennialsPercent();
        setStreamBufferPercent();
        setWetlandPercent();
        setStrategicWetlandPercent();
        setConservationForestPercent();
        setTheIndexes();
        setNativeIndex();
        setGameIndex();

        global.strategicWetland[year] = {
            actual: strategicWetlandArea[year],
            possible: strategicArea
        };
//		console.log(global.strategicWetland);
        global.streamNetwork = streamBufferPercent;
        // dataset[x]["Year"+year] = setGameIndex();
        // dataset[x]["Year"+year] = setNativeIndex();

//        console.log('Group Adjencies [title, count, proportion]: ', adjacencyGroup);
//        console.log('Heterogeneity Groups [title, count, proportion, !unused!]: ', heterogeneityGroup);
//        console.log("//////////////////// BIO INDICES END ///////////////////");
        dealloc();
    };

	function dealloc() {
		strategicWetlandArea[year] = 0;
        contagion = 0;
        adjacencySubtotal = 0;
        nativePerennialsArea = 0;
        nativePerennialsPercent = 0;
        nonNativePerennialsArea = 0;
        nonNativePerennialsPercent = 0;
        streamBufferArea = 0;
        streamBufferPercent = 0;
        wetlandArea = 0;
        wetlandPercent = 0;
        strategicWetlandPercent = 0;
        forestArea = 0;
        conservationForestArea = 0;
        conservationForestPercent = 0;
        nativePNindex = 0;
        nonNativePNindex = 0;
        pGindex = 0;
        streamNindex = 0;
        streamGindex = 0;
        wetlandNindex = 0;
        wetlandGindex = 0;
        forestGindex = 0;
        distinctCount = 0;
        x = 0;

        for(var key in adjacencyGroup) {
            adjacencyGroup[key][1] = 0;
            adjacencyGroup[key][2] = 0;

            if(key < heterogeneityGroup.length) {
                heterogeneityGroup[key][1] = 0;
                heterogeneityGroup[key][2] = 0;
            }
        }
        for(var key in adjSubtotal) {
            adjSubtotal[key] = 0;
        }
	}

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
        else if (nativePerennialsPercent >= 0.499) {
            nativePNindex = 3;
        } else {
            nativePNindex = 0;
        }
        // Non-Native Perennials Native Index
        if (nonNativePerennialsPercent >= 0.05 && nonNativePerennialsPercent < 0.25) {
            nonNativePNindex = 0.5;
        }
        else if (nonNativePerennialsPercent >= 0.25 && nonNativePerennialsPercent < 0.50) {
            nonNativePNindex = 1;
        }
        else if (nonNativePerennialsPercent >= 0.499) {
            nonNativePNindex = 1.5;
        } else {
            nonNativePNindex = 0;
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
        } else {
            pGindex = 0;
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
        } else if (streamBufferPercent >= 0.7) {
            streamGindex = 2;
        } else streamGindex = 0;

        // Wetland Points Native Index
        if (wetlandPercent >= 5) {
          if (strategicWetlandPercent >= 0 && strategicWetlandPercent < 50) {
            wetlandGindex = 0;
          }
          else if (strategicWetlandPercent >= 50 && strategicWetlandPercent < 75) {
            wetlandGindex = 0.5;
          }
          else if (strategicWetlandPercent >= 75 && strategicWetlandPercent < 100) {
            wetlandGindex = 1;
          }
          else if (strategicWetlandPercent == 100) {
            wetlandGindex = 1.5;
          }
        }


        // Wetland Game Wildlife Points
        if (wetlandPercent >= 5) {
            wetlandGindex = 1;
        }

        // Conservation Forest Points
        if (conservationForestPercent >= 5) {
            forestGindex = 1;
        }
        else {
          forestGindex = 0;
        }
//        console.log("conservationForestPercent: ", conservationForestPercent);
//        console.log("Native perennial native index: ", nativePNindex);
//        console.log("Non-native perennial native index: ", nonNativePNindex);
//        console.log("Perrennial points game index: ", pGindex);
//        console.log("Stream buffer points native index: ", streamNindex);
//        console.log("Stream bugger points game index: ", streamGindex);
//        console.log("Wetland points native index: ", wetlandNindex);
//        console.log("Wetland points game index: ", wetlandGindex);
//        console.log("Forest game index: ", forestGindex);
    }

    function setNativeIndex() {
        dataset['biodiversity']['Year' + year] = 10 * (getContagionPointsNativeIndex() + nativePNindex + nonNativePNindex + streamNindex + wetlandNindex);
        dataset['biodiversity']['Value' + year] = getContagionPointsNativeIndex() + nativePNindex + nonNativePNindex + streamNindex + wetlandNindex;
//        console.log('Native Index: ' + getContagionPointsNativeIndex());
    }

    function setGameIndex() {
        dataset['game']['Year' + year] = 10 * (getContagionPointsGameIndex() + pGindex + streamGindex + wetlandGindex + forestGindex);
        dataset['game']['Value' + year] = getContagionPointsGameIndex() + pGindex + streamGindex + wetlandGindex + forestGindex;
//        console.log('Game Index: ' + getContagionPointsGameIndex());
    }

    function getContagionPointsNativeIndex() {
        // Calculated once per watershed
        if (contagion >= 0 && contagion < 0.15) return 1.5;
        else if (contagion >= 0.15 && contagion < 0.35) return 1;
        else if (contagion >= 0.35 && contagion < 1) return 0.5;
        else return 0;
    }

    function getContagionPointsGameIndex() {
        // Calculated once per watershed
        if (contagion >= 0 && contagion < 0.15) return 3;
        else if (contagion >= 0.15 && contagion < 0.35) return 2;
        else if (contagion >= 0.55 && contagion < 1) return 1;
        else return 0;
    }

    function setHeterogeneityGroup(j) {
        // Calculates for each point in the watershed (attached to main loop)
        // Heterogeneity group setter
        // Heterogeneity group count setter
        switch (parseInt(global.data[year].baselandcover.data[j])) {
            case 1:
                global.data[year].group.data[j] = 0;        // Set Hetero Group in pewiData to identified group
                heterogeneityGroup[0][1]++; // Add 1 to count for Low Spatial Low Temporal
                break;
            case 2:
                global.data[year].group.data[j] = 4;
                heterogeneityGroup[4][1]++;
                break;
            case 3:
                global.data[year].group.data[j] = 0;
                heterogeneityGroup[0][1]++;
                break;
            case 4:
                global.data[year].group.data[j] = 4;
                heterogeneityGroup[4][1]++;
                break;
            case 5:
                global.data[year].group.data[j] = 1;
                heterogeneityGroup[1][1]++;
                break;
            case 6:
                global.data[year].group.data[j] = 0;
                heterogeneityGroup[0][1]++;
                break;
            case 7:
                global.data[year].group.data[j] = 5;
                heterogeneityGroup[5][1]++;
                break;
            case 8:
                global.data[year].group.data[j] = 2;
                heterogeneityGroup[2][1]++;
                break;
            case 9:
                global.data[year].group.data[j] = 7;
                heterogeneityGroup[7][1]++;
                break;
            case 10:
                global.data[year].group.data[j] = 8;
                heterogeneityGroup[8][1]++;
                break;
            case 11:
                global.data[year].group.data[j] = 6;
                heterogeneityGroup[6][1]++;
                break;
            case 12:
                global.data[year].group.data[j] = 2;
                heterogeneityGroup[2][1]++;
                break;
            case 13:
                global.data[year].group.data[j] = 3;
                heterogeneityGroup[3][1]++;
                break;
            case 14:
                global.data[year].group.data[j] = 9;
                heterogeneityGroup[9][1]++;
                break;
            case 15:
                global.data[year].group.data[j] = 10;
        }
    }

    function setHeterogeneityGroupProportions(i) {
        // Calculates for each hetero group (attached to secondary loop)
        // Heterogeneity group proportion setter
        //console.log(heterogeneityGroup[i][1], watershedArea);
        heterogeneityGroup[i][2] = heterogeneityGroup[i][1] / $('.watershed-rect').length;
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
                //console.log(global.data[year].group.data[i]);
                //console.log(global.data[year].group.data[i-(cols+1)]);
                //console.log(((global.data[year].group.data[i]*10) + global.data[year].group.data[i-1]));

                adjacencyGroup[((data[i] * 11) + data[i - (cols + 1)])][1]++;
                adjSubtotal[data[i - (cols + 1)]]++;

//            console.assert(data[i] == undefined, adjacencyGroup);
            }
            //global.data[year].group.data[i-(cols)] != undefined && parseInt(global.data[year].group.data[i-(cols)]) >= 0
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
                //console.log(global.data[year].group.data[i+(cols-1)]);
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
        } catch (error) {
            console.warn(error + " in setAdjacencyGroup");
        }
    }

    function setAdjacencyGroupCount(i) {
        // Calculates for each point in the watershed
        adjacencyGroup[global.data[year].group.data[i]][1]++;
    }

    function setAdjacencyGroupSubtotal(i) {
        // Calculates for each point in the watershed
        if (global.data[year].group.data[i - (cols + 1)] == global.data[year].group.data[i]) {
            adjacencySubtotal++;
        }
        if (global.data[year].group.data[i - (cols)] == global.data[year].group.data[i]) {
            adjacencySubtotal++;
        }
        if (global.data[year].group.data[i - (cols - 1)] == global.data[year].group.data[i]) {
            adjacencySubtotal++;
        }
        if (global.data[year].group.data[i - 1] == global.data[year].group.data[i]) {
            adjacencySubtotal++;
        }
        if (global.data[year].group.data[i + 1] == global.data[year].group.data[i]) {
            adjacencySubtotal++;
        }
        if (global.data[year].group.data[i + (cols - 1)] == global.data[year].group.data[i]) {
            adjacencySubtotal++;
        }
        if (global.data[year].group.data[i + (cols)] == global.data[year].group.data[i]) {
            adjacencySubtotal++;
        }
        if (global.data[year].group.data[i + (cols + 1)] == global.data[year].group.data[i]) {
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
        if (global.data[year].baselandcover.data[i] == 9 || global.data[year].baselandcover.data[i] == 10 || global.data[year].baselandcover.data[i] == 14) {
            nativePerennialsArea += dataPointArea[i];
        }
    }

    function setNativePerennialsPercent() {
        nativePerennialsPercent = nativePerennialsArea / watershedArea;
    }

    function setNonNativePerennialsArea(i) {
        if (global.data[year].baselandcover.data[i] == 2 || global.data[year].baselandcover.data[i] == 4 || global.data[year].baselandcover.data[i] == 7 || global.data[year].baselandcover.data[i] == 11 || global.data[year].baselandcover.data[i] == 12) {
            nonNativePerennialsArea += dataPointArea[i];
        }
    }

    function setNonNativePerennialsPercent() {
        nonNativePerennialsPercent = nonNativePerennialsArea / watershedArea;
    }

    function setStreamBufferArea(i) {
        if (global.data[year].streamnetwork.data[i] == 1) {
            if (global.data[year].baselandcover.data[i] == 2 || global.data[year].baselandcover.data[i] == 4 || global.data[year].baselandcover.data[i] == 7 || global.data[year].baselandcover.data[i] == 8 ||           global.data[year].baselandcover.data[i] == 9 || global.data[year].baselandcover.data[i] == 10 || global.data[year].baselandcover.data[i] == 11 || global.data[year].baselandcover.data[i] == 12 || global.data[year].baselandcover.data[i] == 13 || global.data[year].baselandcover.data[i] == 14 || global.data[year].baselandcover.data[i] == 15) {
                streamBufferArea += dataPointArea[i];
            }
        }
    }

    function setStreamBufferPercent() {
        //console.log("Stream Buffer Area: " + streamBufferArea);
        //console.log("Stream Area: " + streamArea);
        streamBufferPercent = 100*streamBufferArea / streamArea;
    }

    function setWetlandArea(i) {
        if (global.data[year].baselandcover.data[i] == 14) {
            wetlandArea += dataPointArea[i];
        }
    }

    function setWetlandPercent() {
        wetlandPercent = wetlandArea / watershedArea;
    }

    function setStrategicWetlandArea(i) {
        if (global.data[year].wetland.data[i] == 1) {
            if (global.data[year].baselandcover.data[i] == 14) {
                strategicWetlandArea[year]++;
            }
        }
    }

    function setStrategicWetlandPercent() {
        strategicWetlandPercent = strategicWetlandArea[year] / strategicArea;
    }

    function setForestArea(i) {
        if (global.data[year].baselandcover.data[i] == 10 || global.data[year].baselandcover.data[i] == 11) {
            forestArea += dataPointArea[i];
        }
    }

    function setConservationForestArea(i) {
      if (global.data[year].baselandcover.data[i] == 10) {
        conservationForestArea += dataPointArea[i];
      }
    }

    function setConservationForestPercent() {
        conservationForestPercent = 100*conservationForestArea / watershedArea;
    }
};

/**
 * Erosion calculations
 * @constructor
 */
var Erosion = function () {
	this.year = function(y) {
		year = y;
		drainageclass = getSubdataValueWithName("drainageclass", year);
		landcover = getSubdataValueWithName("baselandcover", year);
		soiltype = getSubdataValueWithName("soiltype", year);
		topography = getSubdataValueWithName("topography", year);
		streamnetwork = getSubdataValueWithName("streamnetwork", year);
		subwatershed = getSubdataValueWithName("subwatershed", year);
		wetland = getSubdataValueWithName("wetland", year);
		datapointarea = getSubdataValueWithName("area", year);

	    global.sedimentDelivered[year] = 0;
	    global.grossErosion[year] = 0;
	    global.phosphorusLoad[year] = 0;

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
	}
    var SOILTESTPDRAINAGEFACTOR = 0.1,
        drainageclass,
        landcover,
        soiltype,
        topography,
        streamnetwork,
        subwatershed,
        wetland,
        cols = 23,
        rows = 36,
        subwatersheds = [],
        pIndex = 0,
        sedimentDeliveredMin = 0, sedimentDeliveredMax = 0,
        datapointarea,
        phosphorusLoadMax = 0, phosphorusLoadMin = 0,
        erosionMax = 0, erosionMin = 0, year = global.year;

    this.init = function() {
//		console.log(global.sedimentDelivered[year]);
        global.sedimentDelivered[year] = 0;
        global.grossErosion[year] = 0;
        global.phosphorusLoad[year] = 0;
    }

    this.update = function (i) {
        global.sedimentDelivered[year] += getSedimentDelivered(i);
        var index = getGrossErosionPerUnitArea(i);
        var val = getGrossErosion(i, index);
        global.grossErosionSeverity[year][i] = getGrossErosionSeverity(i, val);
        global.grossErosion[year] += val;
        global.erosion[year][i] = index;
        val = phosphorusIndex(i, false, global.data.precipitation[year]);
        pIndex += val;
        global.pindex[year][i] = val;
        global.riskAssessment[year][i] = pIndexRiskAssessment(val);
        global.phosphorusLoad[year] += val * datapointarea[i] / 2000;
//		console.log(val*datapointarea[i]/2000);
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
        dataset['sediment']["Year" + year] = 100 * ((sedimentDeliveredMax - global.sedimentDelivered[year]) / (sedimentDeliveredMax - sedimentDeliveredMin));
        dataset['phosphorus']["Year" + year] = 100 * ((phosphorusLoadMax - global.phosphorusLoad[year]) / (phosphorusLoadMax - phosphorusLoadMin));
        dataset['erosion']["Year" + year] = 100 * ((erosionMax - global.grossErosion[year]) / (erosionMax - erosionMin));
        dataset['sediment']["Value" + year] = global.sedimentDelivered[year];
        dataset['phosphorus']["Value" + year] = global.phosphorusLoad[year];
        dataset['erosion']["Value" + year] = global.grossErosion[year];

        dealloc();
    };

    function dealloc() {
        pIndex = 0;
        sedimentDeliveredMax = 0;
        sedimentDeliveredMin = 0;
        phosphorusLoadMax = 0;
        phosphorusLoadMin = 0;
        erosionMax = 0;
        erosionMin = 0;
    }

    function getSedimentDelivered(i) {
        return (((rusle(i, global.data.precipitation[year], false) + ephemeralGullyErosion(i, false)) * sedimentDeliveryRatio(i) * bufferFactor(i, false)) * datapointarea[i]);
    }

    function getGrossErosionSeverity(i, erosion) {
        erosion = erosion / datapointarea[i];
        if (erosion > 5) return 5;
        else if (erosion <= 5 && erosion >= 3.5) return 4;
        else if (erosion <= 3.5 && erosion > 2) return 3;
        else if (erosion <= 2 && erosion > 0.5) return 2;
        else if (erosion <= 0.5) return 1;
    }

    function getGrossErosionPerUnitArea(i) {
        return ephemeralGullyErosion(i, false) + rusle(i, global.data.precipitation[year], false);
    }

    function getGrossErosion(i, grossErosionPerUnitArea) {
        return grossErosionPerUnitArea * datapointarea[i];
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

    function phosphorusIndex(i, point, precip_override) {
        return erosionComponent(i, point, precip_override) + runoffComponent(i, point, precip_override) + subsurfaceDrainageComponent(i, precip_override);
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
        return ((rusle(i, 45.10, 3) + ephemeralGullyErosion(i, 3)) * datapointarea[i]);
    }

    function getPhosphorusLoadMin(i) {
        return (phosphorusIndex(i, 9, 24.58) * datapointarea[i] / 2000);
    }

    function getPhosphorusLoadMax(i) {
        return (phosphorusIndex(i, 3, 45.10) * datapointarea[i] / 2000);
    }

    function getSedimentDeliveredMin(i) {
        return (((rusle(i, 24.58, 9) + ephemeralGullyErosion(i, 9)) * sedimentDeliveryRatio(i) * bufferFactor(i, 9)) * datapointarea[i]);
    }

    function getSedimentDeliveredMax(i) {
        return (((rusle(i, 45.10, 3) + ephemeralGullyErosion(i, 3)) * sedimentDeliveryRatio(i) * bufferFactor(i, 3)) * datapointarea[i]);
    }

    function erosionComponent(i, point, precip_override) {
		if(precip_override !== undefined) {
			return (rusle(i, precip_override, point) + ephemeralGullyErosion(i, point)) * sedimentDeliveryRatio(i) * bufferFactor(i, point) * enrichmentFactor(i, point) * soilTestPErosionFactor(i);
		} else {
			return (rusle(i, global.data.precipitation[year], point) + ephemeralGullyErosion(i, point)) * sedimentDeliveryRatio(i) * bufferFactor(i, point) * enrichmentFactor(i) * soilTestPErosionFactor(i);
		}
    }

    function runoffComponent(i, point, precip_override) {

        var cover = (point != false) ? point : landcover[i];

        return runoffFactor(i, cover) * precipitationFactor(precip_override) * (getSoilTestPRunoffFactor(i) + getPApplicationFactor(i, cover));
    }

    function subsurfaceDrainageComponent(i, precip_override) {
        return precipitationFactor(precip_override) * getFlowFactor(i) * SOILTESTPDRAINAGEFACTOR;
    }

    function rusle(i, precip, point) {
        return rainfallRunoffErosivityFactor(i, precip) * soilErodibilityFactor(i) * slopeLengthSteepnessFactor(i, point) * coverManagementFactor(i, point) * supportPracticeFactor(i, point);
    }

    function rainfallRunoffErosivityFactor(i, precip) {
        if (precip <= 33.46) {
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
	    if (point != false) {
	        if (point == 3) return 0.3;
	        else if (point == 9) return 0.001;
	    }

        var temp = getSubdataValueWithName("baselandcover", year - 1),
            cover = (point !== false) ? point : landcover[i];

        if (temp != undefined) {
            if (temp[i] == 1) {
                if (cover == 1) return 0.15;
                else if (cover == 2) return 0.085;
                else if (cover == 3 || cover == 15) return 0.2;
                else if (cover == 4) return 0.116;
            }
            if (temp[i] == 2) {
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
                else if (cover == 2) return 0.02;
                else if (cover == 3 || cover == 15) return 0.116;
                else if (cover == 4) return 0.031;
            }
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
        if (slopelimit != null) {
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
        if (soiltype[i] == 'A' || soiltype[i] == 'B' || soiltype[i] == 'C' || soiltype[i] == 'L' || soiltype[i] == 'N' || soiltype[i] == 'O') return (Math.pow(10, (log10(4 / 6) * log10(watershedArea) + (log10(4) - (4 * log10(4 / 6)))))) / 100;
        else if (soiltype[i] == 'D' || soiltype[i] == 'G' || soiltype[i] == 'K' || soiltype[i] == 'M' || soiltype[i] == 'Q' || soiltype[i] == 'T' || soiltype[i] == 'Y') return (Math.pow(10, (log10(26 / 35) * log10(watershedArea) + (log10(26) - (4 * log10(26 / 35)))))) / 100;
    }

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
    function enrichmentFactor(i, point) {
		var cover = (point != false) ? point : landcover[i];
        if (cover == 1 || cover == 3 || cover == 15) return 1.1;
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
            if (hydrogroup == 'A') return 72;
            else if (hydrogroup == 'B' || ((hydrogroup == 'C' || hydrogroup == 'D' || hydrogroup == 'B/D') && flowfactor > 0)) return 81;
            else if (hydrogroup == 'C' && flowfactor == 0) return 88;
            else if ((hydrogroup == 'D' || hydrogroup == 'B/D') && flowfactor == 0) return 91;
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
                if (hydrogroup == 'A') return 58;
                else if (hydrogroup == 'B') return 72;
                else if (hydrogroup == 'C') return 81;
                else if (hydrogroup == 'D' || hydrogroup == 'B/D') return 85;
            } else if (topography[i] == 4 || topography[i] == 5) {
                if (hydrogroup == 'A') return 55;
                else if (hydrogroup == 'B' || ((hydrogroup == 'C' || hydrogroup == 'D' || hydrogroup == 'B/D') && flowfactor > 0)) return 69;
                else if (hydrogroup == 'C' && flowfactor == 0) return 78;
                else if ((hydrogroup == 'D' || hydrogroup == 'B/D') && flowfactor == 0) return 83;
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
        } else if (cover == 8 || cover == 12) {
            if (hydrogroup == 'A') return 30;
            else if (hydrogroup == 'B' || ((hydrogroup == 'C' || hydrogroup == 'D' || hydrogroup == 'B/D') && flowfactor > 0)) return 58;
            else if (hydrogroup == 'C' && flowfactor == 0) return 71;
            else if ((hydrogroup == 'D' || hydrogroup == 'B/D') && flowfactor == 0) return 78;
        } else if (cover == 9 || cover == 14) {
            if (hydrogroup == 'A') return 30;
            else if (hydrogroup == 'B' || ((hydrogroup == 'C' || hydrogroup == 'D' || hydrogroup == 'B/D') && flowfactor > 0)) return 48;
            else if (hydrogroup == 'C' && flowfactor == 0) return 65;
            else if ((hydrogroup == 'D' || hydrogroup == 'B/D') && flowfactor == 0) return 73;
        } else if (cover == 10 || cover == 11 || cover == 13) {
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

    function precipitationFactor(override) {
		if(override == undefined) {
			return global.data.precipitation[year] / 4.415;
		} else {
			return override / 4.415;
		}

    } // Once
    function getSoilTestPRunoffFactor(i) {
        if (soiltype[i] == 'A' || soiltype[i] == 'B' || soiltype[i] == 'C' || soiltype[i] == 'L' || soiltype[i] == 'N' || soiltype[i] == 'O') return 0.2;
        else if (soiltype[i] == 'D' || soiltype[i] == 'G' || soiltype[i] == 'K' || soiltype[i] == 'M' || soiltype[i] == 'Q' || soiltype[i] == 'T' || soiltype[i] == 'Y') return 0.19;
    }

    function getPApplicationFactor(i, cover) {
        var papprate = getPApplicationRate(i, cover);
        if (cover == 2 || cover == 4 || cover == 6 || cover == 7 || cover == 8) {
            return papprate * 0.00054585152838;
        } else if (cover == 1 || cover == 3 || cover == 5 || cover == 15) {
            return papprate * 0.00043668122271;
        }
        return 0;
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
            return retvar * 0.053 * 2.2 * 2.29 * (getSeasonalUtilizationRate(i, cover) / (getCattleAverageDailyIntake() / 2000));
        } else if (cover == 8) {
            if (soiltype[i] == 'A' || soiltype[i] == 'B' || soiltype[i] == 'C' || soiltype[i] == 'L' || soiltype[i] == 'N' || soiltype[i] == 'O') return 34;
            else if (soiltype[i] == 'D' || soiltype[i] == 'G' || soiltype[i] == 'K' || soiltype[i] == 'M' || soiltype[i] == 'Q' || soiltype[i] == 'T' || soiltype[i] == 'Y') return 39;
        } else if (cover == 15) {
            return 14.75;
        }
        return 0;
    } // For every land cover point
    function getSeasonalUtilizationRate(i, cover) {
        return (cover == 6 || cover == 7) ? 0.35 : 0;
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
