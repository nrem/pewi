var global = [
        {}
    ],
    SCREEN = {

    };
(function ($) {
    go = function () {
        $("button").button();
        // Finite State Machine http://lamehacks.net/blog/implementing-a-state-machine-in-javascript/
        var states = [
            {
                'name': 'splash-view',
                'initial': true,
                'events': {
                    'goto-mainevent': 'mainevent-view'
                }
            },
            {
                'name': 'mainevent-view',
                'events': {
                    'goto-layer': 'layer-view',
                    'goto-nextyear': 'timelapse-view',
                    'goto-restart': 'restart-view',
                    'goto-print': 'print-view',
                    'goto-popup': 'popup-view'
                }
            },
            {
                'name': 'layer-view',
                'events': {
                    'goto-mainevent': 'mainevent-view',
                    'goto-popup': 'popup-view'
                }
            },
            {
                'name': 'popup-view',
                'events': {
                    'goto-mainevent': 'mainevent-view',
                    'goto-new-dataset': 'new-dataset-view'
                }
            },
            {
                'name': 'restart-view',
                'events': {
                    'goto-mainevent': 'mainevent-view'
                }
            },
            {
                'name': 'print-view',
                'event': {
                    'goto-mainevent': 'mainevent-view'
                }
            },
            {
                'name': 'timelapse-view',
                'events': {
                    'goto-mainevent': 'mainevent-view'
                }
            },
            {
                name: 'new-dataset-view',
                events: {
                    'goto-splashscreen': 'splash-view',
                    'goto-mainevent': 'mainevent-view'
                }
            }
        ];

        function StateMachine(states) {
            this.goto = {
                SPLASH: 'goto-splashscreen',
                MAIN: 'goto-mainevent',
                POPUP: 'goto-popup',
                RESTART: 'goto-restart',
                PRINT: 'goto-print',
                NEXTYEAR: 'goto-nextyear',
                NEW_DATASET: 'goto-new-dataset'
            };

            this.states = states;
            this.indexes = {};
            for (var i = 0; i < this.states.length; i++) {
                this.indexes[this.states[i].name] = i;
                if (this.states[i].initial) {
                    this.currentState = this.states[i];
                }
            }
            this.consumeEvent = function (e) {
                if (this.currentState.events[e]) {
                    this.currentState = this.states[this.indexes[this.currentState.events[e]]];
                    // console.log(this.currentState.name);
                    this.bind();
                }
            }
            this.bind = function () {
                bindInteractions(this.currentState.name);
            }
            this.getStatus = function () {
                return this.currentState.name;
            }

            function bindInteractions(state) {
                switch (state) {
                    case 'splash-view':
                        splashInteractions();
                        break;
                    case 'mainevent-view':
                        maineventInteractions();
                        break;
                    case 'layer-view':
                        layerInteractions();
                        break;
                    case 'popup-view':
                        popupInteractions();
                        break;
                    case 'restart-view':
                        restartInteractions();
                        break;
                    case 'print-view':
                        printInteractions();
                        break;
                    case 'timelapse-view':
                        timelapseInteractions();
                        break;
                    case 'new-dataset-view':
                        newDatasetInteractions();
                        break;
                    default:
                        console.log("I am really confused about the state of my being right now");
                }
                function splashInteractions() {
                    /*
                     * Transitions
                     */

                    setBackgroundImage($("#splash-screen"));
                    displayLoadingLayer($("#splash-screen"));

                    // Start preloading PEWI
                    copyBackgroundImage($("body"));
                    $("#main").show();
                    $("#watershed").show();
                    var scale = Math.round(Math.min(SCREEN.height, SCREEN.width) / 36 / 2 - 1);
                    var options = {
                        parent: "#divcontainer",
                        landcover: global.data[global.year].baselandcover.data,
                        y: global.data[global.year].row.data,
                        x: global.data[global.year].column.data,
                        width: 23 * 3 * scale + 3 * scale,
                        height: 36 * 2 * scale,
                        rectWidth: 3 * scale,
                        rectHeight: 2 * scale,
                        year: global.year,
                        scale: scale
                    };
                    global.maps = new Maps();

                    if (global.data.initial) {
                        global.maps.watershed(options);
                    } else {
                        options.newDataset = true;

                        for (var i = 1; i <= global.years; i++) {
                            if (global.data[i] !== 0) {
                                options.year = i;
                                for (var j = 0; j < global.data[i].baselandcover.data.length; j++) {
                                    updateDataPoint(j, { landcover: global.data[i].baselandcover.data[j], year: i });

                                    if (i == 1) {
//										setWatershedArea(j);
                                        options.landcover = global.data[i].baselandcover.data[j];
                                        options.location = j;
                                        y = global.data[i].row.data;
                                        x = global.data[i].column.data;
                                        options.singlelandcover = true;
                                        global.maps.updateWatershed(options);
                                    }
                                }
                            }
                        }
                    }

                    //updateTable(global.data[global.year].baselandcover,$("#watershed td"));
                    //$("#toolbar").show();
                    $(".rounds").show();
                    //$("#landcover-toolbar").show();
                    $("#info").show();
                    resizeBackgroundImage();
                    centerElement($(window), $("#watershed"));

                    $('#sidebar-left #landcover').css('border-right', '2px solid #cccc00');

                    global.sm.consumeEvent(global.sm.goto.MAIN);
                }

                function maineventInteractions() {
                    /*
                     * Transitions
                     */
//                    displayFadeInfoBox("The Watershed");
                    //$("#watershed td").on("click");
//                    $("#selectable-paint td").bind("click");
                    //$("#watershed").selectable("enable");
                    if ($('#splash-screen').is(':visible')) {
                        $('#splash-screen').hide();
                    }
                    hideMiniMap();
                    clearOtherPopups(0);
                    if ($("#popup-overlay").is(":visible")) {
                        $("#popup-overlay").hide();
                    }

                    updateHud();


                    if (global.outputmap != undefined) {
                        global.outputmap.dealloc();
                    }
                }

                function layerInteractions() {
                    //$("#watershed td").unbind("click");
                    $("#watershed").selectable("disable");
//                    $("#selectable-paint td").unbind("click");
                    displayMiniMap();
                    if ($("#popup-overlay").is(":visible")) {
                        $("#popup-overlay").hide();
                    }
                }

                function popupInteractions() {
                    //$("#watershed td").off("click");
                    //$("#watershed td").unbind("mouseenter mouseleave MouseWheelHandler");
                    //$("#watershed").selectable("destroy");
//                    $("#selectable-paint td").unbind("click");
                    if ($("#popup-overlay").is(":visible") == false) {
                        $("#popup-overlay").show();
                    }
                }

                function restartInteractions() {
                    //$("#watershed td").unbind("mouseenter mouseleave MouseWheelHandler");
                    //$("#watershed").selectable("destroy");
//                    $("#selectable-paint td").unbind("click");
                }

                function printInteractions() {
                    //$("#watershed td").unbind("mouseenter mouseleave MouseWheelHandler");
                    //$("#watershed").selectable("destroy");
                    global.scoreDirector = new ScoreDirector();
                    global.scoreDirector.update();
                    var print = new PrintView();
                    $("#fact-sheet").show("slide", {direction: "right"}, 500);
                }

                function timelapseInteractions() {
                    setBackgroundImage($("#nextyear-screen"));
                    $("#nextyear-screen").show();
                    displayLoadingLayer($("#nextyear-screen"));

                    // Start preloading PEWI
                    copyBackgroundImage($("body"));
//                    updateTable(global.data[global.year].baselandcover, $("#watershed td"));
                    var options = {
                        landcover: global.data[global.year].baselandcover.data,
                        year: global.year
                    };
                    global.maps.switchYear(options);
                    resizeBackgroundImage();

                    global.scoreDirector = new ScoreDirector();
                    global.scoreDirector.update();

                    // if (global.previousyear != undefined && global.update[global.previousyear]) {
//                         var year = global.year;
//                         global.year = global.previousyear;
//                         global.scoreDirector = new ScoreDirector();
//                         global.scoreDirector.update();
//                         global.plot.rounds = global.year;
//                         if (global.plot) {
//                             global.plot.update();
//                         }
//                         global.year = year;
//                     }
//                     global.update[global.year] = true;

                    updateHud();
                }

                function newDatasetInteractions() {
                    if (!global.data.precipitation) {
                        alert("No precipitation data found. System will regenerate precipitation data.");
                        global.data.precipitation = {};
                        global.data.r = {};
                        for (var i = 0; i < 4; i++) {
                            setPrecipitation(i);
                        }
                    }

                    reinitialize();

                    $('#splash-screen').show();

                    closeAllRemovableDisplays();

                    global.sm.consumeEvent(global.sm.goto.SPLASH);
                }
            }
        }

        function init() {
            global.compatibility = new CompatibilityMonster();

            global.selectClickType = global.compatibility.selectClickEvent();

            if (!global.compatibility.local_downloading()) {
                var options = {
                    title: 'Tutorial'
                };

                var popup = new ModalView(options);

                popup.teaser({message: 'Important Message! Click Here!', timeout: 1000, title: 'Downloading Not Supported', description: 'Be advised that you do not have the ability to save your work and should either upgrade your browser to the most current version if using a supported browser, or switch to a supported browser.<br /><br />Supported browsers for this feature are Google Chrome, Mozilla Firefox, Internet Explorer 9+'});
            }
            if (global.compatibility.svg) {
                SCREEN = {
                    width: $(document).width(),
                    height: $(document).height()
                };
                global.year = 1;
                global.data = {
                    1: 0,
                    2: 0,
                    3: 0,
                    is_dataset_for_pewi: true,
                    precipitation: {
                        0: 0,
                        1: 0,
                        2: 0,
                        3: 0
                    },
                    initial: true
                };
                global.data[global.year] = Data;

                global.data.r = {
                    0: 0,
                    1: 0,
                    2: 0
                };
                global.subwatershedArea = false;

                global.streamIndices = {
                    1: [],
                    2: [],
                    3: []
                };
                global.mapCellWidth = 3;
                global.mapCellHeight = 2;
                global.landuse = {
                    1: [],
                    2: [],
                    3: []
                };
                global.aveSedimentDelivered = {};
                global.sedimentDelivered = {};
                global.grossErosion = {};
                global.phosphorusLoad = {};
                global.results = {
                    1: {},
                    2: {},
                    3: {}
                };

                global.landcovers = {
                    1: {},
                    2: {},
                    3: {}
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

                global.update = {
                    1: 0,
                    2: 0,
                    3: 0
                };

                global.years = 3;

                for (var year in global.data.precipitation) {
                    setPrecipitation(year);
                }
                global.sm = new StateMachine(states);
                global.sm.bind();
                global.plot = new Plot();
                global.undo = {1: [], 2: [], 3: []};

                global.hud = new HUDManager();
                var $main = $('#main');
                global.hud.addHUDItem($main, '<div class="menu-button-container" id="credits-container" title="About PE/WI"><img src="images/icons/navigation/credits_button.svg" class="credits-button-img menu-item" alt="i"></div>', {visible: true});
                global.hud.addHUDItem($main, '<section id="infobox-container"><div id="info"><a>PE/WI</a><a id="version-tag">BETA</a></div></section>');
                if(!global.compatibility.istouchable()) {
                    global.hud.addHUDItem($('#square-paint'), '<div class="menu-button-container" id="paint-selection-tool-container" title="Toggle square selection"><img src="images/icons/icon_paint_outline.svg" class="square-paint-toggle menu-item" alt="sqr"></div>');
                }

                bindSquarePaintSelectionClick();

                addDownloadUploadButton($main);

                global.PAINTTYPE = {
                    _FREEFORM: 'freeform',
                    _SELECTBOX: 'selectbox'
                };

                global.paintingType = global.PAINTTYPE._FREEFORM;

//				checkSession();
            } else {
                var $body = $("body");
                $body.empty();
                $body.append('<div id="broken-container"><div><strong><a>ERROR.. Something went wrong!</strong><br />Please make sure your browser is fully updated, or use a browser such as Google Chrome or Mozilla Firefox</a></div><img id="broken-page-image" src="images/icons/broken.png"></div>');
                $body.css("marginLeft", parseFloat(($(window).width()) / 2) - (parseFloat($("#broken-container").width()) / 2))
                    .css("marginTop", parseFloat(($(window).height()) / 2) - (parseFloat($("#broken-container").height()) / 2));
            }
        }

        function addDownloadUploadButton($container) {
            if (!global.compatibility.file_api) return;

            global.hud.addHUDItem($('#main'), '<div class="menu-button-container" id="download-upload-container" title="Download/Upload PE/WI datasets"><a id="download-upload-button" class="menu-item">&#8595;</a></div>');

            $("#download-upload-button").bind(global.selectClickType, function () {
                global.sm.consumeEvent(global.sm.goto.POPUP);

                var options = {
                    width: SCREEN.width / 2,
                    title: "Download/Upload DataSets"
                };

                global.popup = new ModalView(options);
                global.popup.append('<p>Upload dataset</p>');
                global.popup.append('<div><div id="file-upload-dropzone"><a>Drop files here</a></div>');
                global.popup.append('<input type="file" id="file-upload" name="files[]" /><output id="file-upload-list"></output></div>');

                /////////////////////////////////////////////////
                ///////////////// Download //////////////////////
                /////////////////////////////////////////////////
                function getJSONData() {
                    var json = JSON.stringify(global.data);
                    var blob = new Blob([json],  {type: 'text/json'});
                    return URL.createObjectURL(blob);
                }

                function getBlobUrl() {
                    var blob = new window.Blob([JSON.stringify(global.data)], { type: 'application/json' });
                    window.navigator.msSaveBlob(blob, 'pewi_data.json');
                }

                function getBlob() {
                    var blob = new window.Blob([JSON.stringify(global.data)], { type: 'application/json' });
                    console.log(blob);
                    return window.URL.createObjectURL(blob);
                }

                global.popup.display();

                if (global.compatibility.download_attr) {
                    global.popup.append('<p>Download dataset</p>');
                    global.popup.append('<a id="file-download-button" href="' + getJSONData() + '" download="pewi_data.json">Download</a>');
                    //global.popup.append('<input type="button" id="file-download-button" value="Download Dataset"/> ')
                } else if (global.compatibility.blob && global.compatibility.mssaveblob()) {
                    var download_assets = '<p>Download dataset</p><a id="file-download-button">Download</a>';
                    global.popup.append(download_assets);

                    $('#file-download-button').bind(global.selectClickType, function (e) {
                        getBlobUrl();
                    });
                } else if (global.compatibility.blob) {
                    var download_assets = '<p>Download dataset</p><a id="file-download-button" href="' + getBlob() + '" target="_blank">Download</a>';
                    global.popup.append(download_assets);

//                    $('#file-download-button').bind(global.selectClickType, function (e) {
//                        getBlob();
//                    });
                } else {
                    global.popup.append('<p>Dataset downloading is not currently supported in this browser version.<br />Please verify that your browser is up to date.<br />Supported browsers are Google Chrome, Mozilla Firefox, Opera, and Internet Explorer.</p>');
                }

                ////////////////////////////////////////////
                /////////// Upload /////////////////////////
                ////////////////////////////////////////////
                $('#file-upload').bind('propertychange change', function (e) {
                    var files = e.target.files;
                    global.popup.remove($('#file-download-confirmation'));
                    processFileUpload(files);
                });

                $('#file-upload-dropzone').on('drop',function (e) {
                    var files;

                    if (e.originalEvent.dataTransfer) {
                        if (e.originalEvent.dataTransfer.files.length) {
                            e.preventDefault();
                            e.stopPropagation();

                            files = e.originalEvent.dataTransfer.files;

                            $('#file-download-confirmation').remove();
                            $('#file-upload-dropzone>img').remove();
                            processFileUpload(files);
                        }
                    }
                }).on('dragover',function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    if (e.originalEvent.dataTransfer.dropEffect) {
                        e.originalEvent.dataTransfer.dropEffect = 'copy';
                    }
                    $(this).css('background-color', 'rgba(200, 200, 200, 1)');
                }).on('dragenter',function (e) {
                    $(this).append('<img src="images/icons/buttons_Copy.svg" />');
                    e.preventDefault();
                    e.stopPropagation();
                }).on('dragleave', function (e) {
                    $(this).css('background-color', 'rgba(255, 255, 255, 1)');
                    $('#file-upload-dropzone>img').remove();
                });

                function processFileUpload(files) {
//                    console.log((files[0].type) ? true : false);
//                    console.log(files[0].type);
//                    console.log(files[0].name, files[0].type, files[0].size, files[0].lastModifiedDate);
                    if (files[0].type && !files[0].type.match(/application\/json/)) {
                        alert('Incorrect file type.');
                        return;
                    } else if (files[0].name && !files[0].name.match(/\.json/)) {
                        alert('Incorrect file type. 1');
                        return;
                    } else if (!files[0].name) {
                        alert('Something went wrong.');
                    }

                    var reader = new FileReader();
                    console.log(reader);
                    reader.onload = function (e) {

                        global.popup.append('<p id="file-download-confirmation">Confirm reload using new dataset: <input id="update-pewi-with-new-dataset-button" type="button" value="Yes" /><br /><a>Warning, this will erase your current progress!</a></h2></p>');

                        $('#update-pewi-with-new-dataset-button').bind(global.selectClickType, function (e) {
                            try {
                                parseUploadedJSONData(reader.result);
                                global.previousyear = global.year;
                                global.year = 1;
                                global.data.initial = false;
                                global.sm.consumeEvent(global.sm.goto.NEW_DATASET);
                            } catch (error) {
                                alert("Something went wrong. Check to make sure you are uploading the correct file.");
                                console.warn("Upload error: " + error);
                            }
                        });
                    }

                    reader.readAsText(files[0]);
//                    reader.readAsBinaryString(files[0]);
                }

                function parseUploadedJSONData(json) {
                    var object = JSON.parse(json);
                    if (object.is_dataset_for_pewi) {
                        global.data = object;
                    }

                    global.update = {
                        1: 0,
                        2: 0,
                        3: 0
                    };

                    for (var i = 1; i < 4; i++) {
                        if (global.data[i]) {
                            flagUpdateToTrue(i);
                        }
                    }
                }
            });
        }

        init();


        $(".credits-button-img").bind(global.selectClickType, function () {
            global.sm.consumeEvent(global.sm.goto.POPUP);
            var options = {
                width: SCREEN.width / 2,
                height: SCREEN.height / 2,
                title: "About PE/WI"
            };
            global.popup = new ModalView(options);
            global.popup.append('<p>People in Ecosystems/Watershed Integration (PE/WI) is a simple learning tool designed to provide a scientific platform for teaching, discussing, and evaluating the trade-offs associated with agricultural land-use and management.</p>');
            global.popup.append('<p><strong>Project Team</strong></p>');
            global.popup.append('<p>Lisa Schulte Moore, Carrie Chennault, Ryan Frahm, Laura Roy, John Tyndall, & John VanDyk<br />Iowa State University, Department of Natural Resource Ecology & Management</p>');
            global.popup.append('<p><strong>Acknowledgements</strong></p>');
            global.popup.append('<p>The development of PE/WI was supported by grants from the McKnight Foundation and US Forest Service Northern Research Station.  We would also like to thank Cindy Cambardella, Justin Choe, Diane Debinski, Emily Heaton, Matt Helmers, Tom Isenhart, Matt Liebman, John VanDyk, members of the ISU Landscape Ecology & Sustainable Ecosystem Management lab,  and the Natural Capital Project for contributions to PE/WIs development and review.</p>');
            global.popup.append('<p>For more information: <a href="http://www.nrem.iastate.edu/landscape/content/pewi" target="_newtab">Click Here</a></p>');
            global.popup.append('<p>PE/WI <a href="https://www.nrem.iastate.edu/landscape/files/Schulte%20et%20al.%20PEWI%20v2%20Exercises.pdf" target="_newtab">Lesson Plans</a></p>');
            global.popup.append('<p>PE/WI <a href="https://www.nrem.iastate.edu/landscape/files/PEWIv2%20User%20Guide.pdf" target="_newtab">User Guide</a></p>');
            global.popup.display();
        });

        // Variable that will determine which paint color/ image to be used based on assigned number.  It gets its number from the selected paintIndex and uses that index to change the value of an element in the grid array.
        var selectedPaint; // 16 is a test number that is the default when loaded so that no painting can be done without a selection.
        var plot = null;
        var numberOfPaintsSelected = 0;

        $("#workspace").css("height", SCREEN.height);

        // ------------------------------------Map Interaction-------------------------------------------------

        $("#popup-overlay").bind(global.selectClickType, function () {
            closeAllRemovableDisplays();
            global.sm.consumeEvent(global.sm.goto.MAIN);
        });


        /********************************************************************************
         / Toolbar
         /*******************************************************************************/


//        function displayFadeInfoBox(text) {
//            $("#info").text(text);
//            $("#infobox").show();
//            setTimeout(function () {
//                $("#infobox").fadeToggle("slow", function () {
//                });
//            }, 3000);
//        }

        function displayPopup(selector, display) {
            if ($(selector).is(":visible") == false) {
                $(".popup-tab").hide();
                $(".popup-window").hide();
                $(selector).show();
            }
            else {
                $(selector).hide();
            }
        }

        function hidePopup() {
            if ($(".popup-tab").is(":visible") == true) {
                $(".popup-tab").toggle();
            }

        }

        function clearOtherPopups(popup) {
            if (popup != 2 && $("#popup-layers").is(":visible")) {
                $("#popup-layers").hide();
            }
            if (popup != 3 && $("#scoreBox").is(":visible")) {
                $("#scoreBox").hide();
            }
            if (popup != 4 && $("#improveBox").is(":visible")) {
                $("#improveBox").hide();
            }
            if (popup != 5 && $("#optionsBox").is(":visible")) {
                //displayPopup($("#optionsBox"),false);
                $("#optionsBox").hide();
            }
            if (popup != 6 && $("#fact-sheet").is(":visible")) {
                $("#fact-sheet").hide();
            }
        }

        function urlBuilder(file) {
            var path = "url(images/cell_images_bitmaps/" + file + ")";
            return path;
        }

        /*
         * Events
         */
// --------------------------------------------------------
// ---------------- Click Events --------------------------

        function bindSquarePaintSelectionClick() {
            $('#paint-selection-tool-container').bind(global.selectClickType, function () {
                if ($(this).attr('selected')) {
                    global.paintingType = global.PAINTTYPE._FREEFORM;
//	        		$("#watershed1").selectable('option', 'disabled', true);
                    $(this).attr('selected', false).css('border-right', '');
                } else {
                    global.paintingType = global.PAINTTYPE._SELECTBOX;
//	        		$("#watershed1").selectable('option', 'disabled', false);
                    $(this).attr('selected', true).css('border-right', '2px solid #cccc00');
                }
            });
        }

        var oldi;
        $("#landcover-toolbar ul li img").bind(global.selectClickType, function () {
            //$(this).toggleClass("highlighted");
            var i = $("#landcover-toolbar ul li img").index(this);
            //console.log(this);
            $("#landcover-toolbar input").eq(i).attr("checked", true);
            $("#landcover-toolbar ul li img").eq(i).toggleClass("highlighted");
            selectedPaint = parseInt($("#landcover-toolbar ul li input").eq(i).attr("value"));
            global.selectedPaint = selectedPaint;
            if (oldi != undefined) {
                $("#landcover-toolbar input").eq(oldi).attr("checked", false);
                $("#landcover-toolbar ul li img").eq(oldi).toggleClass("highlighted");
            }
            oldi = i;
            updatePaintSelection();
        });
        $(".rounds ul li label").bind(global.selectClickType, function () {
            var year = parseInt($(this).prev().val());
            if (year - global.year === 1 && global.data[year] === 0) {
                // Create a new year
                global.previousyear = global.year;
                global.year = year;

                if (global.data[global.year] == 0) {
                    newYear();
                }
                global.sm.consumeEvent(global.sm.goto.NEXTYEAR);
            } else if (global.data[year] != 0 && year != global.year) {
                // Move to a already edited year
                global.scoreDirector = new ScoreDirector();
                if (global.update[global.year]) global.scoreDirector.update();
                global.previousyear = global.year;
                global.year = year;
                global.sm.consumeEvent(global.sm.goto.NEXTYEAR);
            } else if ((year - global.year) > 1) {
                alert("Cannot skip a year of simulation. Try editing year " + (global.year + 1) + " before moving on.");

            } else if (year === global.year) {
                //alert("You are editing this year already!");
            } else {
                // Go to previous years
                global.scoreDirector = new ScoreDirector();
                if (global.update[global.year]) global.scoreDirector.update();
                global.previousyear = global.year;
                global.year = year;
                global.sm.consumeEvent(global.sm.goto.NEXTYEAR);
            }
        });
        function newYear() {
            global.data[global.year] = copy(global.data[global.year - 1]);
            for (var i = 0; i < global.landuse[global.year - 1].length; i++) {
                if (global.landuse[global.year - 1][i] !== undefined)
                    global.landuse[global.year][i] = global.landuse[global.year - 1][i];
            }
            flagUpdateToTrue(global.year);
        }

        $("#sidebar-right #score").bind(global.selectClickType, function () {
            //console.log(dataset);
            //d3.select("#output-score-svg").remove();

            if ($("#layer-puck-container").is(":visible")) {
                $("#layer-puck-container").hide();
                d3.select("#pfeature").remove();
            }
            if ($("#scoreBox").is(":visible")) {
                global.sm.consumeEvent(global.sm.goto.MAIN);
            } else {
                global.sm.consumeEvent(global.sm.goto.POPUP);

                clearOtherPopups(3);
                //console.log(global.update);
                if (global.update[global.year]) {
                    global.scoreDirector = new ScoreDirector();
                    global.scoreDirector.update();
                }
                global.plot.rounds = global.year;
                var options = {
                    title: "Land Use Outputs",
                    width: 880
                };
                global.popup = new ModalView(options);
                global.popup.append('<div id="bubble" class="plot"></div>');
                global.popup.display();
                if (global.plot) {
                    global.plot.update();
                }
            }
        });
        $("#sidebar-right #improve").bind(global.selectClickType, function () {
            var id = $("#improveBox");
            if ($("#improveBox").is(":visible") == false) {
                global.sm.consumeEvent(global.sm.goto.POPUP);
//        $("#improveBox").show("slide", {direction: "right"}, 500);
                $("#popup-overlay").show();
                clearOtherPopups(4);

                global.scoreDirector = new ScoreDirector();
                global.scoreDirector.calculateOutputMapValues();
                var options = {
                   title: "Ecosystem Service Indicators",
                    width: "50em"
                };
                global.popup = new ModalView(options);
                var years = 0, body;
                body = '<section class="output-map-container"><div><a>Nitrate Watershed Percent Contribution</a></div>';
                body += '<div id="nitrate-output-map" class="output-map"></div>';
                for (var i = 1; i < 4; i++) {
                    if (global.data[i] !== 0) {
                        years++;
                    }
                }
                body += '</section><section class="output-map-container"><div><a>Gross Erosion</a></div>';
                body += '<div id="erosion-output-map" class="output-map"></div>';
                body += '</section><section class="output-map-container"><div><a>Phosphorus Index Risk Assessment</a></div>';
                body += '<div id="risk-assessment-output-map" class="output-map"></div>';
                body += '</section>';
                global.popup.append(body);
                global.popup.display();
                var opts = {
                    scale: 3
                };
                global.outputmap = new OutputMap(opts);
                global.outputmap.draw(years, true, true);
            }
            else {
                global.sm.consumeEvent(global.sm.goto.MAIN);
            }
        });
        $("#sidebar-right #facts").bind(global.selectClickType, function () {
            if ($("#fact-sheet").is(":visible")) {
                $("#fact-sheet").hide();
                $("#popup-overlay").hide();
                global.sm.consumeEvent(global.sm.goto.MAIN);
            } else {
                //global.sm.consumeEvent('goto-print');
                //global.landuse[global.year] = landCoverArea;
                clearOtherPopups(6);
                global.scoreDirector = new ScoreDirector();
                global.scoreDirector.update();
                var print = new PrintView();
                $("#fact-sheet").show("slide", {direction: "right"}, 500);
                global.sm.consumeEvent(global.sm.goto.POPUP);
            }
        });

        $(".popup-window section img").bind(global.selectClickType, function () {
            global.sm.consumeEvent(global.sm.goto.MAIN);
        });

        $("#workspace").bind(global.selectClickType, function () {
            if ($("#popup-layers").is(":visible")) {
                $("#popup-layers").hide();
            }
            if ($("#layer-puck-container").is(":visible")) {
                $("#layer-puck-container").hide();
                d3.select("#pfeature").remove();
            }
        });

        $("#optionsBox ul li a").bind(global.selectClickType, function () {
            window.print();
        });

        $('#sidebar-left').draggable({
            scroll: false,
            axis: 'y',
            drag: function() {
                var top = parseInt($(this).css('top'));
                console.log(top);
//                if(top < 0) {
//                    $(this).css('top', 0);
//                }
            }
//            snap: '#main'
        });

        $("#sidebar-left #landcover").bind(global.selectClickType, function () {
            if ($("#landcover-toolbar").is(":visible")) {
                $("#landcover-toolbar").hide();
                $(this).css('border-right', '');
//                $("#sidebar-left #landcover img").attr("src", "images/icons/white-r.png");
//                $("#sidebar-left #layer img").attr("src", "images/icons/white-r.png");
            } else {
                $("#landcover-toolbar").show();
                $(this).css('border-right', '2px solid #cccc00');
                $("#pfeature-toolbar").hide();
                $('#layer').css('border-right', '');
//                $("#sidebar-left #landcover img").attr("src", "images/icons/white-l.png");
            }
        });

        $(".selectable-pfeature")
            .bind(global.selectClickType, function () {
                var id = $(this).attr("id");
                displayMiniMap(id);
                $("#layer-puck-container").hide();
                d3.select("#pfeature").remove();
            });

        $("#sidebar-left #layer").bind(global.selectClickType, function (e) {
            if ($("#pfeature-toolbar").is(":visible")) {
                $("#pfeature-toolbar").hide();
                $(this).css('border-right', '');
//                $("#sidebar-left #layer img").attr("src", "images/icons/white-r.png");
//                $("#sidebar-left #landcover img").attr("src", "images/icons/white-r.png");
            } else {
                $("#landcover-toolbar").hide();
                $('#landcover').css('border-right', '');
                $("#pfeature-toolbar").show();
                $(this).css('border-right', '2px solid #cccc00');
//                $("#sidebar-left #layer img").attr("src", "images/icons/white-l.png");
            }
//            var offset = $(this).offset();
//            var coords = {
//                x: e.pageX - this.offsetLeft,
//                y: e.pageY - this.offsetTop
//            };
//            $("#layer-puck-container").css("left", offset.left);
//            togglePuk("layer", coords);
        });

        $(".close").bind(global.selectClickType, function () {
            d3.select(this).remove();
        });

        $("#zoom-fit").bind(global.selectClickType, function () {
            var tblwidth = parseFloat(SCREEN.width);
            var tblheight = parseFloat(SCREEN.height);
            var td = $("#watershed td");

            if (tblheight < 500) {
                td.css("width", "9px").css("height", "6px");
            } else if (tblheight >= 500 && tblheight < 800) {
                td.css("width", "18px").css("height", "12px");
            } else if (tblheight >= 800 && tblheight < 1024) {
                td.css("width", "24px").css("height", "16px");
            } else if (tblheight >= 1024) {
                td.css("width", "30px").css("height", "20px");
            }
            centerElement($(window), $("#watershed"));
        });

        var keys = {
            82: false,
            17: false,
            85: false,
            80: false,
            37: false,
            39: false
        };
        setTimeout(function () {
            document.addEventListener("keyup", function (e) {
                if (e.keyCode == 82) {
                    keys[82] = true;
                } else if (e.keyCode == 16) {
                    keys[16] = true;
                    if (!$('#paint-selection-tool-container').attr('selected')) {
//						bindWatershedFreeformPainting();
                        $('.watershed-rect').unbind("mouseover.painting");
                        d3.selectAll('#watershed-select-box-rect').remove();
                        global.paintingType = global.PAINTTYPE._FREEFORM;
//						$("#watershed1").selectable('option', 'disabled', true);
                    }
                } else if (e.keyCode == 85) {
                    keys[85] = true;
                } else if (e.keyCode == 80) {
                    keys[80] = true;
                }
                if (keys[82] == true) {
                    var undoData = [];
                    data = global.data[global.year].baselandcover.data;
                    for (var i = 0; i < data.length; i++) {
                        if (data[i] != undefined && data[i] != 0) {
                            undoData.push({previous: data[i], location: i});
                            var r = Math.round((Math.random() * 14) + 1);
                            //                        data[i] = r;

                            var options = {
                                landcover: r,
                                location: i,
                                singlelandcover: true,
                                year: global.year
                            };

                            global.maps.updateWatershed(options);
                        }
                    }
                    addDatasetChangesToUndoLog(undoData);
                    //addToUndoPath(undoData);
                    falsifyAll();

                } else if (keys[85] == true) {
                    if (!global.undo[global.year].length) return;
                    undoLastDatasetChanges();
                    falsifyAll();
                }
                else if (keys[80] == true) { // P key for precipitation
                    var options = {
                        title: 'Edit Precipitation Values',
                        width: '20em'
                    };

                    global.popup = new ModalView(options);
                    var body = '<p>';

                    for (var year in global.data.precipitation) {

                        body += '<div class="edit-precipitation-row"><a>Year ' + year + ': </a><select>';

                        for (var i = 0; i < 7; i++) {
                            body += '<option value="' + getPrecipitationValue(i) + '"';

                            if (global.data.precipitation[year] == getPrecipitationValue(i)) {
                                body += ' selected';
                            }
                            body += '>' + getPrecipitationValue(i) + '</option>';
                        }
                        body += '</select></div>';
                    }

                    body += '</p>';
                    body += '<div id="edit-precipitation-footer"><input type="button" value="update" id="edit-precipitation-button" /></div>'
                    global.popup.append(body);
                    global.popup.display();

                    $("#edit-precipitation-button").bind(global.selectClickType, function () {
                        var i = 0;
                        $(".edit-precipitation-row").each(function () {
                            var $select = $(this).find("select");
                            setPrecipitation(i, parseFloat($select.val()));
                            i++;
                        });
                        closeAllRemovableDisplays()
                        updatePrecipitationHud();
                        setBackgroundImage($("body"));
                    });

                    falsifyAll();
                }

                function falsifyAll() {
                    for (var key in keys) {
                        keys[key] = false;
                    }
                }
            });

            document.addEventListener('keydown', function (e) {
                if (e.keyCode == 16) {
                    if ($('#paint-selection-tool-container').attr('selected')) return;
                    // Shift pressed, enable box selection, disable mousedown
//					unbindWatershedFreeformPainting();
//	        		$("#watershed1").selectable('option', 'disabled', false);
                    global.paintingType = global.PAINTTYPE._SELECTBOX;
                }
            });
        }, 500);


        document.addEventListener("keyup", function (e) {
            if (e.keyCode == 82) {
                keys[82] = false;
            } else if (e.keyCode == 17) {
                keys[17] = false;
            }
        });

        $("#fact-sheet #close").bind(global.selectClickType, function () {
            $("#fact-sheet").hide("slide", {direction: "right"}, 500);
            $("#popup-overlay").hide();
            d3.select("#percent-landcover>div").remove();
            d3.select("#precipitation-placeholder>div").remove();
            d3.select("#landuse-outputs>div").remove();
            d3.select("#stats>div").remove();
            //global.sm.consumeEvent('goto-mainevent');
        });

        // --------------------------------------------------------
        // ---------------- Hover Events --------------------------

        $("#rounds ul li").hover(
            function () {
                var par = $(this).attr("id");
                var $selector = $("#" + par + ">label");
                updateYearHelperHud($("#" + par + ">input"));
                $("#year-help").show();
                $selector.css("width", "30px");
                $("#rounds ul li:not(" + par + ")").css("width", "20px");
            },
            function () {
                $("#rounds ul li label").css("width", "20px");
                $("#year-help").hide();
            }
        );
        $("#toolbar ul a").hover(
            function () {
                $(this).css("background", "#666666");
            },
            function () {
                $(this).css("background", "#353030");
            }
        );

        // --------------------------------------------------------
        // ------------ jQuery UI Selectable Events ---------------
        var datasetUndoLog = [];
        if(!global.compatibility.istouchable()) {
            $(".watershed-rect").on(global.compatibility.selectDownEvent(),function (e) {
                e.preventDefault();

                if (global.selectedPaint == undefined) return;

                if (global.paintingType == global.PAINTTYPE._FREEFORM) {
                    var id = parseInt($(this).attr('id'));
                    if (global.data[global.year].baselandcover.data[id] == global.selectedPaint) {
                        return;
                    }

                    global.maps.changeWatershedRectImage(id, global.selectedPaint);

                    datasetUndoLog.push({previous: global.data[global.year].baselandcover.data[id], location: id});

                    changeBaselandcoverDataPoint(global.selectedPaint, id, false, global.year);

                    bindFreeformMouseover();
                } else if (global.paintingType == global.PAINTTYPE._SELECTBOX) {
                    var $this = $(this),
                        x = $this.attr('x'),
                        y = $this.attr('y');

                    var selectrect = d3.select('#watershed1')
                        .append('rect')
                        .style('stroke', '#333')
                        .style('stroke-width', 1)
                        .style('fill', 'none')
                        .attr('x', x)
                        .attr('y', y)
                        .attr('width', $this.attr('width'))
                        .attr('height', $this.attr('height'))
                        .attr('id', 'watershed-select-box-rect');

                    bindSelectBoxMouseover({selectbox: selectrect, x: x, y: y});
                }
            }).bind(global.compatibility.selectUpEvent(), function () {
                $('.watershed-rect').unbind(".painting");
                $('#watershed1').unbind(".painting");
                if (global.paintingType == global.PAINTTYPE._FREEFORM) {

                } else if (global.paintingType == global.PAINTTYPE._SELECTBOX) {
                    var $box = $('#watershed-select-box-rect'),
                        left = parseInt($box.attr('x')),
                        top = parseInt($box.attr('y')),
                        right = left + parseInt($box.attr('width')),
                        bottom = top + parseInt($box.attr('height'));

                    $('.watershed-rect').each(function () {
                        var tleft = parseInt($(this).attr('x')),
                            ttop = parseInt($(this).attr('y')),
                            tright = parseInt($(this).attr('x')) + parseInt($(this).attr('width')),
                            tbottom = parseInt($(this).attr('y')) + parseInt($(this).attr('height'));

                        if (tleft > left - 1) {
                            if (ttop > top - 1) {
                                if (tright < right + 1) {
                                    if (tbottom < bottom + 1) {
                                        var id = parseInt($(this).attr('id'));

                                        if (global.data[global.year].baselandcover.data[id] !== global.selectedPaint) {
                                            global.maps.changeWatershedRectImage(id, global.selectedPaint);

                                            datasetUndoLog.push({previous: global.data[global.year].baselandcover.data[id], location: id});

                                            changeBaselandcoverDataPoint(global.selectedPaint, id, false, global.year);
                                        }
                                    }
                                }
                            }
                        }

                    });

                    d3.selectAll('#watershed-select-box-rect').remove();
                }

                if (datasetUndoLog.length > 0) {
                    addDatasetChangesToUndoLog(datasetUndoLog);
                    datasetUndoLog = [];
                }
            });

            $(document).bind(global.compatibility.selectUpEvent(), function () {
                $('.watershed-rect').unbind(".painting");
                $('#watershed1').unbind(".painting");
                d3.selectAll('#watershed-select-box-rect').remove();
            });

            function bindFreeformMouseover() {
                $(".watershed-rect").bind("mouseover.painting", function () {
                    var id = parseInt($(this).attr('id'));
                    if (global.data[global.year].baselandcover.data[id] == global.selectedPaint) {
                        return;
                    }

                    global.maps.changeWatershedRectImage(id, global.selectedPaint);

                    datasetUndoLog.push({previous: global.data[global.year].baselandcover.data[id], location: id});

                    changeBaselandcoverDataPoint(global.selectedPaint, id, false, global.year);
                });
            }

            function bindSelectBoxMouseover(details) {
                $(".watershed-rect").bind("mouseover.painting", function (e) {
                    moveSelectBox(e, this);
                });

                function moveSelectBox(e, element) {
                    var thisx = parseInt($(element).attr('x')),
                        thisy = parseInt($(element).attr('y')),
                        thiswidth = parseInt($(element).attr('width')),
                        thisheight = parseInt($(element).attr('height')),
                        width = thisx - details.x,
                        height = thisy - details.y;

                    if (width < 0 && height < 0) {
                        details.selectbox
                            .transition()
                            .duration(50)
                            .delay(0)
                            .attr('x', thisx)
                            .attr('y', thisy)
                            .attr('width', -width + thiswidth)
                            .attr('height', -height + thisheight);
                    } else if (width < 0) {
                        details.selectbox
                            .transition()
                            .duration(50)
                            .delay(0)
                            .attr('x', thisx)
                            .attr('y', details.y)
                            .attr('width', -width + thiswidth)
                            .attr('height', thisy - details.y + thisheight);
                    } else if (height < 0) {
                        details.selectbox
                            .transition()
                            .duration(50)
                            .delay(0)
                            .attr('x', details.x)
                            .attr('y', thisy)
                            .attr('width', thisx - details.x + thiswidth)
                            .attr('height', -height + thisheight);
                    } else {
                        details.selectbox
                            .transition()
                            .duration(50)
                            .delay(0)
                            .attr('x', details.x)
                            .attr('y', details.y)
                            .attr('width', thisx - details.x + thiswidth)
                            .attr('height', thisy - details.y + thisheight);
                    }
                }
            }
        } else {
            $(".watershed-rect").bind('touchstart', function (e) {
                console.log(e.originalEvent.touches);
                if (global.selectedPaint) {
                    var $id = $("#" + $(this).attr("id"));
                    var $image = $($id.prev().children().children());
                    var id = "#" + $image.attr("id");

                    var index = parseInt($id.attr("id"));

                    global.maps.changeWatershedRectImage(index, global.selectedPaint);

                    var undoData = [
                        {previous: global.data[global.year].baselandcover.data[index], location: index}
                    ];

                    changeBaselandcoverDataPoint(global.selectedPaint, index, false, global.year);

                    addDatasetChangesToUndoLog(undoData);
                }
            });

            $(document).bind('touchmove', function(e) {
                e.preventDefault();
            });
        }


        // --------------------------------------------------------
        // ---------------- Mouse Wheel Events --------------------

        var mytable = document.getElementById("workspace");
        if (mytable.addEventListener) {
            // IE9, Chrome, Safari, Opera
            //mytable.addEventListener("mousewheel", MouseWheelHandler, false);
            // Firefox
            //mytable.addEventListener("DOMMouseScroll", MouseWheelHandler, false);
        }
        // IE 6/7/8
        //else mytable.attachEvent("onmousewheel", MouseWheelHandler);

        function MouseWheelHandler(e) {
            //console.log(e.srcElement);
            //console.log($("#watershed td"));
            //cross-browser wheel delta
            //var a = window.event || e; // Old IE support
            //var delta = Math.max(-1, Math.min(1, (a.wheelDelta || -a.detail)));
            var rectSelector = $(".watershed-rect"),
                mousex = e.pageX - $(window).scrollLeft(),
                mousey = e.pageY - $(window).scrollTop(),
                wheel = e.wheelDelta / 120,
                tblwidth = parseFloat($("#watershed1").attr("width")),
                tblheight = parseFloat($("#watershed1").attr("height")),
                width = parseFloat(rectSelector.attr("width")),
                height = parseFloat(rectSelector.attr("height"));

            console.log(mousex, mousey);
            console.log(wheel);
            console.log(tblwidth, tblheight);
            console.log(width, height);

            //console.log(width + ", " + height);
            //console.log(e.wheelDelta);
            width += Math.floor(wheel * 3);
            height += Math.floor(wheel * 2);
            if (width * 23 / 2 <= window.innerWidth) {

                //$("#watershed1").attr("width",width * global.data[global.year].columns).attr("height",height * global.data[global.year].rows);
                // Store the table's new dimensions
                var newtblwidth = width * global.data[global.year].columns;
                var newtblheight = height * global.data[global.year].rows;
                $("#watershed1").attr("width", newtblwidth).attr("height", newtblheight);

                rectSelector.attr("width", width).attr("height", height);
                for (var i = 0; i < rectSelector.length; i++) {
                    console.log(Math.floor(wheel * 30));
                    var x = parseFloat(rectSelector.eq(i).attr("x")) + Math.floor(wheel * 30),
                        y = parseFloat(rectSelector.eq(i).attr("y")) + Math.floor(wheel * 20);
                    console.log(x);
                    rectSelector.eq(i).attr("x", x).attr("y", y);
                }

                // Get the table's center relative to itself
                var left = parseFloat($("#watershed1").css("marginLeft"));
                var top = parseFloat($("#watershed1").css("marginTop"));
                var centerx = (tblwidth / 2) - left;
                var centery = (tblheight / 2) - top;
                // Get the mouse position relative to the table
                var relmousex = mousex - left;
                var relmousey = mousey - top;
                // Get the difference in dimensions between the new and old table
                var diffwidth = newtblwidth - tblwidth;
                var diffheight = newtblheight - tblheight;
                console.log("Table Margin Left: " + left, "Table Margin Top: " + top);
                console.log(relmousex, relmousey);
                console.log(diffwidth, diffheight);
                // Get the ratio to move the table left/up
                // If the mouse is located on the right edge of the table the ratio will
                // be 1, and the full difference in width between the previous and current
                // table widths will be subtracted from the left border. If the mouse is
                // located on the left edge of the table, the ratio will be 0, and the
                // position of the table will not be moved. Same concept for the top
                // border.
                var marginleft = left - ((relmousex / tblwidth) * diffwidth);
                var margintop = top - ((relmousey / tblheight) * diffheight);
                // Apply the new margins to the table
                console.log(marginleft, margintop);
                $("#watershed1").css("margin-left", marginleft).css("margin-top", margintop);
            }

            return false;
        }

        function moveMapRectPosition(diffx, diffy) {

        }

        // --------------------------------------------------------
        // ---------------- Mouse Move Events ---------------------

        // var oldmousex = 0, oldmousey = 0;
//         $(document).on("mousemove", "#workspace", function (e) {
//             if (e.which == 2) {
//                 $("#workspace").css("cursor", "move");
//                 $("#watershed-rect").css("cursor", "move");
//                 var newmousex = e.pageX - $(window).scrollLeft();
//                 var newmousey = e.pageY - $(window).scrollTop();
//                 var left = parseFloat($("#watershed1").css("marginLeft"));
//                 var top = parseFloat($("#watershed1").css("marginTop"));
//                 if (oldmousex > 0 && oldmousey > 0) {
//                     var diffx = (newmousex - left) - (oldmousex - left);
//                     var diffy = (newmousey - top) - (oldmousey - top);
//                     left = left + diffx;
//                     top = top + diffy;
//                 }
// 
//                 $("#watershed1").css("marginLeft", left);
//                 $("#watershed1").css("marginTop", top);
// 
//                 oldmousex = newmousex;
//                 oldmousey = newmousey;
//             }
//             else {
//                 $("#workspace").css("cursor", "default");
//                 $("#watershed-rect").css("cursor", "pointer");
//             }
// 
//         });

        // --------------------------------------------------------
        // ---------------- Mouse Up Events -----------------------
        document.addEventListener("contextmenu", function (e) {
            e.preventDefault();
        }, false);

//        $("#workspace")
//            .mouseup(function (e) {
//                if (e.which == 2) {
//                    oldmousex = 0;
//                    oldmousey = 0;
//                } else if (e.which == 3) {
//                    var offset = $(this).offset();
//                    var coords = {
//                        x: e.pageX - this.offsetLeft,
//                        y: e.pageY - this.offsetTop
//                    };
//                    togglePuk("rclick", coords);
//                }
//            })//*/
//            .mousedown(function (e) {
//                if (e.which == 3) {
//                    var offset = $(this).offset();
//                    var coords = {
//                        x: e.pageX - this.offsetLeft,
//                        y: e.pageY - this.offsetTop
//                    };
//                    var width = parseInt($("#rclick-puk-container").width());
//                    var height = parseInt($("#rclick-puk-container").height());
//                    $("#rclick-puk-container").css("left", coords.x - (width / 2)).css("top", coords.y - (height / 2));
//                    togglePuk("rclick", coords);
//                }
//            });

//        $("#rclick-puk-container").mouseup(function (e) {
//            if (e.which == 3) {
//                var offset = $(this).offset();
//                var coords = {
//                    x: e.pageX - this.offsetLeft,
//                    y: e.pageY - this.offsetTop
//                };
//                togglePuk("rclick", coords);
//            }
//        });
//
//        $("*").mouseup(function (e) {
//            if (e.which == 3) {
//                var offset = $(this).offset();
//                var coords = {
//                    x: e.pageX - this.offsetLeft,
//                    y: e.pageY - this.offsetTop
//                };
//                togglePuk("rclick", coords);
//            }
//        });


    };

    function displayLoadingLayer(selector) {
        $(selector).fadeToggle("slow", function () {
            global.sm.consumeEvent(global.sm.goto.MAIN);
        });
//        setTimeout(function () {
//            $(selector).fadeToggle("slow", function () {
//                global.sm.consumeEvent(global.sm.goto.MAIN);
//            });
//        }, 0);
    }

    $(window).resize(function () {
        centerElement($(window), $("#watershed1"));
        SCREEN.width = $(window).width();
        SCREEN.height = $(window).height();
        resizeBackgroundImage();
    });
    var landCoverPicsObject = [, , , , , , , , , , , , , , , ];

    function loadLandCoverPics() {
        for (var i = 1; i < landCoverPicsObject.length; i++) {
            landCoverPicsObject[i] = new Image();
            landCoverPicsObject[i].src = "images/cell_images/" + picsForLandCoverGrid[i];
        }
    }

    function setBackgroundImage(selector) {
        var s, winheight;
        s = "100%";
        winheight = (global.sm.getStatus == 'mainevent-view') ? SCREEN.height - ($("#toolbar").height() - 3) : SCREEN.height;
        $(selector).css("background", "url(images/backgrounds/" + backgroundImages[global.data.r[global.year]] + ")").css("background-size", s + " " + winheight + "px");
    }

    function copyBackgroundImage(selector) {
        var winheight, s;
        s = "100%";
        winheight = (global.sm.getStatus == 'mainevent-view') ? SCREEN.height - ($("#toolbar").height() - 3) : SCREEN.height;
        $(selector).css("background", "url(images/backgrounds/" + backgroundImages[global.data.r[global.year]] + ")").css("background-size", s + " " + winheight + "px");
    }

    function resizeBackgroundImage() {
        var s = "100%";
        var winheight = SCREEN.height/* - ($("#toolbar").height()-3)*/;
        $("body").css("background-size", s + " " + winheight + "px");
    }

    function hideMiniMap() {
        if ($("#mini-map").is(":visible") == true) {
            $("#mini-map").hide();
        }
    }

    function populateMiniMap(data, colors, adjust) {
        if (adjust) {
            for (var i = 0; i < data.length; i++) {
                if (data[i] != undefined) {
                    $("#mini-map td").eq(i).css("background", colors[data[i] - 1]);
                }
            }
        } else {
            for (var i = 0; i < data.length; i++) {
                if (data[i] != undefined) {
                    $("#mini-map td").eq(i).css("background", colors[data[i]]);
                }
            }
        }
    }
})(jQuery);

