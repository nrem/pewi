var landCoverArea, area, streamArea, strategicArea, unitArea, subwatershedArea;

function initCalcs() {
    landCoverArea = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
    area=0, streamArea=0, strategicArea=0;
    unitArea=1;
    subwatershedArea = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
}

function setLandCoverArea(i) {
	if(landCoverArea[i] == undefined)
	{
		landCoverArea[i]=0;
	} else {
	    landCoverArea[i]+=unitArea;
	    area+=unitArea;

	}
}

function setStrategicWetland(i) {
    if(global.data[global.year].wetland.data[i] == 1) {strategicArea++;}
}

function setSubwatershedArea(i) {
	var subwatershed = global.data[global.year].subwatershed.data;
	if(subwatershed[i] != undefined && subwatershed[i] != "Subwatershed")
	{
		subwatershedArea[subwatershed[i]]++;
	}
}
function setStreamNetworkArea(i) {
	if(global.data[global.year].streamnetwork.data[i] == 1)
	{
		streamArea+=unitArea;
	}
}

var Score = function() {
	var yield = new Yield();
		nitrates = new Nitrates(),
		phos = new Phosphorus(),
		carbon = new Carbon(),
		bio = new Biodiversity(),
		sediment = new Sediment(),
		erosion = new Erosion(),
		landcover = global.data[global.year].baselandcover.data;
		
	this.update = function()
	{
		console.log("Updating...");
		// Update
		for(var i=0;i<=landcover.length;i++)
		{
			if(landcover[i]>0)
			{
				yield.update(i);
				nitrates.update(i);
				//phos.update(i);
				carbon.update(i);
				bio.update(i);

				//sediment.update(i);
				//erosion.update(i);
			}
		}
        for(var i=0;i<=landcover.length;i++)
        {
            if(landcover[i]>0)
            {
                bio.updateAdj(i);
            }
        }
		yield.calculate();
		nitrates.calculate();
		carbon.calculate();
		bio.calculate();
		//console.log(yield.getCornYield());
		//console.log(yield.soyYield);
		updatePlot=false;
		//for(var i=0; i<dataset.length; i++)
		//{
		//	console.log(dataset[i]);
		//}
		global.update = false;
	}
	
	this.nitrates = function()
	{
		// Update
		for(var i=0;i<=landcover.length;i++)
		{
			if(landcover[i]>0)
			{
				nitrates.update(i);
			}
		}
		nitrates.calculate();
	}
}
var Yield = function() {
	var data = global.data[global.year].baselandcover.data,
	    soil = global.data[global.year].soiltype.data,
		soilTypeId=["A","B","C","D","G","K","L","M","N","O","Q","T","Y"],
		yieldMultiplier = [0.5,0.3333,1,0.7],
		unitYield = [[223,0,214,206,0,200,210,221,228,179,235,240,209], //corn
	             [65,0,62,60,0,58,61,64,66,52,68,70,61], //soybean
				 [6.3,0,4.3,5.6,0,4.1,4.2,6.5,6.4,3.6,6.9,6.7,6.3], //alfalfa, grass/hay
	             [275,125,85,275,245,105,85,275,175,85,275,175,275], //timber
				 [6.3,0,4.3,5.6,0,4.1,4.2,6.5,6.4,3.6,6.9,6.7,6.3], //cattle
	             [1.04,0,1,0.96,0,0.93,0.98,1.03,1.06,0.83,1.09,1.12,0.97]],
		conservationYieldFactor = [0.945,0.975,0.975,0.975,0.9,0.9,0.9,0.975,0.9,0.975,0.975,0.9,0.9,0.9],
		yield = {
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
			}
		},
		cornmax = 0, soymax = 0,
		soiltype;
		
	this.update = function(i) {
		//landCoverType(i);
		soiltype = getSoilType(i);
		setCornYield(i);
		setSoyYield(i);
		setAlfalfaYield(i);
		setGrassHayYield(i);
		setTimberYield(i);
		setCattleYield(i);
		setFruitVeggieYield(i);
	}
	this.calculate = function() {
		yield.corn.index = 100 * (yield.corn.val / yield.corn.max);
		dataset[0]["Year" + global.year] = yield.corn.index;
		yield.soybean.index = 100 * (yield.soybean.val / yield.soybean.max);
		dataset[1]["Year" + global.year] = yield.soybean.index;
		yield.alfalfa.index = 100 * (yield.alfalfa.val / yield.alfalfa.max);
		dataset[2]["Year" + global.year] = yield.alfalfa.index;
		yield.grass.index = 100 * (yield.grass.val / yield.grass.max);
		dataset[3]["Year" + global.year] = yield.grass.index;
		yield.timber.index = 100 * (yield.timber.val / yield.timber.max);
		dataset[4]["Year" + global.year] = yield.timber.index;
		yield.cattle.index = 100 * (yield.cattle.val / yield.cattle.max);
		dataset[5]["Year" + global.year] = yield.cattle.index;
		yield.fruitveggie.index = 100 * (yield.fruitveggie.val / yield.fruitveggie.max);
		dataset[6]["Year" + global.year] = yield.fruitveggie.index;
	}
	
	//----------Corn Yield-------------------
	function setCornYield(i){
		yield.corn.val += getBaseCornYield(i) * getConservationYieldFactor(i);
		setCornMax(i);
	}
	function getBaseCornYield(i) {
		if(data[i] === 1 || data[i] === 2) {
			return unitYield[0][soiltype];
		} else {
			return 0;
		}
	}
	function getConservationYieldFactor(i){
		if(data[i] === 1 || data[i] === 3) {
			return 1;
		} else if(data[i] === 2 || data[i] === 4) {
			return conservationYieldFactor[soiltype];
		} else {
			return 0;
		}
	}
	function setCornMax(i) {
		yield.corn.max += unitYield[0][soiltype];
	}
	
	//----------Soy Yield--------------------
	function setSoyYield(i){
	    yield.soybean.val += getBaseSoyYield(i) * getConservationYieldFactor(i);
		setSoyMax(i);
	}
	function getBaseSoyYield(i) {
		if(data[i] === 3 || data[i] === 4) {
			return unitYield[1][soiltype];
		} else {
			return 0;
		}
	}
	function setSoyMax(i) {
		yield.soybean.max += unitYield[1][soiltype];
	}

	//---------Alfalfa Yield-----------------
	function setAlfalfaYield(i) {
		yield.alfalfa.val += getAlfalfaYield(i);
		setAlfalfaMax(i);
	}
	function getAlfalfaYield(i) {
		if(data[i] === 5) return unitYield[2][soiltype];
		else return 0;
	}
	function setAlfalfaMax(i) {
		yield.alfalfa.max += unitYield[2][soiltype];
	}
	
	//----------Grass Hay Yield--------------
	function setGrassHayYield(i) {
		yield.grass.val += getGrassHayYield(i);
		setGrassHayMax(i);
	}
	function getGrassHayYield(i) {
		if(data[i] === 8) return unitYield[2][soiltype];
		else return 0;
	}
	function setGrassHayMax(i) {
		yield.grass.max += unitYield[2][soiltype];
	}
	
	//----------Timber Yield-----------------
	function setTimberYield(i){
	    yield.timber.val += getTimberYield(i);
		setTimberMax(i);
	}
	function getTimberYield(i) {
		if(data[i] === 10 || data[i] === 11) return (unitYield[3][soiltype] * area);
		else return 0;
	}
	function setTimberMax(i) {
		yield.timber.max += unitYield[3][soiltype] * area;
	}

	//----------Cattle Yield-----------------
	function setCattleYield(i){
	    yield.cattle.val += getCattleYield(i);
		setCattleMax(i);
	}
	function getCattleYield(i) {
		var returnVar=0;
		if(data[i] === 6) returnVar += unitYield[4][soiltype] * area;
		if(data[i] === 7) returnVar += unitYield[4][soiltype] * 1.67 * 1.25 * area;
		return returnVar;
	}
	function setCattleMax(i) {
		yield.cattle.max += unitYield[4][soiltype] * 1.67 * 1.25 * area;
	}

	//------Mixed Fruit/Veggie Yield---------
	function setFruitVeggieYield(i) {
		yield.fruitveggie.val += getFruitVeggieYield(i);
		setFruitVeggieMax(i);
	}
	function getFruitVeggieYield(i) {
		if(data[i] === 15) return unitYield[5][soiltype] * 32.88 * area;
		else return 0;
	}
	function setFruitVeggieMax(i) {
		yield.fruitveggie.max += unitYield[5][soiltype] * 32.88 * area;
	}
	
	function getSoilType(i)
	{
	    var y=0;
	    switch(soil[i])
	    {
	        case soilTypeId[0]:
	            return y=0;
	            break;
	        case soilTypeId[1]:
	            return y=1;
	            break;
	        case soilTypeId[2]:
	            return y=2;
	            break;
	        case soilTypeId[3]:
	            return y=3;
	            break;
	        case soilTypeId[4]:
	            return y=4;
	            break;
	        case soilTypeId[5]:
	            return y=5;
	            break;
	        case soilTypeId[6]:
	            return y=6;
	            break;
	        case soilTypeId[7]:
	            return y=7;
	            break;
	        case soilTypeId[8]:
	            return y=8;
	            break;
	        case soilTypeId[9]:
	            return y=9;
	            break;
	        case soilTypeId[10]:
	            return y=10;
	            break;
	        case soilTypeId[11]:
	            return y=11;
	            break;
	        case soilTypeId[12]:
	            return y=12;
	            break;
            
	    }
	}
}
var Nitrates = function() {
	var nitratesPPM=0,
		rowCropMultiplier=0,
		wetlandMultiplier=0,
		conservationMultiplier=0,
		precipitationMultiplier= 0,
		precipitation = ["24.58",
						 "28.18",
						 "30.39",
						 "32.16",
						 "34.34",
						 "36.47",
						 "45.10"
						 ],
		subwatershedData = global.data[global.year].subwatershed.data,
		// Holds the multiplier accumulators for each subwatershed
		subwatershed = [],
		ppmSubwatershed = [];
	
	for(var i=0;i<subwatershedArea.length;i++)
	{
		var arr = {"row":0,
				    "wetland":0,
			   	    "conservation":0,
				    "precipitation":0};
				   
		subwatershed.push(arr);
	}
	
	var landcover = global.data[global.year].baselandcover.data;
	var wetland = global.data[global.year].wetland.data;
	var watershedPercent = [];
	var max = 100*0.14*2.11, min = 2,
		soilType = global.data[global.year].soiltype.data;
	
	this.update = function(i)
	{
        var f = subwatershedData[i];
		if(subwatershed[f] != null)
		{
			
			subwatershed[f].row += setRowCropMultiplier(i);
			subwatershed[f].wetland += setWetlandMultiplier(i);
			subwatershed[f].conservation += setConservationMultiplier(i);

		}
        subwatershed[f].precipitation = setPrecipitationMultiplier(i);
	}
	
	function setRowCropMultiplier(i)
	{
		if((landcover[i]>0 && landcover[i]<6) || landcover[i] == 15)
		{
			return unitArea;
		} else {
			return 0;
		}
	}
	
	function setWetlandMultiplier(i)
	{
		if(wetland[i]===1 && landcover[i]===14)
		{
			return 1;
		} else {
			return 0;
		}
	}
	
	function setConservationMultiplier(i)
	{
		if(landcover[i] === 2 || landcover[i] === 4)
		{
			if(soilType[i] === "A" || soilType[i] === "B" || soilType[i] === "C" || soilType[i] === "L" || soilType[i] === "N" || soilType[i] === "O")
			{
				return unitArea * 0.69;
			} else {
				return unitArea * 0.62;
			}
		} else {
			return unitArea;
		}
	}
	
	function setPrecipitationMultiplier(i)
	{
		var p = global.precipitation[global.year];
		if(p===24.58 || p===28.18) // If it's a dry year
		{
			return 0.86;
		} else if(p===30.39 || p===32.16 || p===34.34) { // If it's a normal year
			if(global.precipitation[global.year - 1] === 24.58 || global.precipitation[global.year - 1] === 28.18) {
				return 1.69;
			} else {
				return 1;
			}
		} else { // If it's a flood year
			if(global.precipitation[global.year - 1] === 24.58 || global.precipitation[global.year - 1] === 28.18) {
				return 2.11;
			} else {
				return 1;
			}
		}
	}
	
	function mapIt()	// The function updates the data for the watershed Nitrate map
	{
		if(subwatershed == undefined || subwatershed.length == null) {
			return console.alert("The subwatersheds are not defined. Try Nitrates.update() before calling this function.");
		}
		for(var i=1; i<subwatershed.length;i++)
		{
			nitratesPPM += (subwatershedArea[i]*ppmSubwatershed[i])/area;
		}

		for(var i=1; i<subwatershed.length;i++)
		{
			watershedPercent[i] = ppmSubwatershed[i]*(subwatershedArea[i]/area)/nitratesPPM;
			global.watershedPercent[i] = watershedPercent[i];
		}
	}
	
	this.calculate = function()
	{
		
		for(var i=0;i<subwatershedArea.length;i++)
		{
			var row=0,wet=0,cons=0,precip=0;
			if(subwatershedArea[i] != null && subwatershed != undefined && subwatershedArea[i] != 0)
			{
				if(subwatershed[i].row != null)
				{
					row = 0.14 * (subwatershed[i].row / subwatershedArea[i]);
				} else {
					row = 0;
				}
				if(subwatershed[i].wetland != 0 && subwatershed[i].wetland != null)
				{
					wet = 0.6;
				} else 
				{
					wet++;
				}
				if(subwatershed[i].conservation != 0 && subwatershed[i].conservation != null)
				{
					cons = (subwatershed[i].conservation / subwatershedArea[i]);
				} else {
					cons = 0;
				}/*
				if(subwatershed[i].precipitation != 0 && subwatershed[i].precipitation != null)
				{
					precip += subwatershed[i].precipitation / subwatershedArea[i];
				} else {
					precip += 0;
				}*/
				//console.log(row, wet, cons, precip);
				precip = setPrecipitationMultiplier(i);
			}
			if((100*row*wet*cons*precip) < 2) {
				ppmSubwatershed[i] = 2;
			} else {
				ppmSubwatershed[i] = 100*row*wet*cons*precip;
			}
			//console.log("Crop: " + row);
			//console.log("Wetland: " + wet);
			//console.log("Conservation: " + cons);
			//console.log("Precipitation: " + precip);
			//console.log("Subwatershed PPM: " + ppmSubwatershed[i]);
		}
		
		mapIt();
		//console.log("Nitrates PPM: " + nitratesPPM);
		dataset[7]['Year'+global.year] = 100*((max - nitratesPPM) / (max - min));
        dealloc();
	}

    function dealloc() {

    }
}
var Phosphorus = function() {
	this.update = function(i)
	{
		
	}
}
var Carbon = function() {
	var landCover = global.data[global.year].baselandcover.data;
	var carbonMultiplier = [0,161.87,0,161.87,202.34,117.36,117.36,117.36,433.01,1485.20,1485.20,48.56,1897.98,1234.29,0];
	var carbon = 0;
	var max=1897.98*area;
	var min=0;
	//console.log(max);
	this.update = function(i)
	{
		setCarbon(i);
	}
	
	function setCarbon(i)
	{
		//console.log("j");
		carbon += carbonMultiplier[landCover[i]-1]*unitArea;
		//console.log(carbon);
		//console.log(landCoverArea[landCover[i]]);
	    //pewiData[21][i] = carbonMultiplier[i-1]*10;
	}
	
	this.calculate = function()
	{
		// Needs a look-see
		dataset[9]["Year"+global.year] = 100*(carbon-min)/(max-min);
		carbon=0;
	}
}
var Biodiversity = function() {
    var data = global.data[global.year].group.data;
	var cols = 23,rows = 36;
            // Group ID,Count,proportion,percent of watershed
	var heterogeneityGroup = [["Low Spatial Low Temporal",0,0,0],
	["Low Spatial Medium Temporal",0,0,0], 		// 1
	["Low Spatial Medium Temporal 2",0,0,0],
	["Low Spatial High Temporal",0,0,0],		// 3
	["Medium Spatial Low Temporal",0,0,0],
	["Medium Spatial Medium Temporal",0,0,0],	// 5
	["Medium Spatial Medium Temporal 2",0,0,0],
	["High Spatial High Temporal",0,0,0],		// 7
	["High Spatial High Temporal 2",0,0,0],
	["High Spatial High Temporal 3",0,0,0], 	// 9
    ["High Spatial High Temporal 4",0,0,0]];
	var distinctCount=0;

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
	
	var adjacencyGroup = [["low-low -> low-low",0,0],
						  ["low-low -> low-medium",0,0],
					  	  ["low-low -> low-medium 2",0,0],
					  	  ["low-low -> low-high",0,0],
						  ["low-low -> medium-low",0,0],
						  ["low-low -> medium-medium",0,0],
						  ["low-low -> medium-medium 2",0,0],
						  ["low-low -> high-high",0,0],
						  ["low-low -> high-high 2",0,0],
						  ["low-low -> high-high 3",0,0],
                          ["low-low -> high-high 4",0,0],
						  ["low-medium -> low-low",0,0],
						  ["low-medium -> low-medium",0,0],
						  ["low-medium -> low-medium 2",0,0],
						  ["low-medium -> low-high",0,0],
						  ["low-medium -> medium-low",0,0],
						  ["low-medium -> medium-medium",0,0],
						  ["low-medium -> medium-medium 2",0,0],
						  ["low-medium -> high-high",0,0],
						  ["low-medium -> high-high 2",0,0],
						  ["low-medium -> high-high 3",0,0],
                          ["low-medium -> high-high 4",0,0],
						  ["low-medium 2 -> low-low",0,0],
						  ["low-medium 2 -> low-medium",0,0],
						  ["low-medium 2 -> low-medium 2",0,0],
						  ["low-medium 2 -> low-high",0,0],
						  ["low-medium 2 -> medium-low",0,0],
						  ["low-medium 2 -> medium-medium",0,0],
						  ["low-medium 2 -> medium-medium 2",0,0],
						  ["low-medium 2 -> high-high",0,0],
						  ["low-medium 2 -> high-high 2",0,0],
						  ["low-medium 2 -> high-high 3",0,0],
                          ["low-medium 2 -> high-high 4",0,0],
						  ["low-high -> low-low",0,0],
						  ["low-high -> low-medium",0,0],
						  ["low-high -> low-medium 2",0,0],
						  ["low-high -> low-high",0,0],
						  ["low-high -> medium-low",0,0],
						  ["low-high -> medium-medium",0,0],
						  ["low-high -> medium-medium 2",0,0],
						  ["low-high -> high-high",0,0],
						  ["low-high -> high-high 2",0,0],
						  ["low-high -> high-high 3",0,0],
                          ["low-high -> high-high 4",0,0],
						  ["medium-low -> low-low",0,0],
						  ["medium-low -> low-medium",0,0],
						  ["medium-low -> low-medium 2",0,0],
						  ["medium-low -> low-high",0,0],
						  ["medium-low -> medium-low",0,0],
						  ["medium-low -> medium-medium",0,0],
						  ["medium-low -> medium-medium 2",0,0],
						  ["medium-low -> high-high",0,0],
						  ["medium-low -> high-high 2",0,0],
						  ["medium-low -> high-high 3",0,0],
                          ["medium-low -> high-high 4",0,0],
						  ["medium-medium -> low-low",0,0],
						  ["medium-medium -> low-medium",0,0],
						  ["medium-medium -> low-medium 2",0,0],
						  ["medium-medium -> low-high",0,0],
						  ["medium-medium -> medium-low",0,0],
						  ["medium-medium -> medium-medium",0,0],
						  ["medium-medium -> medium-medium 2",0,0],
						  ["medium-medium -> high-high",0,0],
						  ["medium-medium -> high-high 2",0,0],
						  ["medium-medium -> high-high 3",0,0],
                          ["medium-medium -> high-high 4",0,0],
						  ["medium-medium 2 -> low-low",0,0],
						  ["medium-medium 2 -> low-medium",0,0],
						  ["medium-medium 2 -> low-medium 2",0,0],
						  ["medium-medium 2 -> low-high",0,0],
						  ["medium-medium 2 -> medium-low",0,0],
						  ["medium-medium 2 -> medium-medium",0,0],
						  ["medium-medium 2 -> medium-medium 2",0,0],
						  ["medium-medium 2 -> high-high",0,0],
						  ["medium-medium 2 -> high-high 2",0,0],
						  ["medium-medium 2 -> high-high 3",0,0],
                          ["medium-medium 2 -> high-high 4",0,0],
						  ["high-high -> low-low",0,0],
						  ["high-high -> low-medium",0,0],
						  ["high-high -> low-medium 2",0,0],
						  ["high-high -> low-high",0,0],
						  ["high-high -> medium-low",0,0],
						  ["high-high -> medium-medium",0,0],
						  ["high-high -> medium-medium 2",0,0],
						  ["high-high -> high-high",0,0],
						  ["high-high -> high-high 2",0,0],
						  ["high-high -> high-high 3",0,0],
                          ["high-high -> high-high 4",0,0],
						  ["high-high 2 -> low-low",0,0],
						  ["high-high 2 -> low-medium",0,0],
						  ["high-high 2 -> low-medium 2",0,0],
						  ["high-high 2 -> low-high",0,0],
						  ["high-high 2 -> medium-low",0,0],
						  ["high-high 2 -> medium-medium",0,0],
						  ["high-high 2 -> medium-medium 2",0,0],
						  ["high-high 2 -> high-high",0,0],
						  ["high-high 2 -> high-high 2",0,0],
						  ["high-high 2 -> high-high 3",0,0],
                          ["high-high 2 -> high-high 4",0,0],
						  ["high-high 3 -> low-low",0,0],
						  ["high-high 3 -> low-medium",0,0],
						  ["high-high 3 -> low-medium 2",0,0],
						  ["high-high 3 -> low-high",0,0],
						  ["high-high 3 -> medium-low",0,0],
						  ["high-high 3 -> medium-medium",0,0],
						  ["high-high 3 -> medium-medium 2",0,0],
						  ["high-high 3 -> high-high",0,0],
						  ["high-high 3 -> high-high 2",0,0],
						  ["high-high 3 -> high-high 3",0,0],
                          ["high-high 3 -> high-high 4",0,0],
                          ["high-high 4 -> low-low",0,0],
                          ["high-high 4 -> low-medium",0,0],
                          ["high-high 4 -> low-medium 2",0,0],
                          ["high-high 4 -> low-high",0,0],
                          ["high-high 4 -> medium-low",0,0],
                          ["high-high 4 -> medium-medium",0,0],
                          ["high-high 4 -> medium-medium 2",0,0],
                          ["high-high 4 -> high-high",0,0],
                          ["high-high 4 -> high-high 2",0,0],
                          ["high-high 4 -> high-high 3",0,0],
                          ["high-high 4 -> high-high 4",0,0]];
	var adjacencySubtotal=0,
		nativePerennialsArea=0, nativePerennialsPercent,
		nonNativePerennialsArea=0, nonNativePerennialsPercent,
		streamBufferArea=0, streamBufferPercent,
		wetlandArea=0, wetlandPercent,
		strategicWetlandArea=0, strategicWetlandPercent,
		forestArea=0, forestPercent;
		
	var nativePNindex=0, nonNativePNindex=0, pGindex=0, streamNindex=0,
		streamGindex=0, wetlandNindex=0, wetlandGindex=0, streamGindex=0, forestGindex=0;
						
	this.update = function(i) {
		setHeterogeneityGroup(i);

		setNativePerennialsArea(i);
		setNonNativePerennialsArea(i);
		setStreamBufferArea(i);
		setWetlandArea(i);
		setStrategicWetlandArea(i);
		setForestArea(i);
	}
    var x=0;
	this.updateAdj = function(i) {
        if(x<heterogeneityGroup.length)
        {
            setHeterogeneityGroupProportions(x);
            setHeterogeneityGroupDistinctCount(x);
        }
        x++;
		setAdjacencyGroup(i);
		//setAdjacencyGroupCount(i);
		setAdjacencyGroupSubtotal(i);
	}
	var contagion = 0;
	this.calculate = function() {
        //console.log(adjacencyGroup);
        //console.log(heterogeneityGroup);
		setAdjacencyGroupProportion();
        //console.log(heterogeneityGroup);
        //console.log("Adjacency Subtotal: " + adjacencySubtotal);
        //console.log(adjacencyGroup);
        var x = 0, y =0;
		for(var i=0;i<heterogeneityGroup.length;i++)
		{
			for(var j=0;j<11;j++)
			{
                if(adjacencyGroup[y][2] != 0 && heterogeneityGroup[i][2] != 0) {
                    var product1 = heterogeneityGroup[i][2]*adjacencyGroup[y][2];
                    var product2 = Math.log(heterogeneityGroup[i][2]*adjacencyGroup[y][2]);
                    //console.log(product2, "Het: " + heterogeneityGroup[i][2], "Adj: " + adjacencyGroup[j][2]);
                    x += adjacencyGroup[y][2];
                    contagion += (product1*product2);
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
        contagion = 1 + (contagion/product3);
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
	}
	
	function setTheIndexes() {
		// Native Perennials Native Index
		if(nativePerennialsPercent >= 0.05 && nativePerennialsPercent < 0.25) {nativePNindex=1;}
		else if(nativePerennialsPercent >= 0.25 && nativePerennialsPercent < 0.50) {nativePNindex=2;}
		else if(nativePerennialsPercent >= 0.50) {nativePNindex=3;}
		
		// Non-Native Perennials Native Index
		if(nonNativePerennialsPercent >= 0.05 && nonNativePerennialsPercent < 0.25) {nonNativePNindex=1;}
		else if(nonNativePerennialsPercent >= 0.25 && nonNativePerennialsPercent < 0.50) {nonNativePNindex=2;}
		else if(nonNativePerennialsPercent >= 0.50) {nonNativePNindex=3;}
		
		// Perennials Points Game Index
		if(nativePerennialsPercent + nonNativePerennialsPercent >= 0.05 && nativePerennialsPercent + nonNativePerennialsPercent < 0.25) {pGindex=1;}
		else if(nativePerennialsPercent + nonNativePerennialsPercent >= 0.25 && nativePerennialsPercent + nonNativePerennialsPercent < 0.50) {pGindex=2;}
		else if(nativePerennialsPercent + nonNativePerennialsPercent >= 0.50) {pGindex=3;}
		
		// Steam Buffer Points Native Index
		if(streamBufferPercent >= 0.50 && streamBufferPercent < 1) {streamNindex=1;}
		else if(streamBufferPercent === 1) {streamNindex=2;}
		
		// Stream Buffer Points Game Index
		if(streamBufferPercent >= 0.3) {streamGindex=1;}
		
		// Wetland Points Native Index
		if(wetlandPercent >= 0.05 && strategicWetlandPercent >= 0.50) {wetlandNindex=2;}
		
		// Wetland Points Game Index
		if(wetlandPercent >= 0.05 && strategicWetlandPercent >= 0.5) {wetlandGindex=1;}
		
		// Stream Buffer Points Game Index
		if(forestPercent >= 0.2) {forestGindex=1;}
	}
	function setNativeIndex() {
		// Calculated once per watershed
		console.log("Contagion Native Index: " + getContagionPointsNativeIndex());
		//console.log("Native Perennial Native Index: " + nativePNindex);
		//console.log("Non N Perennials Native Index: " + nonNativePNindex);
		//console.log("Stream Native Index: " + streamNindex);
		//console.log("Wetland Native Index: " + wetlandNindex);
		dataset[11]['Year'+global.year] =  10*(getContagionPointsNativeIndex()+nativePNindex+nonNativePNindex+streamNindex+wetlandNindex);
	}
	function setGameIndex() {
		// Calculated once per watershed
		console.log("Contagion Game Index: " + getContagionPointsGameIndex());
		//console.log("Perennial Game Index: " + pGindex);
		//console.log("Stream Game Index: " + streamGindex);
		//console.log("Wetland Game Index: " + wetlandGindex);
		//console.log("Forest Game Index: " + forestGindex);
		dataset[10]['Year'+global.year] = 10*(getContagionPointsGameIndex()+pGindex+streamGindex+wetlandGindex+forestGindex);
	}
	function getContagionPointsNativeIndex() {
		// Calculated once per watershed
		if(contagion >= 0 && contagion < 0.15) return 1.5;
		else if(contagion >= 0.15 && contagion < 0.35) return 1;
		else if(contagion >= 0.35) return 0.5;
		else return 0;
	}
	function getContagionPointsGameIndex() {
		// Calculated once per watershed
		if(contagion >= 0 && contagion < 0.15) return 4;
		else if(contagion >= 0.15 && contagion < 0.3) return 3;
		else if(contagion >= 0.3 && contagion < 0.45) return 2;
		else if(contagion >= 0.45) return 1;
		else return 0;
	}
	function setHeterogeneityGroup(j) {
		// Calculates for each point in the watershed (attached to main loop)
		// Heterogeneity group setter
		// Heterogeneity group count setter
    	switch(global.data[global.year].baselandcover.data[j])
    	{
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
        //console.log(heterogeneityGroup[i][1], area);
    	heterogeneityGroup[i][2] = heterogeneityGroup[i][1]/(area);
	}
	function setHeterogeneityGroupDistinctCount(i) {
		// Calculates for each hetero group (attached to secondary loop)
    	if(heterogeneityGroup[i][1]>0)
        	distinctCount++;
	}
	function setAdjacencyGroup(i) {
		// Calculates for each point in the watershed
		if(i > cols + 1 + 1 && data[i-(cols+1)] != undefined) {
			//console.log(i);
			//console.log(global.data[global.year].group.data[i]);
			//console.log(global.data[global.year].group.data[i-(cols+1)]);
			//console.log(((global.data[global.year].group.data[i]*10) + global.data[global.year].group.data[i-1]));
			adjacencyGroup[((data[i]*11) + data[i-(cols+1)])][1]++;
            adjSubtotal[data[i-(cols+1)]]++;
		}
		//global.data[global.year].group.data[i-(cols)] != undefined && parseInt(global.data[global.year].group.data[i-(cols)]) >= 0
		if(i > cols + 1 && data[i-(cols)] != undefined) {
			adjacencyGroup[((data[i]*11) + data[i-(cols)])][1]++;
            adjSubtotal[data[i-(cols)]]++;
		}
		if(i > cols && data[i-(cols-1)] != undefined) {
			adjacencyGroup[((data[i]*11) + data[i-(cols-1)])][1]++;
            adjSubtotal[data[i-(cols-1)]]++;
		}
		if(i > 1 && data[i-1] != undefined) {
            adjacencyGroup[((data[i]*11) + data[i-1])][1]++;
            adjSubtotal[data[i-1]]++;
		}
		if(data[i+1] != undefined) {
			adjacencyGroup[((data[i]*11) + data[i+1])][1]++;
            adjSubtotal[data[i+1]]++;
		}
		if(data[i+(cols-1)] != undefined) {
			//console.log(global.data[global.year].group.data[i+(cols-1)]);
			adjacencyGroup[((data[i]*11) + data[i+(cols-1)])][1]++;
            adjSubtotal[data[i+(cols-1)]]++;
		}
		if(data[i+(cols)] != undefined) {
			adjacencyGroup[((data[i]*11) + data[i+(cols)])][1]++;
            adjSubtotal[data[i+(cols)]]++;
		}
		if(data[i+(cols+1)] != undefined) {
			adjacencyGroup[((data[i]*11) + data[i+(cols+1)])][1]++;
            adjSubtotal[data[i+(cols+1)]]++;
		}
	}
	function setAdjacencyGroupCount(i) {
		// Calculates for each point in the watershed
		adjacencyGroup[global.data[global.year].group.data[i]][1]++;
	}
	function setAdjacencyGroupSubtotal(i) {
		// Calculates for each point in the watershed
		if(global.data[global.year].group.data[i-(cols+1)] === global.data[global.year].group.data[i]) {
			adjacencySubtotal++;
		}
		if(global.data[global.year].group.data[i-(cols)] === global.data[global.year].group.data[i]) {
			adjacencySubtotal++;
		}
		if(global.data[global.year].group.data[i-(cols-1)] === global.data[global.year].group.data[i]) {
			adjacencySubtotal++;
		}
		if(global.data[global.year].group.data[i-1] === global.data[global.year].group.data[i]) {
			adjacencySubtotal++;
		}
		if(global.data[global.year].group.data[i+1] === global.data[global.year].group.data[i]) {
			adjacencySubtotal++;
		}
		if(global.data[global.year].group.data[i+(cols-1)] === global.data[global.year].group.data[i]) {
			adjacencySubtotal++;
		}
		if(global.data[global.year].group.data[i+(cols)] === global.data[global.year].group.data[i]) {
			adjacencySubtotal++;
		}
		if(global.data[global.year].group.data[i+(cols+1)] === global.data[global.year].group.data[i]) {
			adjacencySubtotal++;
		}
	} // Needs deleted
	function setAdjacencyGroupProportion() {
        var x=0;
        //console.log(adjSubtotal);
        for(var i=0; i<11; i++) {
            for(var j=0;j<11;j++) {
                if(adjSubtotal[i] != 0) {
                    adjacencyGroup[x][2] = adjacencyGroup[x][1]/adjSubtotal[i];
                }
                x++;
            }
        }
	}
	function setNativePerennialsArea(i) {
		if(global.data[global.year].baselandcover.data[i] == 9 || global.data[global.year].baselandcover.data[i] == 10 || global.data[global.year].baselandcover.data[i] == 14) {
			nativePerennialsArea+=unitArea;
		}
	}
	function setNativePerennialsPercent()  {
		nativePerennialsPercent = nativePerennialsArea / area;
	}
	function setNonNativePerennialsArea(i) {
		if(global.data[global.year].baselandcover.data[i] == 2 || global.data[global.year].baselandcover.data[i] == 4 || global.data[global.year].baselandcover.data[i] == 7 || global.data[global.year].baselandcover.data[i] == 11 || global.data[global.year].baselandcover.data[i] == 12) {
			nonNativePerennialsArea+=unitArea;
		}
	}
	function setNonNativePerennialsPercent() {
		nonNativePerennialsPercent = nonNativePerennialsArea / area;
	}
	function setStreamBufferArea(i) {
		if(global.data[global.year].streamnetwork.data[i] == 1){
			if(global.data[global.year].baselandcover.data[i] == 2 || global.data[global.year].baselandcover.data[i] == 4 || global.data[global.year].baselandcover.data[i] == 7 || global.data[global.year].baselandcover.data[i] == 9 || global.data[global.year].baselandcover.data[i] == 10 || global.data[global.year].baselandcover.data[i] == 11 || global.data[global.year].baselandcover.data[i] == 14) {
				streamBufferArea+=unitArea;
			}
		}
	}
	function setStreamBufferPercent() {
		//console.log("Stream Buffer Area: " + streamBufferArea);
		//console.log("Stream Area: " + streamArea);
		streamBufferPercent = streamBufferArea / streamArea;
	}
	function setWetlandArea(i) {
		if(global.data[global.year].baselandcover.data[i] == 14) {
			wetlandArea+=unitArea;
		}
	}
	function setWetlandPercent() {
		wetlandPercent = wetlandArea / area;
	}
	function setStrategicWetlandArea(i) {
		if(global.data[global.year].wetland.data[i] == 1)
		{
			if(global.data[global.year].baselandcover.data[i] == 14) {
				strategicWetlandArea++;
			}
		}
	}
	function setStrategicWetlandPercent() {
		strategicWetlandPercent = strategicWetlandArea / strategicArea;
	}
	function setForestArea(i) {
		if(global.data[global.year].baselandcover.data[i] == 10 || global.data[global.year].baselandcover.data[i] == 11) {
			forestArea+=unitArea;
		}
	}
	function setForestPercent() {
		forestPercent = forestArea / area;
	}
}
var Sediment = function() {
	this.update = function(i)
	{
		
	}
}
var Erosion = function() {
	this.update = function(i)
	{
		
	}
}

/*---------------------------------------
/*----------Phosphorus-------------------
/*---------------------------------------
*/
var flow_Fac = [];
var drainage = [];									  
var rcn = [];
var runoff = [];

function setPhosphorus()
{
	setPIndex();
}

function setPIndex(k)
{
	setDrainage();
	setRunoff();
	pewiData[9][j] = drainage[k]+runoff[k]+pewiData[6][j];
	// For Debugging
	/*if(k===11)
	{
		console.log("Drainage: " + drainage[k]);
		console.log("Runoff: " + runoff[k]);
		console.log("Erosion: " + erosion[k]);
	}*/
}

function setRunoff(k) // Redundant if statement
{
	setRCN();
	if(rcn[k] <= 40 && rcn[k] < 50 && rcn[k])
	{
		runoff[k] = 0.025;
	}
	else if(rcn[k] <=50 && rcn[k] <60)
	{
		runoff[k] = 0.075;
	}
	else if(rcn[k] <=60 && rcn[k] <70)
	{
		runoff[k] = 0.1;
	}
	else if(rcn[k] <=70 && rcn[k] <80)
	{
		runoff[k] = 0.175;
	}
	else if(rcn[k] <=80 && rcn[k] <90)
	{
		runoff[k] = 0.28;
	}
	else
	{
		runoff[k] = 0.35;
	} 
}

function setRCN()
{
	if((global.data[global.year].baselandcover.data[j] === 1 || global.data[global.year].baselandcover.data[j] === 2) && global.data[global.year].soiltype.data[j] === "A")
	{
		rcn[k] = 65.5;
	}
	else if((global.data[global.year].baselandcover.data[j] === 1 || global.data[global.year].baselandcover.data[j] === 2) && global.data[global.year].soiltype.data[j] === "B")
	{
		rcn[k] = 76;
	}
	else if((global.data[global.year].baselandcover.data[j] === 1 || global.data[global.year].baselandcover.data[j] === 2) && global.data[global.year].soiltype.data[j] === "C")
	{
		rcn[k] = 83;
	}
	else if((global.data[global.year].baselandcover.data[j] === 1 || global.data[global.year].baselandcover.data[j] === 2) && global.data[global.year].soiltype.data[j] === "D")
	{
		rcn[k] = 87;
	}
	else if(global.data[global.year].baselandcover.data[j] === 9 && global.data[global.year].soiltype.data[j] === "A")
	{
		rcn[k] = 77;
	}
	else if(global.data[global.year].baselandcover.data[j] === 9 && global.data[global.year].soiltype.data[j] === "B")
	{
		rcn[k] = 86;
	}
	else if(global.data[global.year].baselandcover.data[j] === 9 && global.data[global.year].soiltype.data[j] === "C")
	{
		rcn[k] = 91;
	}
	else if(global.data[global.year].baselandcover.data[j] === 9 && global.data[global.year].soiltype.data[j] === "D")
	{
		rcn[k] = 94;
	}
	else if((global.data[global.year].baselandcover.data[j] === 3 || global.data[global.year].baselandcover.data[j] === 4) && global.data[global.year].soiltype.data[j] === "A")
	{
		rcn[k] = 58;
	}
	else if((global.data[global.year].baselandcover.data[j] === 3 || global.data[global.year].baselandcover.data[j] === 4) && global.data[global.year].soiltype.data[j] === "B")
	{
		rcn[k] = 72;
	}
	else if((global.data[global.year].baselandcover.data[j] === 3 || global.data[global.year].baselandcover.data[j] === 4) && global.data[global.year].soiltype.data[j] === "C")
	{
		rcn[k] = 81;
	}
	else if((global.data[global.year].baselandcover.data[j] === 3 || global.data[global.year].baselandcover.data[j] === 4) && global.data[global.year].soiltype.data[j] === "D")
	{
		rcn[k] = 85;
	}
	else if(global.data[global.year].baselandcover.data[j] === 5 && global.data[global.year].soiltype.data[j] === "A")
	{
		rcn[k] = 39;
	}
	else if(global.data[global.year].baselandcover.data[j] === 5 && global.data[global.year].soiltype.data[j] === "B")
	{
		rcn[k] = 61;
	}
	else if(global.data[global.year].baselandcover.data[j] === 5 && global.data[global.year].soiltype.data[j] === "C")
	{
		rcn[k] = 74;
	}
	else if(global.data[global.year].baselandcover.data[j] === 5 && global.data[global.year].soiltype.data[j] === "D")
	{
		rcn[k] = 80;
	}
	else if(global.data[global.year].baselandcover.data[j] === 6 && global.data[global.year].soiltype.data[j] === "A")
	{
		rcn[k] = 68;
	}
	else if(global.data[global.year].baselandcover.data[j] === 6 && global.data[global.year].soiltype.data[j] === "B")
	{
		rcn[k] = 79;
	}
	else if(global.data[global.year].baselandcover.data[j] === 6 && global.data[global.year].soiltype.data[j] === "C")
	{
		rcn[k] = 86;
	}
	else if(global.data[global.year].baselandcover.data[j] === 6 && global.data[global.year].soiltype.data[j] === "D")
	{
		rcn[k] = 89;
	}
	else if(global.data[global.year].baselandcover.data[j] === 7 && global.data[global.year].soiltype.data[j] === "A")
	{
		rcn[k] = 32;
	}
	else if(global.data[global.year].baselandcover.data[j] === 7 && global.data[global.year].soiltype.data[j] === "B")
	{
		rcn[k] = 58;
	}
	else if(global.data[global.year].baselandcover.data[j] === 7 && global.data[global.year].soiltype.data[j] === "C")
	{
		rcn[k] = 72;
	}
	else if(global.data[global.year].baselandcover.data[j] === 7 && global.data[global.year].soiltype.data[j] === "D")
	{
		rcn[k] = 79;
	}
	else if(global.data[global.year].baselandcover.data[j] === 8 && global.data[global.year].soiltype.data[j] === "A")
	{
		rcn[k] = 55;
	}
	else if(global.data[global.year].baselandcover.data[j] === 8 && global.data[global.year].soiltype.data[j] === "B")
	{
		rcn[k] = 73;
	}
	else if(global.data[global.year].baselandcover.data[j] === 8 && global.data[global.year].soiltype.data[j] === "C")
	{
		rcn[k] = 82;
	}
	else if(global.data[global.year].baselandcover.data[j] === 8 && global.data[global.year].soiltype.data[j] === "D")
	{
		rcn[k] = 86;
	}
	else
	{
		rcn[k] = "";
	}
}

function setDrainage()
{
	setTile();
	if(global.data[global.year].baselandcover.data[j]>0 && global.data[global.year].baselandcover.data[j]<10)
	{
		
		drainage[k] = 0.15*flow_Fac[k]*7.42;
		//console.log(flow_Fac[k], k);
	}
	else if(global.data[global.year].baselandcover.data[j]===0)
	{
		// Use the midpoint because it's water
		// Needs done!
		drainage[k] = 1;
	}
}

function setTile()
{
	
	if(global.data[global.year].soiltype.data[j] === "D" || global.data[global.year].soiltype.data[j] === "C")
	{
		if(pewiData[19][j] === 0 || pewiData[19][j] === 1)
		{
			if(global.data[global.year].baselandcover.data[j] === 1 || global.data[global.year].baselandcover.data[j] === 2)
			{
				flow_Fac[k] = 0.1;
			}
			else
			{
				flow_Fac[k] = 0;
			}
		}
		else
		{
			flow_Fac[k] = 0;
		}
	}
	else if(global.data[global.year].soiltype.data[j] === "")
	{
		flow_Fac[k] = "";
	}
	else
	{
		flow_Fac[k] = 0;
	}
	
	/* Debugging Purposes *****************************
	if(k===11)
	{
		console.log("Permeability: " + global.data[global.year].soiltype.data[j]);
		console.log("Slope: " + pewiData[j+19]);
		console.log("Flow Factor: " + flow_Fac[k]);
	}
	**************************************************/
}

/*---------------------------------------
/*----------Sediment---------------------
/*---------------------------------------
*/
var conservationPractices = true;
var ls_factor_data = [0.13,0.29,0.5,1.01,1.38,0.13,  // land of type 1 or 2
				 	  0.12,0.25,0.43,0.84,1.15,0.12, // land of type 3+
				 	  1.0]							 // neither
var ls_Factor = [];	 	 
var p_Factor = [];				 
var c_Factor = [];				
var k_Factor = [];
var r_Factor = 150;
var rusle = [];
var b_Factor = [];	

function setSediment()
{
	setRUSLE();
	// Subwatersheds needs implemented!!
	setBufferFactor();
	setSedimentYield();
}

function setSedimentYield(k)
{
	pewiData[11][j] = rusle[k]*20*b_Factor[k];
	//console.log(pewiData[j+11]);
}

function setBufferFactor()
{
	if(global.data[global.year].baselandcover.data[j] === 7)
	{
		b_Factor[k] = 0.7;
	}
	else if(global.data[global.year].baselandcover.data[j] === 0.5)
	{
		b_Factor[k] = 0.7;
	}
	else
	{
		b_Factor[k] = 1;
	}
}

function setRUSLE()
{
	setLsFactor();
	setPFactor();
	setCFactor();
	setKFactor();
	rusle[k] = ls_Factor[k]*p_Factor[k]*c_Factor[k]*k_Factor[k]*r_Factor;
}

function setKFactor()
{
	if(global.data[global.year].soiltype.data[j] === "D" || global.data[global.year].soiltype.data[j] === "C")
	{
		k_Factor[k] = 0.1;
	}
	else if (global.data[global.year].soiltype.data[j] === "B")
	{
		k_Factor[k] = 0.325;
	}
	else if (global.data[global.year].soiltype.data[j] === "A")
	{
		k_Factor[k] = 0.43;
	}
	else
	{
		k_Factor[k] = "";
	}
}

function setCFactor()
{
	switch(global.data[global.year].baselandcover.data[j])
	{
	case 0:
		c_Factor[k] = 0;
		break;
	case 1:
		c_Factor[k] = 0.118;
		break;
	case 2:
		c_Factor[k] = 0.075;
		break;
	case 3:
		c_Factor[k] = 0.05;
		break;
	case 4:
		c_Factor[k] = 0.003;
		break;
	case 5:
		c_Factor[k] = 0.001;
		break;
	case 6:
		c_Factor[k] = 0.001;
		break;
	case 7:
		c_Factor[k] = 0.003;
		break;
	case 8:
		c_Factor[k] = 0.001;
		break;
	case 9:
		c_Factor[k] = 0.75;
		break;
	}
}

function setPFactor()
{
	if(conservationPractices)
	{
		if(global.data[global.year].baselandcover.data[j] === 1 || global.data[global.year].baselandcover.data[j] === 2)
		{
			if(pewiData[19][j] >= 3)
			{
				p_Factor[k] = 0.25;
			}
			else if(pewiData[19][j] === 2)
			{
				p_Factor[k] = 0.5;
			}
			else
			{
				p_Factor[k] = 1;
			}
		}
		else if(global.data[global.year].baselandcover.data[j] > 2)
		{
			p_Factor[k] = 1;
		}
		else if(global.data[global.year].baselandcover.data[j] === 0)
		{
			p_Factor[k] = 0;
		}
		else
		{
			p_Factor[k] = "";
		}
	}
	else
	{
		if(!global.data[global.year].baselandcover.data[j] === undefined)
		{
			p_Factor[k] = 1;
		}
		else
		{
			
		}
	}
}

function setLsFactor()
{
	if(global.data[global.year].baselandcover.data[j] > 0 && global.data[global.year].baselandcover.data[j] < 3)
	{
		switch(pewiData[19][j])
		{
		case 1:
			ls_Factor[k] = ls_factor_data[0];
			break;
		case 2:
			ls_Factor[k] = ls_factor_data[1];
			break;
		case 3:
			ls_Factor[k] = ls_factor_data[2];
			break;
		case 4:
			ls_Factor[k] = ls_factor_data[3];
			break;
		case 5:
			ls_Factor[k] = ls_factor_data[4];
			break;
		case 0:
			ls_Factor[k] = ls_factor_data[5];
			break;
		}
	} 
	else if(global.data[global.year].baselandcover.data[j] > 2)
	{
		switch(pewiData[19][j])
		{
		case 1:
			ls_Factor[k] = ls_factor_data[6];
			break;
		case 2:
			ls_Factor[k] = ls_factor_data[7];
			break;
		case 3:
			ls_Factor[k] = ls_factor_data[8];
			break;
		case 4:
			ls_Factor[k] = ls_factor_data[9];
			break;
		case 5:
			ls_Factor[k] = ls_factor_data[10];
			break;
		case 0:
			ls_Factor[k] = ls_factor_data[11];
			break;
		}
	}
	else
	{
		ls_Factor[k] = ls_factor_data[12];
	}
}

/*---------------------------------------
/*----------Erosion----------------------
/*---------------------------------------
*/
var sedimentRatio = 0.17; // Incomplete

function setErosion() // Needs complete implementation
{
	setRUSLE();
	setBufferFactor();
	pewiData[6][j] = rusle[k]*b_Factor[k]*1.12*1.2*sedimentRatio;
}

