define([
    'app/constants',
    ], function (c) {

    var Weather = {};

    Weather.Weather = function (weatherType, hoursRemaining) {
        this.weatherType = weatherType;
        this.hoursRemaining = hoursRemaining;
    };

    Weather.Weather.prototype = {
        constructor: Weather.Weather,
        consumeHour: function () {
            this.hoursRemaining--;
            if (this.hoursRemaining <= 0) {
                return new Weather.generateWeather();
            } else {
                return this;
            }
        }
    };

    Weather.generateWeather = function () {
        var randomWeatherType = c.getRandom("weather type");
        if (randomWeatherType > .75) {
            return new Weather.Weather(c.WEATHER_CLOUDY, c.determineRandomNumberInRange(3, 40, "hours weather type cloudy"));
        } else if (randomWeatherType > .95) {
            return new Weather.Weather(c.WEATHER_STORMY, c.determineRandomNumberInRange(1, 5, "hours weather type stormy"));
        } else {
            return new Weather.Weather(c.WEATHER_CLEAR, c.determineRandomNumberInRange(6, 30, "hours weather type clear"));
        }
    };

    return Weather;
});
