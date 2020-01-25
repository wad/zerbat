define([
    'app/constants',
    'app/zerbatConstants',
    'app/gameContext',
    'app/places',
    'app/map',
    'app/travel',
    'app/gui',
    'app/status',
    'app/journal',
    'app/player',
    'app/crew',
    'app/gear',
    'app/zerbat'], function (c, zc, gx, Places, Map, Travel, Gui, Status, Journal, Player, Crew, Gear, Zerbat) {

    var Game = {};

    Game.clickButtonNewGame = function () {
        gx.gs = gx.generateNewGameState();
        var dialogIdNewGame = gx.getNewUniqueId();
        var dialogHtml = [
            '<div id="' + dialogIdNewGame + '">',
            '<label>What is your name, traveler?</label>',
            '<input type="text" value="' + zc.DEFAULT_PLAYER_CHARACTER_NAME + '" id="dialogPlayerCharacterName">',
            '<form><div id="dialogRadio">',
            '<input type="radio" id="radioMale" name="radio" checked="checked"/><label for="radioMale">Man</label>',
            '<input type="radio" id="radioFemale" name="radio" /><label for="radioFemale">Woman</label>',
            '</div></form></div>'
        ].join("\n");
        $("#zGameArea").append(dialogHtml);
        $("#dialogRadio").buttonset();
        $("#" + dialogIdNewGame).dialog({
            closeOnEscape: false,
            modal: true,
            title: "Start a new game",
            buttons: [
                {
                    text: "Ok",
                    click: function () {

                        var playerName = $("#dialogPlayerCharacterName").val();
                        var playerGender = ($("#radioMale").prop('checked')) ? c.GENDER_MALE : c.GENDER_FEMALE;

                        $(this).dialog("close");
                        $("#" + dialogIdNewGame).remove();

                        gx.gs.playerCrew = Crew.addCrew(gx.gs.playerCrew, Zerbat.newPlayerCharacter(playerName, playerGender));
                        gx.gs.playerGear = Gear.combineGear(gx.gs.playerGear, Zerbat.newPlayerGear(playerGender));

                        Zerbat.initialPlaces().forEach(function(place) {
                            Places.addPlace(gx.gs.blocks, place);
                        });

                        var $zGameArea = $("#zGameArea");
                        $zGameArea.tabs("option", "disabled", false);
                        $zGameArea.tabs("option", "active", c.TAB_INDEX_MAP);

                        Map.setupMap(Game.clickMap, Game.clickMinimap);
                        Status.setupWeather();
                        Status.updateStatus();

                        Map.refreshMap();

                        var dialogIdInitialMessage = gx.getNewUniqueId();

                        Gui.showMessageWithCallback(Zerbat.introMessage, "Shipwrecked!", dialogIdInitialMessage, function () {
                            $(this).dialog("close");
                            $("#" + dialogIdInitialMessage).remove();
                            if (Crew.hasEnoughEnergyForTask(gx.gs.playerCrew, c.ACTIVITY_LEVEL_SLOW_WALKING)) {
                                Travel.travelToLocation(zc.START_PLAYER_LOCATION, Player.spendHourAsEntireCrew, Player.discoverPlaces);
                                Journal.addEntry(gx.gs.journal, new Journal.Entry(
                                    Zerbat.firstJournalEntry,
                                    c.JOURNAL_ENTRY_TYPE_RED_LETTER,
                                    ""));
                            } else {
                                throw "Error: Not enough energy to start the game";
                            }
                        });
                    }
                }
            ]
        });
    };

    Game.clickButtonLoadGame = function () {
        alert("Sorry, I haven't written the code yet to load and save games. --- Eric");
        // todo
    };

    Game.clickButtonSaveGame = function () {
        alert("Sorry, I haven't written the code yet to load and save games. --- Eric");
        // todo
    };

    Game.clickButtonQuitGame = function () {
        alert("Sorry, I haven't yet figured out what should happen when the player clicks the quit button. --- Eric");
        // todo
    };

    Game.clickButtonGameSettings = function () {
        alert("Sorry, I haven't put any game settings here yet. --- Eric");
        // todo
    };

    Game.showScore = function () {
        $("#labelScoreDaysSurvived").text(c.getDateDifferenceInDays(zc.GAME_STARTING_DATE, gx.gs.currentDate));
        $("#labelScoreTotalGearValue").text(Gear.calculateTotalValue(gx.gs.playerGear));
        $("#labelScoreTimesCheated").text(gx.gs.cheatCount == 0 ? "no" : "yes (" + gx.gs.cheatCount + " times)");
    };

    Game.clickMap = function (event) {
        var locationClicked = Map.clickMap(event);
        Travel.travelToLocation(locationClicked, Player.spendHourAsEntireCrew, Player.discoverPlaces);
    };

    Game.clickMinimap = function (event) {
        var locationClicked = Map.clickMinimap(event);
        Travel.travelToLocation(locationClicked, Player.spendHourAsEntireCrew, Player.discoverPlaces);
    };

    return Game;
});