function displayMiniMap(id) {
    var selector = $("#" + id + "-mini-map");
    var td = $("#" + id + "-mini-map td");
    if (selector.is(":visible") == false) {
        selector.show("explode");
    } else {
        selector.hide("explode");
    }
    var data,
        options = {
            id: id,
            width: 3,
            height: 2
        };
    global.maps.minimap(options);
    centerElement($("#" + id + "-mini-map"), $("#" + id + "-mini-map table"));
    //populateMiniMap(data.data,colors,adjust);
}
function updateHud() {
    $("#year-hud a").text("Year: " + global.year);

    $('#label-year-' + global.year).css('border-left', '0.1em solid #cccc00');
    if (global.previousyear > 0) {
        $('#label-year-' + global.previousyear).css('border-left', '');
    }

    updatePrecipitationHud();
    updatePaintSelection();
}

function updatePrecipitationHud() {
    $("#precipitation-hud a").text("Precipitation: " + getPrecipitationValuation(global.data.precipitation[global.year]));
}

function updateYearHelperHud($selector) {
    $("#year-help-year").text("Year " + $selector.val());
    var p = parseFloat(global.data.precipitation[$selector.val()]);
    $("#year-help-precipitation").text("Precipitation: " + getPrecipitationValuation(p));
    // Set other stats
}

function getPrecipitationValuation(p) {
    if (p < 30.39) {
        return "Dry";
    } else if (p < 36.47) {
        return "Normal";
    } else {
        return "Wet";
    }
}
function updatePaintSelection() {
    $("#current-selection-hud a").text("Current Selection: " + getCurrentSelection());
}
function getCurrentSelection() {
    if (global.selectedPaint == undefined) {
        return "None";
    } else {
        return landcovers[global.selectedPaint];
    }
}
