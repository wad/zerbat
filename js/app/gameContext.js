// the main object that contains all the stuff needed for the game
// the game state (gs) is created later, and added as .gs to this object.
// this object can be saved, to save the game

define([
    'app/constants',
    'app/zerbatConstants',
    'app/weather'
], function (c, zc, Weather) {

    var GameContext = {};

    // these globals need to be wrapped into this for later access.
    GameContext.mapImageOverland = _GLOBAL_gameContext.mapImageOverland;
    GameContext.mapImageDetail = _GLOBAL_gameContext.mapImageDetail;
    GameContext.mapImageTerrain = _GLOBAL_gameContext.mapImageTerrain;
    GameContext.iconImage = _GLOBAL_gameContext.iconImage;
    GameContext.weatherImage = _GLOBAL_gameContext.weatherImage;

    GameContext.uniqueId = 10000;
    GameContext.getNewUniqueId = function () {
        GameContext.uniqueId++;
        return "id" + GameContext.uniqueId;
    };

    // this is the game state
    GameContext.generateNewGameState = function () {
        return {
            currentDate: c.cloneDate(zc.GAME_STARTING_DATE),
            currentWeather: new Weather.Weather(c.WEATHER_CLEAR, 30),

            // the first thing this game will do before giving control to the player,
            // is to move the play from this location to a different one
            playerLocation: [zc.START_PLAYER_LOCATION_BEFORE_FIRST_MOVE[X], zc.START_PLAYER_LOCATION_BEFORE_FIRST_MOVE[Y]],

            // list of places (limited to places known to the player) to be found at the player's current location.
            // This will always be set to something, and is rebuilt every time the player moves.
            placesAtCurrentLocation: null,

            // this is set every time the player moves.
            descriptionOfCurrentLocation: null,

            foodAnimalPresenceInAreaKnown: false,
            foodPlantPresenceInAreaKnown: false,
            foodAnimalPresenceAreaStatus: c.FOOD_PRESENCE_IN_AREA_SOME,
            foodPlantPresenceAreaStatus: c.FOOD_PRESENCE_IN_AREA_SOME,
            playerCrew: [],
            playerGear: [],
            journal: [],
            blocks: [],
            playerTravelMode: c.TRAVEL_MODE_WALKING_SLOW,
            currentStashNumber: 1,
            cheatCount: 0
        };
    };

    return GameContext;
});
