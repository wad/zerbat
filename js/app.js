requirejs.config({
    baseUrl: 'js/lib',
    paths: {
        app: '../app'
    },
    shim: {
        "jquery-ui": {
            exports: "$",
            deps: ['jquery']
        }
    }
});

// global constants, just too convenient to not use.
// These are indexes to arrays of size 2, representing coordinate pairs.
var X = 0;
var Y = 1;

// This needs to run first, to load up the images needed for the game
// That global variable will be wrapped in globalContext module shortly, and no longer accessed globally.
var _GLOBAL_gameContext = {};
(function () {
    var numItemsToLoad = 5;
    var numItemsLoaded = 0;

    _GLOBAL_gameContext.resourcesLoaded = false;

    console.log("Begin loading map_overland.png");
    _GLOBAL_gameContext.mapImageOverland = new Image();
    _GLOBAL_gameContext.mapImageOverland.addEventListener('load', markAnotherItemLoaded);
    _GLOBAL_gameContext.mapImageOverland.src = "img/map_overland.png";

    console.log("Begin loading map_visible.jpg");
    _GLOBAL_gameContext.mapImageDetail = new Image();
    _GLOBAL_gameContext.mapImageDetail.addEventListener('load', markAnotherItemLoaded);
    _GLOBAL_gameContext.mapImageDetail.src = "img/map_visible.jpg";

    console.log("Begin loading map_terrain.png");
    _GLOBAL_gameContext.mapImageTerrain = new Image();
    _GLOBAL_gameContext.mapImageTerrain.addEventListener('load', markAnotherItemLoaded);
    _GLOBAL_gameContext.mapImageTerrain.src = "img/map_terrain.png";

    console.log("Begin loading icons.png");
    _GLOBAL_gameContext.iconImage = new Image();
    _GLOBAL_gameContext.iconImage.addEventListener('load', markAnotherItemLoaded);
    _GLOBAL_gameContext.iconImage.src = "img/icons.png";

    console.log("Begin loading weather.jpg");
    _GLOBAL_gameContext.weatherImage = new Image();
    _GLOBAL_gameContext.weatherImage.addEventListener('load', markAnotherItemLoaded);
    _GLOBAL_gameContext.weatherImage.src = "img/weather.jpg";

    function markAnotherItemLoaded() {
        numItemsLoaded++;
        console.log("Loaded " + numItemsLoaded + "/" + numItemsToLoad + " resources.");
        if (numItemsLoaded >= numItemsToLoad) {
            _GLOBAL_gameContext.resourcesLoaded = true;
        }
    }

    startRequireJs();
}());

// this global allows use of the cheat methods
var cheat;

function startRequireJs() {
    requirejs([
        'jquery-ui',
        'app/constants',
        'app/gameContext',
        'app/journal',
        'app/travel',
        'app/area',
        'app/gear',
        'app/crew',
        'app/player',
        'app/game',
        'app/cheat',
        'app/tests'],
        function ($, c, gx, Journal, Travel, Area, Gear, Crew, Player, Game, Cheat, Tests) {
            $(function () {

                // make only the GAME tab active, disable the rest of them
                $("#zGameArea").tabs({
                    active: c.TAB_INDEX_GAME,
                    disabled: [
                        c.TAB_INDEX_MAP,
                        c.TAB_INDEX_AREA,
                        c.TAB_INDEX_JOURNAL,
                        c.TAB_INDEX_STATUS,
                        c.TAB_INDEX_CREW,
                        c.TAB_INDEX_INVENTORY,
                        c.TAB_INDEX_SCORE
                    ],
                    beforeActivate: function (event, ui) {
                        switch (ui.newTab.index()) {
                            case c.TAB_INDEX_GAME:
                            case c.TAB_INDEX_MAP:
                            case c.TAB_INDEX_STATUS:
                            case c.TAB_INDEX_HELP:
                                break;
                            case c.TAB_INDEX_AREA:
                                Area.showArea();
                            case c.TAB_INDEX_JOURNAL:
                                Journal.showJournal(gx.gs.journal);
                            case c.TAB_INDEX_SCORE:
                                Game.showScore();
                            case c.TAB_INDEX_CREW:
                                Crew.showCrew(gx.gs.playerCrew);
                                break;
                            case c.TAB_INDEX_INVENTORY:
                                Gear.showInventory();
                                break;
                            default:
                                throw "Unhandled case, unknown tab";
                        }
                    }
                });

                // apply jQueryUI to all the buttons
                $(".zButton").button();

                // hook up and set enabled on GAME tab buttons
                var $buttonNewGame = $("#buttonNewGame");
                var $buttonLoadGame = $("#buttonLoadGame");
                var $buttonSaveGame = $("#buttonSaveGame");
                var $buttonQuitGame = $("#buttonQuitGame");
                var $buttonGameSettings = $("#buttonGameSettings");
                $buttonNewGame.click(function () {
                    Game.clickButtonNewGame();
                });
                $buttonLoadGame.click(function () {
                    Game.clickButtonLoadGame();
                });
                $buttonSaveGame.click(function () {
                    Game.clickButtonSaveGame();
                });
                $buttonQuitGame.click(function () {
                    Game.clickButtonQuitGame();
                });
                $buttonGameSettings.click(function () {
                    Game.clickButtonGameSettings();
                });

                // hook up the buttons on the MAP tab
                $("#buttonRest").click(function () {
                    Player.clickButtonRest();
                });
                $("#buttonLook").click(function () {
                    Player.clickButtonChooseDestination();
                });
                $("#buttonSearch").click(function () {
                    Player.clickButtonSearch();
                });
                $("#buttonSeekFood").click(function () {
                    Player.clickButtonSeekFood();
                });
                $("#buttonTrain").click(function () {
                    Player.clickButtonTrain();
                });
                $("#buttonSleep").click(function () {
                    Player.clickButtonSleep();
                });
                $("#buttonBuild").click(function () {
                    Player.clickButtonBuild();
                });
                $("#buttonTravelMode").click(function () {
                    Travel.clickButtonTravelMode();
                });

                // enable travel and control buttons
                $(".buttonNav").button("option", "disabled", false);
                $(".buttonControl").button("option", "disabled", false);

                // inventory tab has tabs too
                $("#tabs-inventory").tabs({
                    active: c.ITEM_TYPE_SPECIAL
                });

                cheat = Cheat;

                if (c.DEBUG) {
                    Tests.runAllTests();
                }

                var intervalId = setInterval(function() {
                    if (_GLOBAL_gameContext.resourcesLoaded) {
                        $("#noCssLoadMessage").remove();
                        clearInterval(intervalId);
                        $buttonNewGame.button("option", "disabled", false);
                    }
                }, 300);
            });
        }
    );
}
