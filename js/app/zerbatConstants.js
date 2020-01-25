define(function () {

    var zc = {};

    zc.GAME_STARTING_DATE = new Date(6070, 4, 1, 4);

    // one pixel east of where player takes control,
    // to put the player in the ocean next to the desired start location when they are moved at the start of the game.
    zc.START_PLAYER_LOCATION_BEFORE_FIRST_MOVE = [5603, 1220];

    zc.START_PLAYER_LOCATION = [5602, 1220];

    zc.DEFAULT_PLAYER_AGE_MIN = 18;
    zc.DEFAULT_PLAYER_AGE_MAX = 22;
    zc.DEFAULT_PLAYER_CHARACTER_NAME = "Odysseus";

    return zc;
});
