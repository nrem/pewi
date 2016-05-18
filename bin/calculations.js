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
        landUseType;
    this.update = function () {
//        console.log("Updating...");
//		console.log(global.update);
        // Update
		for(var year in global.update) {
            if(global.data[year] == 0 || global.data[year] == undefined) continue;
			if(global.update[year] == true) {
				setLandUseType(year);
				setYear(year);
				updateYear(year);
			}
		}
	}

	function setLandUseType(year) {
		landUseType = global.data[year].baseLandUseType.data;
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
        resetLandUseTypeValuesAreasFor(year);

//        bio.init();
        erosion.init();

        for (var i = 0; i <= landUseType.length; i++) {
            if (landUseType[i] > 0) {
                yieldVals.update(i);
                nitrates.update(i);
                //phos.update(i);
                carbon.update(i);
                bio.update(i);

                //sediment.update(i);
                erosion.update(i);
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
        //console.log(yieldVals.getCornGrainYield());
        //console.log(yieldVals.soybeanYield);
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
				setLandUseType(year);
				setYear(year);

		        for (var i = 0; i <= landUseType.length; i++) {
		            if (landUseType[i] > 0) {
		                nitrates.update(i);
		                erosion.update(i);
		            }
		        }
		        for (i = 0; i < landUseType.length; i++) {
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
		landUseType = global.data[year].baseLandUseType.data;
		soilType = getSubdataValueWithName("soiltype", year);
		datapointarea = getSubdataValueWithName("area", year);
	    for (var i = 1; i < landUseTypes.length; i++) {

	        global.landUseTypes[year][landUseTypes[i]] = {
	            name: landUseTypes[i],
	            area: 0,
	            percent: 0
	        };
	    }
	}
    var landUseType,
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
            [6.3, 3.6, 4.3, 5.6, 3.6, 4.1, 4.2, 6.5, 6.4, 3.6, 6.9, 6.7, 6.3], //alfalfa, grass/hay
            [275, 125, 85, 275, 245, 130, 85, 275, 175, 85, 275, 175, 275], //wood
            [6.3, 3.6, 4.3, 5.6, 3.6, 4.1, 4.2, 6.5, 6.4, 3.6, 6.9, 6.7, 6.3], //cattle
            [1.04, 0, 1, 0.96, 0, 0.93, 0.98, 1.03, 1.06, 0.83, 1.09, 1.12, 0.97],
            [(1+(2*(84-25)/(100-25))), (1+(2*(61-25)/(100-25))), (1+(2*(82-25)/(100-25))), (1+(2*(61-25)/(100-25))),
              (1+(2*(61-25)/(100-25))), (1+(2*(68-25)/(100-25))), (1+(2*(82-25)/(100-25))), (1+(2*(76-25)/(100-25))),
              (1+(2*(92-25)/(100-25))), (1+(2*(61-25)/(100-25))), (1+(2*(93-25)/(100-25))), (1+(2*(98-25)/(100-25))),
              (1+(2*(85-25)/(100-25)))] //herb
        ],
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
        //landUseType(i);
        soiltype = getSoilType(i);
        yieldPrecipitationMultiplier = getYieldPrecipitationMultiplier(i);
        // Corn Grain Yield
        setCornGrainYield(i);
        // Conventional Corn Area
        global.landUseTypes[year][landUseTypes[1]].area += (landUseType[i] == 1) ? datapointarea[i] : 0;
        // Conservation Corn Area
        global.landUseTypes[year][landUseTypes[2]].area += (landUseType[i] == 2) ? datapointarea[i] : 0;

        // Soybean Yield
        setSoybeanYield(i);
        // Conventional Soybean Area
        global.landUseTypes[year][landUseTypes[3]].area += (landUseType[i] == 3) ? datapointarea[i] : 0;
        // Conservation Soybean Area
        global.landUseTypes[year][landUseTypes[4]].area += (landUseType[i] == 4) ? datapointarea[i] : 0;

        // Alfalfa Hay Yield
        setAlfalfaHayYield(i);
        // Alfalfa Hay Area
        global.landUseTypes[year][landUseTypes[5]].area += (landUseType[i] == 5) ? datapointarea[i] : 0;

        // Grass Hay Yield
        setGrassHayYield(i);
        // Grass Hay Area
        global.landUseTypes[year][landUseTypes[8]].area += (landUseType[i] == 8) ? datapointarea[i] : 0;

        // Wood Yield
        setWoodYield(i);
        // Wood Conventional Forest Area
        global.landUseTypes[year][landUseTypes[11]].area += (landUseType[i] == 11) ? datapointarea[i] : 0;
        // Wood Conservation Forest Area
        global.landUseTypes[year][landUseTypes[10]].area += (landUseType[i] == 10) ? datapointarea[i] : 0;

        // Cattle Yield
        setCattleYield(i);
        // Cattle Permanent Pasture Area
        global.landUseTypes[year][landUseTypes[6]].area += (landUseType[i] == 6) ? datapointarea[i] : 0;
        // Cattle Rotational Grazing Area
        global.landUseTypes[year][landUseTypes[7]].area += (landUseType[i] == 7) ? datapointarea[i] : 0;

        // Herbaceous Perennial Biomass Yield
        setHerbaceousPerennialBiomassYield(i);
        // Herbaceous Perennial Bioenergy Area
        global.landUseTypes[year][landUseTypes[12]].area += (landUseType[i] == 12) ? datapointarea[i] : 0;

        // Short-Rotation Woody Biomass Yield
        setShortRotationWoodyBiomassYield(i);
        // Short-Rotation Woody Bioenergy Area
        global.landUseTypes[year][landUseTypes[13]].area += (landUseType[i] == 13) ? datapointarea[i] : 0;

        // Wetland Yield
        // Wetland Area
        global.landUseTypes[year][landUseTypes[14]].area += (landUseType[i] == 14) ? datapointarea[i] : 0;

        // Mixed Fruits And Vegetables Yield
        setMixedFruitsAndVegetablesYield(i);
        // Mixed Fruits And Vegetables Area
        global.landUseTypes[year][landUseTypes[15]].area += (landUseType[i] == 15) ? datapointarea[i] : 0;
        // Results calculations
//        global.results[year].yield.corn_percent += (data[i] == 1) ? area
        //
    };
    this.calculate = function () {
        // Corn Grain Yield
        dataset['corn']["Value" + year] = yieldVals[year].corn.val;
        // Corn Grain Yield Index
        dataset['corn']["Year" + year] = 100 * (yieldVals[year].corn.val / yieldVals[year].corn.max);
        // Conventional Corn Percent
        global.landUseTypes[year][landUseTypes[1]].percent = global.landUseTypes[year][landUseTypes[1]].area / watershedArea * 100;
        // Conservation Corn Percent
        global.landUseTypes[year][landUseTypes[2]].percent = global.landUseTypes[year][landUseTypes[2]].area / watershedArea * 100;

        // Soybean Yield
        dataset['soybean']["Value" + year] = yieldVals[year].soybean.val;
        // Soybean Yield Index
        yieldVals[year].soybean.index = 100 * (yieldVals[year].soybean.val / yieldVals[year].soybean.max);
        dataset['soybean']["Year" + year] = yieldVals[year].soybean.index;
        // Conventional Soybean Percent
        global.landUseTypes[year][landUseTypes[3]].percent = global.landUseTypes[year][landUseTypes[3]].area / watershedArea * 100;
        // Conservation Soybean Percent
        global.landUseTypes[year][landUseTypes[4]].percent = global.landUseTypes[year][landUseTypes[4]].area / watershedArea * 100;

        // Alfalfa Hay Yield
        dataset['alfalfa']["Value" + year] = yieldVals[year].alfalfa.val;
        // Alfalfa Hay Yield Index
        yieldVals[year].alfalfa.index = 100 * (yieldVals[year].alfalfa.val / yieldVals[year].alfalfa.max);
        dataset['alfalfa']["Year" + year] = yieldVals[year].alfalfa.index;
        // Alfalfa Hay Percent
        global.landUseTypes[year][landUseTypes[5]].percent = global.landUseTypes[year][landUseTypes[5]].area / watershedArea * 100;

        // GrassHay Yield
        dataset['hay']["Value" + year] = yieldVals[year].grass.val;
        yieldVals[year].grass.index = 100 * (yieldVals[year].grass.val / yieldVals[year].grass.max);
        dataset['hay']["Year" + year] = yieldVals[year].grass.index;
        global.landUseTypes[year][landUseTypes[8]].percent = global.landUseTypes[year][landUseTypes[8]].area / watershedArea * 100;

        // Wood Yield
        dataset['timber']["Value" + year] = yieldVals[year].timber.val;
        // Wood Yield Index
        yieldVals[year].timber.index = 100 * (yieldVals[year].timber.val / yieldVals[year].timber.max);
        dataset['timber']["Year" + year] = yieldVals[year].timber.index;
        // Conventional Wood Percent
        global.landUseTypes[year][landUseTypes[11]].percent = global.landUseTypes[year][landUseTypes[11]].area / watershedArea * 100;
        // Conservation Wood Percent
        global.landUseTypes[year][landUseTypes[10]].percent = global.landUseTypes[year][landUseTypes[10]].area / watershedArea * 100;

        // Cattle
        dataset['cattle']["Value" + year] = yieldVals[year].cattle.val;
        yieldVals[year].cattle.index = 100 * (yieldVals[year].cattle.val / yieldVals[year].cattle.max);
        dataset['cattle']["Year" + year] = yieldVals[year].cattle.index;
        global.landUseTypes[year][landUseTypes[6]].percent = global.landUseTypes[year][landUseTypes[6]].area / watershedArea * 100;
        global.landUseTypes[year][landUseTypes[7]].percent = global.landUseTypes[year][landUseTypes[7]].area / watershedArea * 100;

        // Herbaceous Perennial Biomass Yield
        dataset['herbaceous']["Value" + year] = yieldVals[year].herb.val;
        // Herbaceous Perennial Biomass Yield Index
        dataset['herbaceous']["Year" + year] = 100 * (yieldVals[year].herb.val / yieldVals[year].herb.max);
        // Herbaceous Perennial Biomass Percent
        global.landUseTypes[year][landUseTypes[12]].percent = global.landUseTypes[year][landUseTypes[12]].area / watershedArea * 100;

        // Short-Rotation Woody Biomass Yield
        dataset['woody']["Value" + year] = yieldVals[year].woody.val;
        // Short-Rotation Woody Biomass Yield Index
        dataset['woody']["Year" + year] = 100 * (yieldVals[year].woody.val / yieldVals[year].woody.max);
        // Short-Rotation Woody Bioenergy Percent
        global.landUseTypes[year][landUseTypes[13]].percent = global.landUseTypes[year][landUseTypes[13]].area / watershedArea * 100;

        // Mixed Fruits And Vegetables Yield
        dataset['mixed']["Value" + year] = yieldVals[year].fruitveggie.val;
        // Mixed Fruits And Vegetables Index
        dataset['mixed']["Year" + year] = 100 * (yieldVals[year].fruitveggie.val / yieldVals[year].fruitveggie.max);
        // Mixed Fruits And Vegetables Percent
        global.landUseTypes[year][landUseTypes[15]].percent = global.landUseTypes[year][landUseTypes[15]].area / watershedArea * 100;

    };

    //////////////Corn Grain Yield///////////////////
    function setCornGrainYield(i) {
        yieldVals[year].corn.val += yieldPrecipitationMultiplier * getCornGrainYield(i);
        setCornGrainMax(i);
    }

    function getCornGrainYield(i) {
        if (landUseType[i] == 1 || landUseType[i] == 2) {

            return unitYield[0][soiltype] * datapointarea[i];
        } else {
            return 0;
        }
    }

    function setCornGrainMax(i) {
        yieldVals[year].corn.max += unitYield[0][soiltype] * datapointarea[i];
    }

    //////////////Soybean Yield///////////////////
    function setSoybeanYield(i) {
        yieldVals[year].soybean.val += yieldPrecipitationMultiplier * getSoybeanYield(i);
        setSoybeanMax(i);
    }

    function getSoybeanYield(i) {
        if (landUseType[i] == 3 || landUseType[i] == 4) {
            return unitYield[1][soiltype] * datapointarea[i];
        } else {
            return 0;
        }
    }

    function setSoybeanMax(i) {
        yieldVals[year].soybean.max += unitYield[1][soiltype] * datapointarea[i];
    }

    //////////////Alfalfa Hay Yield///////////////////
    function setAlfalfaHayYield(i) {
        yieldVals[year].alfalfa.val += yieldPrecipitationMultiplier * getAlfalfaHayYield(i);
        setAlfalfaHayMax(i);
    }

    function getAlfalfaHayYield(i) {
        if (landUseType[i] == 5) return unitYield[2][soiltype] * datapointarea[i];
        else return 0;
    }

    function setAlfalfaHayMax(i) {
        yieldVals[year].alfalfa.max += unitYield[2][soiltype] * datapointarea[i];
    }

    //////////////GrassHay Yield///////////////////
    function setGrassHayYield(i) {
        yieldVals[year].grass.val += yieldPrecipitationMultiplier * getGrassHayYield(i);
        setGrassHayMax(i);
    }

    function getGrassHayYield(i) {
        if (landUseType[i] == 8) return unitYield[2][soiltype] * datapointarea[i];
        else return 0;
    }

    function setGrassHayMax(i) {
        yieldVals[year].grass.max += unitYield[2][soiltype] * datapointarea[i];
    }

    //////////////Wood Yield///////////////////
    function setWoodYield(i) {
        yieldVals[year].timber.val += yieldPrecipitationMultiplier * getWoodYield(i);
        setWoodMax(i);
    }

    function getWoodYield(i) {
        if (landUseType[i] == 10) return (0.7 * (unitYield[3][soiltype] * datapointarea[i]));
        else if (landUseType[i] == 11) return (unitYield[3][soiltype] * datapointarea[i]);
        else return 0;
    }

    function setWoodMax(i) {
        yieldVals[year].timber.max += unitYield[3][soiltype] * datapointarea[i];
    }

    //////////////Cattle Yield///////////////////
    function setCattleYield(i) {
        yieldVals[year].cattle.val += yieldPrecipitationMultiplier * getCattleSupported(i);
        setCattleMax(i);
    }

    function getCattleSupported(i) {
        if (landUseType[i] == 6 || landUseType[i] == 7) {
//            console.log(getSeasonalUtilizationRate(i), cattleAverageDailyIntake, GRAZING_SEASON_LENGTH, unitYield[4][soiltype], datapointarea[i]);
            return (getSeasonalUtilizationRate(i) / ((cattleAverageDailyIntake / 2000) * GRAZING_SEASON_LENGTH) * unitYield[4][soiltype] * datapointarea[i]);
        }
        else return 0;
    }

    function getSeasonalUtilizationRate(i) {
        if (landUseType[i] == 6) return 0.35;
        else if (landUseType[i] == 7) return 0.55;
        else return 0;
    }

    function setCattleMax(i) {
        yieldVals[year].cattle.max += (0.55 / ((cattleAverageDailyIntake / 2000) * GRAZING_SEASON_LENGTH) * unitYield[4][soiltype] * datapointarea[i]);
    }

    //////////////Herbaceous Perennial Biomass Yield///////////////////
    function setHerbaceousPerennialBiomassYield(i) {
        yieldVals[year].herb.val += yieldPrecipitationMultiplier * getHerbaceousPerennialBiomassYield(i);
        setHerbaceousPerennialBiomassMax(i);
    }

    function getHerbaceousPerennialBiomassYield(i) {
        if (landUseType[i] == 12) return unitYield[6][soiltype] * datapointarea[i];
        else return 0;
    }

    function setHerbaceousPerennialBiomassMax(i) {
        yieldVals[year].herb.max += unitYield[6][soiltype] * datapointarea[i];
    }

    //////////////Short-Rotation Woody Biomass Yield///////////////////
    function setShortRotationWoodyBiomassYield(i) {
        yieldVals[year].woody.val += getShortRotationWoodyBiomassYield(i);
        setShortRotationWoodyBiomassMax(i);
    }

    function getShortRotationWoodyBiomassYield(i) {
        return (landUseType[i] == 13) ? 60.8608 * datapointarea[i] : 0;
    }

    function setShortRotationWoodyBiomassMax(i) {
        yieldVals[year].woody.max += 60.8608 * datapointarea[i];
    }

    //////////////Mixed Fruits and Vegetables Yield///////////////////
    function setMixedFruitsAndVegetablesYield(i) {
      yieldVals[year].fruitveggie.val += getMixedFruitsAndVegetablesYield(i);
      setMixedFruitsAndVegetablesMax(i);
    }

    function getMixedFruitsAndVegetablesYield(i) {
        if (landUseType[i] == 15) return getYieldPrecipitationMultiplier(i) * 7.34 * datapointarea[i] * getSoilTypeMultiplier(i);
        else return 0;
    }

    function setMixedFruitsAndVegetablesMax(i) {
        yieldVals[year].fruitveggie.max += 7.34 * datapointarea[i] * getSoilTypeMultiplier(i);
    }

    function getYieldPrecipitationMultiplier(i) {
        if (landUseType[i] > 0 && landUseType[i] < 5) {
            if (global.data.precipitation[year] == 24.58 || global.data.precipitation[year] == 45.10) return 0.75;
            else if (global.data.precipitation[year] == 28.18 || global.data.precipitation[year] == 36.47) return 0.9;
            else if (global.data.precipitation[year] == 30.39 || global.data.precipitation[year] == 32.16 || global.data.precipitation[year] == 34.34) return 1;
        } else if ((landUseType[i] > 4 && landUseType[i] < 9) || landUseType[i] == 12) {
            if (global.data.precipitation[year] > 24.58 && global.data.precipitation[year] < 45.10) return 1;
            else return 0.95;
        } else if (landUseType[i] == 15) {
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
		landUseType = global.data[year].baseLandUseType.data;
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

    //Nitrate Variables
    var landUseType,
        wetland,
        watershedPercent = [],
        //Nitrate-N Concentration Max
        max = 100 * 0.14 * 2.11,
        //Nitrate-N Concentration Min
        min = 2,
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
        if ((landUseType[i] > 0 && landUseType[i] < 6) || landUseType[i] == 15) {
            return dataPointArea[i];
        } else {
            return 0;
        }
    }

    //Wetland Multiplier
    function setWetlandMultiplier(i) {
        if (wetland[i] == 1 && landUseType[i] == 14) {
            return 1;
        } else {
            return 0;
        }
    }

    function setConservationMultiplier(i) {
        if (landUseType[i] == 2 || landUseType[i] == 4) {
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

        //Nitrate-N Concentration
        for (var i = 0; i < subwatershed[year].length; i++) {
            nitratesPPM[year] += (subwatershedArea[i] * ppmSubwatershed[year][i]) / watershedArea;
        }
//        console.log("NITRATESPPM ******************", nitratesPPM[year]);

        //
        for (var i = 0; i < subwatershed[year].length; i++) {
            watershedPercent[i] = ppmSubwatershed[year][i] * (subwatershedArea[i] / watershedArea) / nitratesPPM[year];
            global.watershedPercent[year][i] = watershedPercent[i];
        }
        //        console.log("WATERSHEDPERCENT ********************", watershedPercent[i]);
        //        console.log("GLOBAL.watershedPercent[year][i]   **********************************", global.watershedPercent[year][i]);
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

                //Nitrate Wetland Multiplier
                if (subwatershed[year][i].wetland != 0 && subwatershed[year][i].wetland != null) {
                    wet = 0.48;
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

            //Nitrate-N Concentration Subwatershed
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

        //Nitrates Pollution Control Index
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
		landUseType = global.data[year].baseLandUseType.data;
		dataPointArea = global.data[year].area.data;
	}
	var year = global.year;
    var landUseType;

    //Carbon Sequestration Multiplier
    var carbonMultiplier = [0, 161.87, 0, 161.87, 202.34, 117.36, 117.36, 117.36, 433.01, 1485.20, 1485.20, 485.62, 1897.98, 1234.29, 0];
    var carbonSequestration = {1:0, 2:0, 3:0};

    //Carbon Sequestration Mins and Max per cell/unit
    var carbonMax = 1897.98 * watershedArea;
    var carbonMin = 0,

        dataPointArea;
    //console.log(carbonMax);
    this.update = function (i) {
        setCarbon(i);
    };

    function setCarbon(i) {
        //console.log("j");
        carbonSequestration[year] += carbonMultiplier[landUseType[i] - 1] * dataPointArea[i];
        //console.log(carbonSequestration);
        //console.log(landUseTypeArea[landUseType[i]]);
        //pewiData[21][i] = carbonMultiplier[i-1]*10;
    }

    this.calculate = function () {
        //Carbon Sequestration Index Output
        dataset['carbon']["Year" + year] = 100 * (carbonSequestration[year] - carbonMin) / (carbonMax - carbonMin);

        //Carbon Sequestration Output
        dataset['carbon']["Value" + year] = carbonSequestration[year];
        carbonSequestration[year] = 0;
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

        nativeVegetationArea = 0, nativeVegetationPercent,
        comparativelyHighDiversityOrLowInputArea = 0, comparativelyHighDiversityOrLowInputPercent,
        otherHighDiversityArea = 0, otherHighDiversityPercent,
        streamBufferArea = 0, streamBufferPercent,
        wetlandArea = 0, wetlandPercent,
        strategicWetlandArea = {1:0, 2:0, 3:0}, strategicWetlandPercent,
        forestArea = 0, conservationForestPercent,
        conservationForestArea = 0,
        grasslandPercent, grasslandArea = 0,
        comparativelyHighDiversityOrLowInputindex = 0,
        nativePNindex = 0, nonNativePNindex = 0, pGindex = 0, streamNindex = 0,
        streamGindex = 0, wetlandNindex = 0, wetlandGindex = 0, forestGindex = 0,
        grasslandGindex = 0;

    this.update = function (i) {
        if(year == 2) {
            //console.log(year);
        }

        setNativeVegetationArea(i);
        setComparativelyHighDiversityOrLowInputArea(i);
        setOtherHighDiversityArea(i);
        setStreamBufferArea(i);
        setWetlandArea(i);
        setStrategicWetlandArea(i);
		// console.log(strategicWetlandArea, year);
        setForestArea(i);
        setConservationForestArea(i);
        setGrasslandArea(i);
    };
    var x = 0;

    this.calculate = function () {
//        console.log("//////////////////// BIO INDICES START ///////////////////")

        var y = 0;
        x = 0;

        //console.log(x);

        setNativeVegetationPercent();
        setComparativelyHighDiversityOrLowInputPercent();
        setOtherHighDiversityPercent();
        setStreamBufferPercent();
        setWetlandPercent();
        setStrategicWetlandPercent();
        setConservationForestPercent();
        setGrasslandPercent();
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

//        console.log("//////////////////// BIO INDICES END ///////////////////");
        dealloc();
    };

	function dealloc() {
		strategicWetlandArea[year] = 0;
        nativeVegetationArea = 0;
        nativeVegetationPercent = 0;
        comparativelyHighDiversityOrLowInputArea = 0;
        comparativelyHighDiversityOrLowInputPercent = 0;
        otherHighDiversityArea = 0;
        otherHighDiversityPercent = 0;
        streamBufferArea = 0;
        streamBufferPercent = 0;
        wetlandArea = 0;
        wetlandPercent = 0;
        strategicWetlandPercent = 0;
        forestArea = 0;
        conservationForestArea = 0;
        grasslandArea = 0;
        conservationForestPercent = 0;
        grasslandPercent = 0;
        comparativelyHighDiversityOrLowInputindex = 0;
        nativePNindex = 0;
        nonNativePNindex = 0;
        pGindex = 0;
        streamNindex = 0;
        streamGindex = 0;
        wetlandNindex = 0;
        wetlandGindex = 0;
        forestGindex = 0;
        grasslandGindex = 0;
        x = 0;



	}

    /**
     * Sets the following Biodiversity indices:
     * -Native Vegetation Points
     * -High Diversity Biodiversity Points
     * -High Diversity Game Wildlife Points
     * -Stream Buffer Points
     * -Stream Buffer Points Game Index
     * -Wetland Points Native Index
     * -Wetland Points Game Index
     * -Forest Points Game Index
     */
    function setTheIndexes() {
        // Native Vegetation Points
        if (nativeVegetationPercent >= 100) {
          nativePNindex = 4;
        }
        else if (nativeVegetationPercent >= 50) {
          nativePNindex = 3;
        }
        else if (nativeVegetationPercent >= 25) {
          nativePNindex = 2;
        }
        else if (nativeVegetationPercent >= 10) {
          nativePNindex = 1;
        }
        else {
          nativePNindex = 0;
        }

        // High Diversity Biodiversity Points
        if (otherHighDiversityPercent + otherHighDiversityPercent >= 100) {
            nonNativePNindex = 1.5;
        }
        else if (otherHighDiversityPercent + otherHighDiversityPercent >= 50) {
          nonNativePNindex = 1;
        }
        else if (otherHighDiversityPercent + otherHighDiversityPercent >= 10) {
          nonNativePNindex = 0.5;
        }
        else {
          nonNativePNindex = 0;
        }

        // High Diversity Game Wildlife Points
        if (nativeVegetationPercent + otherHighDiversityPercent >= 100) {
          pGindex = 4;
        }
        else if (nativeVegetationPercent + otherHighDiversityPercent >= 50) {
          pGindex = 3;
        }
        else if (nativeVegetationPercent + otherHighDiversityPercent >= 25) {
          pGindex = 2;
        }
        else if (nativeVegetationPercent + otherHighDiversityPercent >= 10) {
          pGindex = 1;
        }

        // Steam Buffer Points
        if (streamBufferPercent >= 0 && streamBufferPercent < 10) {
            streamNindex = 0;
        }
        else if (streamBufferPercent >= 10 && streamBufferPercent < 50) {
            streamNindex = 0.5;
        }
        else if (streamBufferPercent >= 50 && streamBufferPercent < 100) {
            streamNindex = 1.0;
        }
        else if (streamBufferPercent == 100) {
            streamNindex = 1.5;
        }

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

        //Grassland Points
        if (grasslandPercent >= 5) {
          grasslandGindex = 1;
        }
        else {
          grasslandGindex = 0;
        }

        //Comparatively High Diversity Or Low Input Points
        if (nativeVegetationPercent + otherHighDiversityPercent + comparativelyHighDiversityOrLowInputPercent >= 100) {
          comparativelyHighDiversityOrLowInputindex = 1.5;
        }
        else if (nativeVegetationPercent + otherHighDiversityPercent + comparativelyHighDiversityOrLowInputPercent >= 50) {
          comparativelyHighDiversityOrLowInputindex = 1;
        }
        else if (nativeVegetationPercent + otherHighDiversityPercent + comparativelyHighDiversityOrLowInputPercent >= 10) {
          comparativelyHighDiversityOrLowInputindex = 0.5;
        }
        else {
          comparativelyHighDiversityOrLowInputindex = 0;
        }


//        console.log("conservationForestPercent: ", conservationForestPercent);
//        console.log("Native Vegetation Points: ", nativePNindex);
//        console.log("High Diversity Biodiversity Points: ", nonNativePNindex);
//        console.log("High Diversity Game Wildlife Points: ", pGindex);
//        console.log("Stream buffer points: ", streamNindex);
//        console.log("Stream bugger points game index: ", streamGindex);
//        console.log("Wetland points native index: ", wetlandNindex);
//        console.log("Wetland points game index: ", wetlandGindex);
//        console.log("Forest game index: ", forestGindex);
//        console.log("Grassland point index: ", grasslandGindex);
    }

    function setNativeIndex() {
        dataset['biodiversity']['Year' + year] = 10 * (nativePNindex + nonNativePNindex + comparativelyHighDiversityOrLowInputindex + wetlandNindex + streamNindex);
        dataset['biodiversity']['Value' + year] = nativePNindex + nonNativePNindex + comparativelyHighDiversityOrLowInputindex + wetlandNindex + streamNindex;
    }

    function setGameIndex() {
        dataset['game']['Year' + year] = 10 * (pGindex + comparativelyHighDiversityOrLowInputindex + forestGindex + grasslandGindex + wetlandGindex + streamGindex);
        dataset['game']['Value' + year] = pGindex + comparativelyHighDiversityOrLowInputindex + forestGindex + grasslandGindex + wetlandGindex + streamGindex;
    }

    function setNativeVegetationArea(i) {
        if (global.data[year].baseLandUseType.data[i] == 9 || global.data[year].baseLandUseType.data[i] == 10 || global.data[year].baseLandUseType.data[i] == 14) {
            nativeVegetationArea += dataPointArea[i];
        }
    }

    function setNativeVegetationPercent() {
        nativeVegetationPercent = 100 * nativeVegetationArea / watershedArea;
    }

    function setOtherHighDiversityArea(i) {
        if (global.data[year].baseLandUseType.data[i] == 7 || global.data[year].baseLandUseType.data[i] == 11 || global.data[year].baseLandUseType.data[i] == 15) {
            otherHighDiversityArea += dataPointArea[i];
        }
    }

    function setOtherHighDiversityPercent() {
        otherHighDiversityPercent = 100 * otherHighDiversityArea / watershedArea;
    }

    function setComparativelyHighDiversityOrLowInputArea(i) {
          if (global.data[year].baseLandUseType.data[i] == 2 || global.data[year].baseLandUseType.data[i] == 4 ||
          global.data[year].baseLandUseType.data[i] == 8 || global.data[year].baseLandUseType.data[i] == 12 || global.data[year].baseLandUseType.data[i] == 13) {
            comparativelyHighDiversityOrLowInputArea += dataPointArea[i];
          }
        }

        function setComparativelyHighDiversityOrLowInputPercent() {
          comparativelyHighDiversityOrLowInputPercent = 100 * comparativelyHighDiversityOrLowInputArea / watershedArea;
        }

    function setStreamBufferArea(i) {
        if (global.data[year].streamnetwork.data[i] == 1) {
            if (global.data[year].baseLandUseType.data[i] == 2 || global.data[year].baseLandUseType.data[i] == 4 || global.data[year].baseLandUseType.data[i] == 7 || global.data[year].baseLandUseType.data[i] == 8 ||           global.data[year].baseLandUseType.data[i] == 9 || global.data[year].baseLandUseType.data[i] == 10 || global.data[year].baseLandUseType.data[i] == 11 || global.data[year].baseLandUseType.data[i] == 12 || global.data[year].baseLandUseType.data[i] == 13 || global.data[year].baseLandUseType.data[i] == 14 || global.data[year].baseLandUseType.data[i] == 15) {
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
        if (global.data[year].baseLandUseType.data[i] == 14) {
            wetlandArea += dataPointArea[i];
        }
    }

    function setWetlandPercent() {
        wetlandPercent = 100 * wetlandArea / watershedArea;
    }

    function setStrategicWetlandArea(i) {
        if (global.data[year].wetland.data[i] == 1) {
            if (global.data[year].baseLandUseType.data[i] == 14) {
                strategicWetlandArea[year]++;
            }
        }
    }

    function setStrategicWetlandPercent() {
        strategicWetlandPercent = 100 * strategicWetlandArea[year] / strategicArea;
    }

    function setForestArea(i) {
        if (global.data[year].baseLandUseType.data[i] == 10 || global.data[year].baseLandUseType.data[i] == 11) {
            forestArea += dataPointArea[i];
        }
    }

    function setConservationForestArea(i) {
      if (global.data[year].baseLandUseType.data[i] == 10) {
        conservationForestArea += dataPointArea[i];
      }
    }

    function setConservationForestPercent() {
        conservationForestPercent = 100*conservationForestArea / watershedArea;
    }

    function setGrasslandArea(i) {
      if (global.data[year].baseLandUseType.data[i] == 7 || global.data[year].baseLandUseType.data[i] == 9 ||
          global.data[year].baseLandUseType.data[i] == 12) {
        grasslandArea += dataPointArea[i];
      }
    }

    function setGrasslandPercent() {
      grasslandPercent = 100*grasslandArea / watershedArea;
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
		landUseType = getSubdataValueWithName("baseLandUseType", year);
		soiltype = getSubdataValueWithName("soiltype", year);
		topography = getSubdataValueWithName("topography", year);
		streamnetwork = getSubdataValueWithName("streamnetwork", year);
		subwatershed = getSubdataValueWithName("subwatershed", year);
		wetland = getSubdataValueWithName("wetland", year);
		datapointarea = getSubdataValueWithName("area", year);

	    global.sedimentDeliveryToStream[year] = 0;
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
    var drainageclass,
        landUseType,
        soiltype,
        topography,
        streamnetwork,
        subwatershed,
        wetland,
        cols = 23,
        rows = 36,
        subwatersheds = [],
        pIndex = 0,
        sedimentDeliveryToStreamMin = 0, sedimentDeliveryToStreamMax = 0,
        datapointarea,
        phosphorusLoadMax = 0, phosphorusLoadMin = 0,
        grossErosionMax = 0, grossErosionMin = 0, year = global.year;

    this.init = function() {
//		console.log(global.sedimentDeliveryToStream[year]);
        global.sedimentDeliveryToStream[year] = 0;
        global.grossErosion[year] = 0;
        global.phosphorusLoad[year] = 0;
    }

    this.update = function (i) {
        global.sedimentDeliveryToStream[year] += getSedimentDeliveryToStream(i);
        var index = getGrossErosionPerUnitArea(i);
        var val = getGrossErosion(i, index);
        var val2 = phosphorusIndex(i, false, global.data.precipitation[year]);
        global.grossErosionSeverity[year][i] = getGrossErosionSeverity(i, val);
        global.grossErosion[year] += val;
        global.erosion[year][i] = index;

        pIndex += val2;
        global.pindex[year][i] = val2;
        global.riskAssessment[year][i] = pIndexRiskAssessment(val2);
        global.phosphorusLoad[year] += val2 * datapointarea[i] / 2000;
//		console.log(val*datapointarea[i]/2000);
        // Max & Min Values
        sedimentDeliveryToStreamMax += getSedimentDeliveryToStreamMax(i);
        sedimentDeliveryToStreamMin += getSedimentDeliveryToStreamMin(i);
        phosphorusLoadMax += getPhosphorusLoadMax(i);
        phosphorusLoadMin += getPhosphorusLoadMin(i);
        grossErosionMax += getGrossErosionMax(i);
        grossErosionMin += getGrossErosionMin(i);
    };

    this.calculateStepOne = function () {

    };
    this.calculateStepTwo = function (j) {
    };
    this.calculateStepThree = function () {
      // Sediment Control Index
      dataset['sediment']["Year" + year] = 100 * ((sedimentDeliveryToStreamMax - global.sedimentDeliveryToStream[year]) / (sedimentDeliveryToStreamMax - sedimentDeliveryToStreamMin));
      // Phosphorus Pollution Control Index
      dataset['phosphorus']["Year" + year] = 100 * ((phosphorusLoadMax - global.phosphorusLoad[year]) / (phosphorusLoadMax - phosphorusLoadMin));
      // Erosion Control Index
      dataset['erosion']["Year" + year] = 100 * ((grossErosionMax - global.grossErosion[year]) / (grossErosionMax - grossErosionMin));
      // Sediment Delivery to Stream Index
      dataset['sediment']["Value" + year] = global.sedimentDeliveryToStream[year];
      dataset['phosphorus']["Value" + year] = global.phosphorusLoad[year];
      dataset['erosion']["Value" + year] = global.grossErosion[year];

        dealloc();
    };

    function dealloc() {
        pIndex = 0;
        sedimentDeliveryToStreamMax = 0;
        sedimentDeliveryToStreamMin = 0;
        phosphorusLoadMax = 0;
        phosphorusLoadMin = 0;
        grossErosionMax = 0;
        grossErosionMin = 0;
    }

    // Sediment Delivery to Stream
    function getSedimentDeliveryToStream(i) {
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

    function getGrossErosionMin(i) {
        return ((rusle(i, 24.58, 9) + ephemeralGullyErosion(i, 9)) * datapointarea[i]);
    }

    function getGrossErosionMax(i) {
        return ((rusle(i, 45.10, 3) + ephemeralGullyErosion(i, 3)) * datapointarea[i]);
    }

    function getPhosphorusLoadMin(i) {
        return (phosphorusIndex(i, 9, 24.58) * datapointarea[i] / 2000);
    }

    function getPhosphorusLoadMax(i) {
        return (phosphorusIndex(i, 3, 45.10) * datapointarea[i] / 2000);
    }

    function getSedimentDeliveryToStreamMin(i) {
        return (((rusle(i, 24.58, 9) + ephemeralGullyErosion(i, 9)) * sedimentDeliveryRatio(i) * bufferFactor(i, 9)) * datapointarea[i]);
    }

    function getSedimentDeliveryToStreamMax(i) {
        return (((rusle(i, 45.10, 3) + ephemeralGullyErosion(i, 3)) * sedimentDeliveryRatio(i) * bufferFactor(i, 3)) * datapointarea[i]);
    }

    function erosionComponent(i, point, precip_override) {
		    if(precip_override !== undefined) {
          return (rusle(i, precip_override, point) + ephemeralGullyErosion(i, point)) * sedimentDeliveryRatio(i) * bufferFactor(i, point) * enrichmentFactor(i, point) * soilTestPErosionFactor(i);
		    }
        else {
          return (rusle(i, global.data.precipitation[year], point) + ephemeralGullyErosion(i, point)) * sedimentDeliveryRatio(i) * bufferFactor(i, point) * enrichmentFactor(i, point) * soilTestPErosionFactor(i);
  	    }
    }

    function runoffComponent(i, point, precip_override) {

        var cover = (point != false) ? point : landUseType[i];

        return runoffFactor(i, cover) * precipitationFactor(precip_override) * (getSoilTestPRunoffFactor(i) + getPApplicationFactor(i, cover));
    }

    function subsurfaceDrainageComponent(i, precip_override) {
        return precipitationFactor(precip_override) * getFlowFactor(i) * getSoilTestPDrainageFactor(i);
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
        var cover = (point != false) ? point : landUseType[i];
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

      //not sure what first if-then does......
	    if (point != false) {
	        if (point == 3) return 0.3;
	        else if (point == 9) return 0.001;
	    }

      //coverManagementFactor based on previous year's landUseType/landuse
      var temp = getSubdataValueWithName("baseLandUseType", year - 1),
          cover = (point !== false) ? point : landUseType[i],
          base5Return = 0.005,
          base6Return = 0.03,
          base7Return = 0.02,
          base8Return = 0.005,
          base9Return = 0.001,
          base10Return = 0.004,
          base11Return = 0.004,
          base12Return = 0.001,
          base13Return = 0.004,
          base14Return = 0.005;


          //console.log("Landuse type current year: ", cover);

          if (temp == undefined) {
            temp = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
          }

      if (temp != undefined) {
        if (temp[i] == 1) {
          if (cover == 1) return 0.15;
          else if (cover == 2) return 0.085;
          else if (cover == 3 || cover == 15) return 0.2;
          else if (cover == 4) return 0.116;
          else if (cover == 5) return base5Return;
          else if (cover == 6) return base6Return;
          else if (cover == 7) return base7Return;
          else if (cover == 8) return base8Return;
          else if (cover == 9) return base9Return;
          else if (cover == 10) return base10Return;
          else if (cover == 11) return base11Return;
          else if (cover == 12) return base12Return;
          else if (cover == 13) return base13Return;
          else if (cover == 14) return base14Return;
        }
        else if (temp[i] == 2) {
          if (cover == 1) return 0.085;
          else if (cover == 2) return 0.02;
          else if (cover == 3 || cover == 15) return 0.116;
          else if (cover == 4) return 0.031;
          else if (cover == 5) return base5Return;
          else if (cover == 6) return base6Return;
          else if (cover == 7) return base7Return;
          else if (cover == 8) return base8Return;
          else if (cover == 9) return base9Return;
          else if (cover == 10) return base10Return;
          else if (cover == 11) return base11Return;
          else if (cover == 12) return base12Return;
          else if (cover == 13) return base13Return;
          else if (cover == 14) return base14Return;
        }
        else if (temp[i] == 3 || temp[i] == 15) {
          if (cover == 1) return 0.26;
          else if (cover == 2) return 0.156;
          else if (cover == 3 || cover == 15) return 0.3;
          else if (cover == 4) return 0.178;
          else if (cover == 5) return base5Return;
          else if (cover == 6) return base6Return;
          else if (cover == 7) return base7Return;
          else if (cover == 8) return base8Return;
          else if (cover == 9) return base9Return;
          else if (cover == 10) return base10Return;
          else if (cover == 11) return base11Return;
          else if (cover == 12) return base12Return;
          else if (cover == 13) return base13Return;
          else if (cover == 14) return base14Return;
        }
        else if (temp[i] == 4) {
          if (cover == 1) return 0.156;
          else if (cover == 2) return 0.052;
          else if (cover == 3 || cover == 15) return 0.178;
          else if (cover == 4) return 0.055;
          else if (cover == 5) return base5Return;
          else if (cover == 6) return base6Return;
          else if (cover == 7) return base7Return;
          else if (cover == 8) return base8Return;
          else if (cover == 9) return base9Return;
          else if (cover == 10) return base10Return;
          else if (cover == 11) return base11Return;
          else if (cover == 12) return base12Return;
          else if (cover == 13) return base13Return;
          else if (cover == 14) return base14Return;
        }
        else if (temp[i] != 1 && temp[i] != 2 && temp[i] != 3 && temp[i] != 4 && temp[i] != 15) {
          if (cover == 1) return 0.085;
          else if (cover == 2) return 0.02;
          else if (cover == 3 || cover == 15) return 0.116;
          else if (cover == 4) return 0.031;
          else if (cover == 5) return base5Return;
          else if (cover == 6) return base6Return;
          else if (cover == 7) return base7Return;
          else if (cover == 8) return base8Return;
          else if (cover == 9) return base9Return;
          else if (cover == 10) return base10Return;
          else if (cover == 11) return base11Return;
          else if (cover == 12) return base12Return;
          else if (cover == 13) return base13Return;
          else if (cover == 14) return base14Return;
        }

        //Previous code had the replaced calculations for this portion where it
        //currently is. That is, the CONTENTS of those lines were in 1490-1495.
        //For the time being, I have left them however. However, the logic as to
        //why this code is there and not within the prior if-then loop (at lines
        // 1485-1490) is still unknown to me. Future investigation required.

        else return 0.03;
      }//

      else if (cover == 5 || cover == 8) return 0.005;
      else if (cover == 6) return 0.03;
      else if (cover == 7) return 0.02;
      else if (cover == 9 || cover == 12) return 0.001;
      else if (cover == 10 || cover == 11 || cover == 13) return 0.004;
      else if (cover == 14) return 0.005;

      else return 0.3;
    }

    function supportPracticeFactor(i, point) {
      cover = (point != false) ? point : landUseType[i];
      if (cover == 2 || cover == 4) {
        if (topography[i] > 1) {
          return contourSubfactor(i) * terraceSubfactor(i);
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
        if (landUseType[i] == 2 || landUseType[i] == 4) {
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
        var cover = (point != false) ? point : landUseType[i];
        if (cover == 1 || cover == 3 || cover == 15) return 4.5;
        else if (cover == 2 || cover == 4 || cover == 5) return 1.5;
        else return 0;
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
        var cover = (point != false) ? point : landUseType[i];
        if (cover == 2 || cover == 4 || (cover > 7 && cover < 15)) return 0.5;
        return 1;
    } // For every land cover point

    function enrichmentFactor(i, point) {
		var cover = (point != false) ? point : landUseType[i];
        if (cover == 1 || cover == 3 || cover == 15) return 1.1;
        return 1.3;
    } // For every land cover point

    function soilTestPErosionFactor(i) {
      return 0.7 * (500 + 3 * soilTestP(i)) * 2000/1000000;
    } // For every land cover point

    function soilTestP(i) {
      if (soiltype[i] == 'A' || soiltype[i] == 'B' || soiltype[i] == 'C' || soiltype[i] == 'L' || soiltype[i] == 'N' || soiltype[i] == 'O') return 30;
      else if (soiltype[i] == 'D' || soiltype[i] == 'G' || soiltype[i] == 'K' || soiltype[i] == 'M' || soiltype[i] == 'Q' || soiltype[i] == 'T' || soiltype[i] == 'Y') return 27;
    } //Based on definition, should be for every land type. As of this moment, however, there should be no in-calculation uses of it

    function runoffFactor(i, cover) {
        var temp = runoffCurveNumber(i, cover);
        return (0.000000799 * Math.pow(temp, 3)) - (0.0000484 * Math.pow(temp, 2)) + (0.00265 * temp - 0.085);
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
		}
    else {
      return override / 4.415;
		}

    } // Once
    function getSoilTestPRunoffFactor(i) {
      return 0.05 + (0.005 * soilTestP(i));
        //if (soiltype[i] == 'A' || soiltype[i] == 'B' || soiltype[i] == 'C' || soiltype[i] == 'L' || soiltype[i] == 'N' || soiltype[i] == 'O') return 0.2;
        //else if (soiltype[i] == 'D' || soiltype[i] == 'G' || soiltype[i] == 'K' || soiltype[i] == 'M' || soiltype[i] == 'Q' || soiltype[i] == 'T' || soiltype[i] == 'Y') return 0.19;
    }

    function getPApplicationFactor(i, cover) {
        var papprate = getPApplicationRate(i, cover);
        if (cover == 2 || cover == 4 || cover == 6 || cover == 7 || cover == 8) {
            return (papprate / 4.58) * 0.5 * 1 * 0.005;
        }
        else if (cover == 5) {
          return (papprate / 4.58) * 0.5 * 0.9 * 0.005;
        }
        else if (cover == 1 || cover == 3 || cover == 15) {
            return (papprate / 4.58) * 0.5 * ((0.6 + 1.0) / 2) * 0.005;
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
                    retvar = 3.6;
                    break;
                case 'C':
                    retvar = 4.3;
                    break;
                case 'D':
                    retvar = 5.6;
                    break;
                case 'G':
                    retvar = 3.6;
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
                    retvar = 3.6;
                    break;
                case 'C':
                    retvar = 4.3;
                    break;
                case 'D':
                    retvar = 5.6;
                    break;
                case 'G':
                    retvar = 3.6;
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
        }
        else if (cover == 8) {
            if (soiltype[i] == 'A' || soiltype[i] == 'B' || soiltype[i] == 'C' || soiltype[i] == 'L' || soiltype[i] == 'N' || soiltype[i] == 'O') return 34;
            else if (soiltype[i] == 'D' || soiltype[i] == 'G' || soiltype[i] == 'K' || soiltype[i] == 'M' || soiltype[i] == 'Q' || soiltype[i] == 'T' || soiltype[i] == 'Y') return 39;
        }
        else if (cover == 15) {
            return (3 * 5 * 0.25) + (15 * 2.8 * 0.25);
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
        if(topoSlopeRangeHigh[i] <= 5 && drainageclass[i] >= 60 && (subsoilGroup[i] == 1 || subsoilGroup[i] == 2)){
          return 0.1;
        } else if (permeabilityCode[i] <= 35 || permeabilityCode[i] == 58 || permeabilityCode[i] == 72 || permeabilityCode[i] == 75) {
          return 0.1;
        } else {
          return 0;
        }
    } // For every land cover point

    function getSoilTestPDrainageFactor(i) {
      if (soilTestP(i) <= 100) return 0.1;
      else if (soilTestP >100) return 0.2;
    }
};
