define([
    'app/constants',
    'app/gameContext',
    'app/crew',
    'app/gear',
    'app/map'], function (c, gx, Crew, Gear, Map) {

    var Status = {};

    Status.setupWeather = function() {
        // should not use jQuery here, this is already an HTML5 javascript object.
        var weatherCanvas = document.getElementById("canvasWeather");

        weatherCanvas.width = c.WEATHER_WINDOW_SIZE[X];
        weatherCanvas.height = c.WEATHER_WINDOW_SIZE[Y];
        if (!weatherCanvas.getContext) {
            throw("Failed to get context. This isn't going to work. You probably just need a better browser.");
        }
        gx.weatherContext = weatherCanvas.getContext("2d");
    };

    Status.updateWeatherBox = function() {
        var column = gx.gs.currentWeather.weatherType;
        var row = gx.gs.currentDate.getHours();
        gx.weatherContext.drawImage(
            gx.weatherImage,
            column * c.WEATHER_WINDOW_SIZE[X], row * c.WEATHER_WINDOW_SIZE[Y],
            c.WEATHER_WINDOW_SIZE[X], c.WEATHER_WINDOW_SIZE[Y],
            0, 0,
            c.WEATHER_WINDOW_SIZE[X], c.WEATHER_WINDOW_SIZE[Y]);
    };

    Status.updateStatus = function () {
        function buildStatusLine() {
            var statusLineEntries = [];
            if (Crew.numCrewSleepy(gx.gs.playerCrew) > 0) {
                statusLineEntries.push("sleepy");
            }
            if (Crew.getAverageCrewHunger(gx.gs.playerCrew) >= 1) {
                var maxDaysSincePreviousMeal = Crew.computeMaxDaysSincePreviousMeal(gx.gs.playerCrew, gx.gs.currentDate);
                if (maxDaysSincePreviousMeal > c.DAYS_WITHOUT_FOOD_STARVING) {
                    statusLineEntries.push("starving");
                } else if (maxDaysSincePreviousMeal > c.DAYS_WITHOUT_FOOD_RAVENOUS) {
                    statusLineEntries.push("ravenous");
                } else {
                    statusLineEntries.push("hungry");
                }
            }
            return statusLineEntries.join(", ");
        }

        Status.updateWeatherBox();

        // mini status on map tab
        $("#labelMiniStatusCurrentDate").text(c.formatDateForStatusDisplay(gx.gs.currentDate));
        $("#labelMiniStatusCurrentTime").text(c.formatTimeForDisplay(gx.gs.currentDate));
        $("#labelMiniStatusHealth").text(c.formatPercent(Crew.getAverageCrewHealth(gx.gs.playerCrew)));
        $("#labelMiniStatusCrewEnergy").text(c.formatPercent(Crew.getMinimumCrewPhysicalEnergy(gx.gs.playerCrew)));
        $("#labelMiniStatusTravelMode").text(c.TRAVEL_MODE_NAMES[gx.gs.playerTravelMode]);
        $("#labelMiniStatusTerrainType").text(c.TERRAIN_TYPE_NAMES[Map.identifyTerrainType(gx.gs.playerLocation)]);
        $("#labelMiniStatusWeather").text(c.WEATHER_NAMES[gx.gs.currentWeather.weatherType]);
        $("#labelMiniStatusStatusLine").text(buildStatusLine());

        // status tab
        $("#labelPositionIndicator").text("" + gx.gs.playerLocation[X] + "," + gx.gs.playerLocation[Y]);
        $("#labelStatusLine").text(buildStatusLine());
        $("#labelTerrainType").text(c.TERRAIN_TYPE_NAMES[Map.identifyTerrainType(gx.gs.playerLocation)]);
        $("#labelWeather").text(c.WEATHER_NAMES[gx.gs.currentWeather.weatherType]);
        $("#labelPlayerCharacterName").text(Crew.getPlayerCharacter(gx.gs.playerCrew).individualName);
        $("#labelCurrentDate").text(c.formatDateForStatusDisplay(gx.gs.currentDate));
        $("#labelCurrentTime").text(c.formatTimeForDisplay(gx.gs.currentDate));
        $("#labelCrewSize").text(Crew.getCrewSize(gx.gs.playerCrew));
        $("#labelAverageLoad").text(c.formatFloat(Gear.computeWeightCarried(gx.gs.playerGear) / Crew.getCrewSize(gx.gs.playerCrew)));
        $("#labelNumCrewSleepy").text(Crew.numCrewSleepy(gx.gs.playerCrew));
        $("#labelCrewEnergy").text(c.formatPercent(Crew.getMinimumCrewPhysicalEnergy(gx.gs.playerCrew)));
        $("#labelCrewHunger").text(c.formatPercent(Crew.getAverageCrewHunger(gx.gs.playerCrew)));
        $("#labelMinCrewHealth").text(c.formatPercent(Crew.getMinimumCrewHealth(gx.gs.playerCrew)));
        $("#labelAvgCrewHealth").text(c.formatPercent(Crew.getAverageCrewHealth(gx.gs.playerCrew)));
        $("#labelTravelMode").text(c.TRAVEL_MODE_NAMES[gx.gs.playerTravelMode]);
        $("#labelZerbatVersion").text(c.ZERBAT_VERSION);
    };

    return Status;
});
