define(function () {

    var c = {};

    c.ZERBAT_VERSION = "0.0.1";

    // tests are run, and output is emitted to the console, when in debug mode
    c.DEBUG = true;

    // used for more in-depth debugging
    c.DEBUG2 = false;

    /////////////// fundamental constants

    c.INFINITY = 9999999;

    c.X = X;
    c.Y = Y;

    // these are indexes to arrays representing colors
    c.R = 0;
    c.G = 1;
    c.B = 2;

    // directions
    c.E = 0;
    c.NE = 1;
    c.N = 2;
    c.NW = 3;
    c.W = 4;
    c.SW = 5;
    c.S = 6;
    c.SE = 7;
    c.DIRECTION_SYMBOLS = [
        "E",
        "NE",
        "N",
        "NW",
        "W",
        "SW",
        "S",
        "SE"
    ];
    c.DIRECTION_DELTAS = [
        [1, 0],
        [1, -1],
        [0, -1],
        [-1, -1],
        [-1, 0],
        [-1, 1],
        [0, 1],
        [1, 1]
    ];
    c.DIRECTION_NAMES = [
        "east",
        "northeast",
        "north",
        "northwest",
        "west",
        "southwest",
        "south",
        "southeast"
    ];
    c.DIRECTION_ANGLES = [
        0 * Math.PI / 4, // 0.00
        1 * Math.PI / 4, // 0.79
        2 * Math.PI / 4, // 1.57
        3 * Math.PI / 4, // 2.35
        4 * Math.PI / 4, // 3.13
        5 * Math.PI / 4, // 3.93
        6 * Math.PI / 4, // 4.71
        7 * Math.PI / 4  // 5.50
    ];

    ///////////////// time constants

    c.NUM_MILLIS_PER_SECOND = 1000;
    c.NUM_SECONDS_PER_MINUTE = 60;
    c.NUM_MINUTES_PER_HOUR = 60;
    c.NUM_MILLIS_PER_HOUR = c.NUM_MINUTES_PER_HOUR * c.NUM_SECONDS_PER_MINUTE * c.NUM_MILLIS_PER_SECOND;
    c.NUM_HOURS_PER_DAY = 24;
    c.NUM_MILLIS_PER_DAY = c.NUM_HOURS_PER_DAY * c.NUM_MILLIS_PER_HOUR;
    c.NUM_DAYS_PER_YEAR = 365.25;
    c.NUM_MILLIS_PER_YEAR = c.NUM_DAYS_PER_YEAR * c.NUM_MILLIS_PER_DAY;

    c.DAWN_HOUR = 5;
    c.DUSK_HOUR = 19;

    c.SKY_NIGHT = 0;
    c.SKY_SUNRISE = 1;
    c.SKY_DAY = 2;
    c.SKY_SUNSET = 3;
    c.SKY_NAMES = [
        "night",
        "sunrise",
        "day",
        "sunset"
    ];

    c.WEATHER_CLEAR = 0;
    c.WEATHER_CLOUDY = 1;
    c.WEATHER_STORMY = 2;
    c.WEATHER_NAMES = [
        "clear",
        "cloudy",
        "stormy"
    ];

    // image has 24 panes vertically, and 3 horizontally: 576 x 1200 pixels
    c.WEATHER_WINDOW_SIZE = [192, 50];

    c.TERRAIN_TYPE_UNKNOWN = 0;
    c.TERRAIN_TYPE_SHORE = 1;
    c.TERRAIN_TYPE_OCEAN = 2;
    c.TERRAIN_TYPE_MTN_OVER_PLAINS = 3;
    c.TERRAIN_TYPE_MTN_OVER_PINE = 4;
    c.TERRAIN_TYPE_MTN_OVER_JUNGLE = 5;
    c.TERRAIN_TYPE_MTN_OVER_DESERT = 6;
    c.TERRAIN_TYPE_PLAIN = 7;
    c.TERRAIN_TYPE_PINE_FOREST = 8;
    c.TERRAIN_TYPE_LAKE = 9;
    c.TERRAIN_TYPE_RIVER = 10;
    c.TERRAIN_TYPE_JUNGLE = 11;
    c.TERRAIN_TYPE_DESERT = 12;
    c.TERRAIN_TYPE_TOWN = 13;
    c.TERRAIN_TYPE_AGRICULTURAL = 14;
    c.TERRAIN_TYPE_IMPASSABLE_CLIFFS = 15;
    c.TERRAIN_TYPE_CLIFFS = 16;
    c.TERRAIN_TYPE_SWAMP = 17;
    c.TERRAIN_TYPE_LAVAFLOW = 18;
    c.TERRAIN_TYPE_LAVA = 19;

    c.TERRAIN_TYPE_NAMES = [
        "unknown", // 0
        "coastal", // 1
        "ocean", // 2
        "mountain over plains", // 3
        "mountain over pine forest", // 4
        "mountain over jungle", // 5
        "mountain over desert", // 6
        "grassy plain", // 7
        "pine forest", // 8
        "freshwater lake", // 9
        "river", // 10
        "jungle", // 11
        "desert", // 12
        "town", // 13
        "agriculture", // 14
        "impassable cliffs", // 15
        "cliffs", // 16
        "swamp", // 17
        "lavaflow", // 18
        "lava" // 19
    ];

    c.TERRAIN_TYPE_COLORS = [
        "b0b0b0", // unknown
        "000000", // coastal
        "5959e0", // ocean
        "eddf9d", // mtn over plains
        "e0cf80", // mtn over pines
        "bcfbad", // mtn over jungle
        "d6f387", // mtn over desert
        "bfde7a", // grassy plain
        "358e21", // pine forest
        "9dc4e8", // lake
        "87aacb", // river
        "3b885b", // jungle
        "f9f22e", // desert
        "a1a1a1", // town
        "a1ffa1", // agriculture
        "bf0606", // impassable cliffs
        "d71db6", // cliffs
        "3fcd3f", // swamp
        "1d1d1d", // lavaflow
        "ed2525" // lava
    ];

    c.TERRAIN_TYPE_SYMBOLS = [
        'u', // unknown
        's', // coastal
        'o', // ocean
        '1', // mtn over plains
        '2', // mtn over pines
        '3', // mtn over jungle
        '4', // mtn over desert
        'p', // grassy plain
        'f', // pine forest
        'l', // lake
        'r', // river
        'j', // jungle
        'd', // desert
        't', // town
        'a', // farm
        'x', // impassable cliffs
        'c', // cliffs
        'w', // swamp
        'v', // lavaflow
        'V' // lava
    ];

    //////////////// map constants

    c.MAP_OVERLAND_SIZE_IN_PIXELS = [768, 512];

    // how zoomed in the detail map is of the overland map
    c.ZOOM_FACTOR = 8;

    // this is [6144, 4096]
    c.MAP_DETAIL_SIZE_IN_PIXELS = [
        c.MAP_OVERLAND_SIZE_IN_PIXELS[X] * c.ZOOM_FACTOR,
        c.MAP_OVERLAND_SIZE_IN_PIXELS[Y] * c.ZOOM_FACTOR
    ];

    // the minimap is the small view area of the detail map, showing the local area
    c.MINIMAP_SIZE_IN_PIXELS = [192, 192];
    c.MINIMAP_CENTER_POS = [
        c.MINIMAP_SIZE_IN_PIXELS[X] >> 1,
        c.MINIMAP_SIZE_IN_PIXELS[Y] >> 1
    ];

    c.MILES_PER_DETAIL_MAP_PIXEL = .2;

    //////////////// place constants

    c.BLOCK_SIZE = [64, 64];

    c.PLACE_VISIBILITY_NONE = 0; // cannot be discovered, by accident or by searching
    c.PLACE_VISIBILITY_TINY = 1; // a goldbead
    c.PLACE_VISIBILITY_SMALL = 2; // a knife
    c.PLACE_VISIBILITY_MEDIUM = 3; // a shovel
    c.PLACE_VISIBILITY_LARGE = 4; // a house
    c.PLACE_VISIBILITY_HUGE = 5; // a tall tower
    c.PLACE_VISIBILITY_KNOWN = 6; // you already know it's there

    c.PLACE_TYPE_NOTHING_OF_INTEREST = 0;
    c.PLACE_TYPE_STASH = 1;
    c.PLACE_TYPE_LOOT = 2;

    c.PLACE_TYPE_DESCRIPTION_ONLY = 100;
    c.PLACE_TYPE_CONVERSATION = 101;

    c.PLACE_TYPE_ENCOUNTER = 201;
    c.PLACE_TYPE_DAMSEL_IN_DISTRESS = 202;
    c.PLACE_TYPE_MERCHANT = 203;
    c.PLACE_TYPE_SKYSHIP = 204;
    c.PLACE_TYPE_TRAP = 205;

    c.PLACE_TYPE_TREEHOUSE = 300;
    c.PLACE_TYPE_COTTAGE = 301;
    c.PLACE_TYPE_FARM = 302;
    c.PLACE_TYPE_VILLAGE = 303;
    c.PLACE_TYPE_FORTRESS = 304;
    c.PLACE_TYPE_CASTLE = 305;
    c.PLACE_TYPE_SHIP = 306;

    c.PLACE_TYPE_TOWER = 400;
    c.PLACE_TYPE_PYRAMID = 401;
    c.PLACE_TYPE_FAIRY_RING = 402;

    c.PLACE_TYPE_STONE_RUINS = 500;
    c.PLACE_TYPE_WOODEN_RUINS = 501;

    c.PLACE_TYPE_QUICKSAND = 600;
    c.PLACE_TYPE_PIT = 601;
    c.PLACE_TYPE_CAVE = 602;
    c.PLACE_TYPE_MINE = 603;

    //////////////// construction constants

    c.CONSTRUCT_STASH = 0;
    c.CONSTRUCT_HOUSE = 1;
    c.CONSTRUCT_PALISADE = 2;
    c.CONSTRUCT_FORT = 3;
    c.CONSTRUCT_CASTLE = 4;
    c.CONSTRUCT_PALACE = 5;
    c.CONSTRUCT_SHIP = 6;

    //////////////// icon constants

    c.ICON_SIZE = [16, 16];

    c.ICON_INDEX_WANDERER = 0 * c.ICON_SIZE[Y];
    c.ICON_INDEX_SPOT_X = 1 * c.ICON_SIZE[Y];
    c.ICON_INDEX_QUESTION_MARK = 2 * c.ICON_SIZE[Y];

    ///////////////// world constants

    c.FOOD_PRESENCE_IN_AREA_NONE = 0;
    c.FOOD_PRESENCE_IN_AREA_SOME = 1;

    ///////////////// game constants

    c.TRAVEL_MODE_WALKING_SLOW = 0;
    c.TRAVEL_MODE_WALKING_FAST = 1;
    c.TRAVEL_MODE_RUNNING = 2;
    c.TRAVEL_MODE_RIDING = 3;
    c.TRAVEL_MODE_FLYING = 4;
    c.TRAVEL_MODE_NAMES = [
        "slow walk",
        "fast walk",
        "run",
        "ride",
        "fly"
    ];

    c.ACTIVITY_LEVEL_SLEEPING = 0;
    c.ACTIVITY_LEVEL_RESTING = 1;
    c.ACTIVITY_LEVEL_STANDING_AROUND = 2;
    c.ACTIVITY_LEVEL_SLOW_WALKING = 3;
    c.ACTIVITY_LEVEL_BRISK_WALKING = 4;
    c.ACTIVITY_LEVEL_RUNNING = 5;

    c.HUNGER_LEVEL_AT_WHICH_TO_EAT = .5;
    c.HUNGER_INCREMENT_PER_HOUR = .1;
    c.DAYS_WITHOUT_FOOD_RAVENOUS = 4;
    c.DAYS_WITHOUT_FOOD_STARVING = 7;
    c.HEALTH_DECREMENT_RATE_WHEN_STARVING = .05;

    c.SLEEP_DEPRIVATION_HOURS = 36;
    c.PERCENT_TO_DAMAGE_HEALTH_PER_HOUR_FROM_SLEEP_DEPRIVATION = .01;
    c.MAX_HOURS_UNTIL_SLEEPY = 16;
    c.SLEEP_RECOVERY_HOURS_UNTIL_SLEEPY_PER_HOUR = 3;
    c.SLEEPY_MULTIPLIER_FOR_ENERGY_USE = 1.5;
    c.MAX_ENERGY_WHEN_SLEEPY = .8;

    ////////////// constants around individuals

    c.GENDER_MALE = 0;
    c.GENDER_FEMALE = 1;
    c.GENDER_NAMES = [
        "male",
        "female"
    ];
    c.GENDER_PRONOUNS = [
        "he",
        "she"
    ];

    c.STR = 0;
    c.DEX = 1;
    c.INT = 2;
    c.WIS = 3;
    c.CHA = 4;
    c.ABILITY_SCORE_NAMES = [
        "Strength",
        "Dexterity",
        "Intelligence",
        "Wisdom",
        "Charisma"
    ];

    ///////////////////// Journal stuff

    c.JOURNAL_ENTRY_TYPE_RED_LETTER = 0;
    c.JOURNAL_ENTRY_TYPE_FOUND_FOOD = 1;
    c.JOURNAL_ENTRY_TYPE_ATE_MEAL = 2;
    c.JOURNAL_ENTRY_TYPE_SLEPT = 3;
    c.JOURNAL_ENTRY_TYPE_TRAVEL = 4;
    c.JOURNAL_ENTRY_TYPE_NAMES = [
        "red letter event!",
        "found food",
        "ate meal",
        "sleep",
        "travel"
    ];

    //////////////////// skill stuff

    c.SKILL_LEVEL_NONE = 0;
    c.SKILL_LEVEL_BEGINNER = 1;
    c.SKILL_LEVEL_AMATEUR = 2;
    c.SKILL_LEVEL_EXPERT = 3;
    c.SKILL_LEVEL_MASTER = 4;
    c.SKILL_LEVEL_GRANDMASTER = 5;
    c.SKILL_LEVEL_NAMES = [
        "none",
        "beginner",
        "amateur",
        "expert",
        "master",
        "grandmaster"
    ];

    //////////////////// gear

    c.ITEM_TYPE_SPECIAL = 0;
    c.ITEM_TYPE_FOOD = 1;
    c.ITEM_TYPE_WEAPON = 2;
    c.ITEM_TYPE_ARMOR = 3;
    c.ITEM_TYPE_EQUIPMENT = 4;
    c.ITEM_TYPE_TREASURE = 5;
    c.ITEM_TYPE_NAMES = [
        "special",
        "food",
        "weapon",
        "armor",
        "equipment",
        "treasure"
    ];

    c.ITEM_SIZE_TINY = 0; // a piece of paper, a goldBead
    c.ITEM_SIZE_IN_HAND = 1; // a pocketknife, a skipping stone
    c.ITEM_SIZE_TWO_HANDS = 2; // a loaf of bread, a sword
    c.ITEM_SIZE_TWO_ARMS = 3; // a watermelon, a backpack
    c.ITEM_SIZE_TWO_MEN = 4; // a large chest, a body, takes two men to carry it easily
    c.ITEM_SIZE_TEN_MEN = 5; // a large wagon, a horse
    c.ITEM_SIZE_HUNDRED_MEN = 6; // a building, a ship
    c.ITEM_SIZE_NAMES = [
        "tiny",
        "small",
        "handheld",
        "armheld",
        "large",
        "huge",
        "enormous"
    ];

    c.ITEM_QUALITY_POOR = 0; // poor design; barely functional, sloppily made.
    c.ITEM_QUALITY_OK = 1; // nothing special, should work. This is the most common.
    c.ITEM_QUALITY_SUPERIOR = 2; // extra effort was put into this. Looks nice in addition to working great.
    c.ITEM_QUALITY_MASTERPIECE = 3; // someone spent a great deal of time, effort, and money into this item.
    c.ITEM_QUALITY_NAMES = [
        "poor",
        "average",
        "superior",
        "masterpiece"
    ];
    c.ITEM_QUALITY_SKILL_MULTIPLIER = [
        0.9,
        1.0,
        1.15,
        1.5
    ];

    c.ITEM_CONDITION_NEW = 0;
    c.ITEM_CONDITION_USED = 1;
    c.ITEM_CONDITION_WORN = 2;
    c.ITEM_CONDITION_BROKEN = 3;
    c.ITEM_CONDITION_DESTROYED = 4;
    c.ITEM_CONDITION_NAMES = [
        "new",
        "used",
        "worn",
        "broken",
        "destroyed"
    ];
    c.ITEM_CONDITION_SKILL_MULTIPLIER = [
        1,
        .99,
        .85,
        0,
        0
    ];

    c.ARMOR_SLOT_HEAD = 0;
    c.ARMOR_SLOT_TORSO = 1;
    c.ARMOR_SLOT_ARMS = 2;
    c.ARMOR_SLOT_LEGS = 3;
    c.ARMOR_SLOT_FEET = 4;

    ///////////////// player and game defaults

    c.DUMB_LUCK_BASELINE = 0.25;

    //////////////////// UI elements

    c.TAB_INDEX_MAP = 0;
    c.TAB_INDEX_AREA = 1;
    c.TAB_INDEX_STATUS = 2;
    c.TAB_INDEX_CREW = 3;
    c.TAB_INDEX_INVENTORY = 4;
    c.TAB_INDEX_JOURNAL = 5;
    c.TAB_INDEX_SCORE = 6;
    c.TAB_INDEX_GAME = 7;
    c.TAB_INDEX_HELP = 8;

    //////////////////// handy functions

    c.rnd = function () {
        return Math.random();
    };

    c.getRandom = function (msg) {
        var r = c.rnd();
        c.db2("getRandom=" + r + " for: " + msg);
        return r;
    };

    c.determineRandomNumberInRange = function (min, max, msg) {
        var r = min + Math.floor(c.rnd() * Math.abs(max - min + 1));
        c.db2("getRandomInRange=" + r + " (between " + min + " and " + max + ") for: " + msg);
        return r;
    };

    c.checkRandom = function (chance, msg) {
        var r = c.rnd();
        var result = r <= chance;
            c.db2("checkRandom=" + (result ? "true" : "false") + " (needed " + chance + " got " + r + ") for: " + msg);
        return result;
    };

    c.chooseWeightedOption = function (randomNumber, options) {
        if (options.length === 0) {
            throw "No options to choose from!";
        }
        var sum = options.reduce(function(a, b) {
            return a + b[0];
        }, 0);
        var normalized = [];
        var accumulated = 0;
        for (i = 0; i < options.length; i++) {
            accumulated += (options[i][0] / sum);
            normalized.push([accumulated, options[i][1]]);
        }
        for (var i = 0; i < normalized.length; i++) {
            if (randomNumber < normalized[i][0]) {
                return normalized[i][1];
            }
        }
        return normalized[normalized.length - 1][1];
    };

    c.cloneArray = function (arrayOriginal) {
        return arrayOriginal.slice(0);
    };

    c.rgbToHex = function (color) {
        return "" + ((1 << 24) + (color[c.R] << 16) + (color[c.G] << 8) + color[c.B]).toString(16).slice(1);
    };

    c.formatFloat = function (number) {
        return Number(number.toFixed(2));
    };

    c.formatFloatSingleDecimal = function (number) {
        return Number(number.toFixed(1));
    };

    c.formatPercent = function (value) {
        var percentage = (Math.floor(value * 1000) / 10);
        var extraPointZero = Math.floor(percentage) === percentage ? ".0" : "";
        return "" + percentage + extraPointZero + "%";
    };

    c.angleOfLine = function (posA, posB) {
        // (this is in the first quadrant, unlike the canvasses, which are in the 4th.)
        var xDiff = posB[X] - posA[X];
        var yDiff = posA[Y] - posB[Y];
        var angle = Math.atan2(yDiff, xDiff);
        return angle < 0 ? angle + (2 * Math.PI) : angle;
    };

    c.areLocationsEquivalent = function (posA, posB) {
        return (posA[X] === posB[X]) && (posA[Y] === posB[Y]);
    };

    // this returns true if the locations are also the same
    c.areLocationsAdjacent = function (posA, posB) {
        return ((posB[X] - posA[X]) >= -1) && ((posB[X] - posA[X]) <= 1) && ((posB[Y] - posA[Y]) >= -1) && ((posB[Y] - posA[Y]) <= 1);
    };

    c.computeDistanceBetweenTwoPointsInMiles = function (pos1, pos2) {
        var deltaX = pos2[X] - pos1[X];
        var deltaY = pos2[Y] - pos1[Y];
        return Math.sqrt((deltaX * deltaX) + (deltaY * deltaY)) * c.MILES_PER_DETAIL_MAP_PIXEL;
    };

    c.determineDirectionByAngle = function (angle) {
        var angleBetweenEastAndNortheast = Math.PI / 4;
        var boundaryOffset = angleBetweenEastAndNortheast / 2;
        var currentMax = boundaryOffset;
        var directionCandidate = 0;
        while (angle > currentMax) {
            directionCandidate++;
            currentMax += angleBetweenEastAndNortheast
        }
        return directionCandidate % 8;
    };

    c._computeBlockCoordinatesFromMapCoordinates = function (mapCoordinates) {
        return [
            Math.floor(mapCoordinates[X] / c.BLOCK_SIZE[X]),
            Math.floor(mapCoordinates[Y] / c.BLOCK_SIZE[Y])];
    };

    c.convertBlockCoordinatesToKey = function (blockCoordinates) {
        return "" + blockCoordinates[X] + "," + blockCoordinates[Y];
    };

    //////////////////// time

    c.getDateDifferenceInYears = function (dateEarlier, dateLater) {
        return ~~((dateLater - dateEarlier) / c.NUM_MILLIS_PER_YEAR);
    };

    c.getDateDifferenceInDays = function (dateEarlier, dateLater) {
        var timeEarlier = new Date(dateEarlier.getFullYear(), dateEarlier.getMonth(), dateEarlier.getDate()).getTime();
        var timeLater = new Date(dateLater.getFullYear(), dateLater.getMonth(), dateLater.getDate()).getTime();
        return Math.floor(((timeLater - timeEarlier) / c.NUM_MILLIS_PER_DAY));
    };

    c.getDateDifferenceInSeconds = function (dateEarlier, dateLater) {
        var timeEarlier = new Date(dateEarlier.getFullYear(), dateEarlier.getMonth(), dateEarlier.getDate(), dateEarlier.getHours(), dateEarlier.getMinutes(), dateEarlier.getSeconds()).getTime();
        var timeLater = new Date(dateLater.getFullYear(), dateLater.getMonth(), dateLater.getDate(), dateLater.getHours(), dateLater.getMinutes(), dateLater.getSeconds()).getTime();
        return Math.floor(((timeLater - timeEarlier) / c.NUM_MILLIS_PER_SECOND));
    };

    c.determineRandomBirthdate = function (minAgeInYears, maxAgeInYears, currentDate) {
        var randomAge = c.determineRandomNumberInRange(minAgeInYears, maxAgeInYears, "random individual age");
        var millisOfBirthYear = new Date(currentDate.getFullYear() - randomAge, 0, 0, 0, 0, 0).getTime();
        var millisOfBirthMomentInYear = Math.floor(c.getRandom("birthdate") * (c.NUM_DAYS_PER_YEAR * c.NUM_MILLIS_PER_DAY)) + 1;
        return new Date(millisOfBirthYear + millisOfBirthMomentInYear);
    };

    c.formatDateForDisplay = function (date) {
        return "" + date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + (date.getDate());
    };

    c.formatDateForStatusDisplay = function (date) {
        return $.datepicker.formatDate('MM d, yy', date);
    };

    c.formatTimeForDisplay = function (date) {
        var time;
        var hours = date.getHours();
        if (hours === 0) {
            time = "midnight";
        } else if (hours === 12) {
            time = "noon";
        } else if (hours < 12) {
            time = hours + " AM";
        } else {
            time = (hours - 12) + " PM";
        }
        return time;
    };

    c.formatDateAndTimeForDisplay = function (date) {
        return c.formatDateForDisplay(date) + " " + c.formatTimeForDisplay(date);
    };

    c.cloneDate = function (date) {
        return new Date(date.getTime());
    };

    c.addHours = function (date, numHoursToAdd) {
        return new Date(date.getTime() +
            (numHoursToAdd * c.NUM_MINUTES_PER_HOUR * c.NUM_SECONDS_PER_MINUTE * c.NUM_MILLIS_PER_SECOND));
    };

    c.countHoursUntilDawn = function (date) {
        var currentHour = date.getHours();
        if (currentHour === c.DAWN_HOUR) {
            return 0;
        } else if (currentHour < c.DAWN_HOUR) {
            return c.DAWN_HOUR - currentHour;
        } else {
            return (c.NUM_HOURS_PER_DAY - currentHour) + c.DAWN_HOUR;
        }
    };

    c.determineSkyLightness = function (date) {
        var hour = date.getHours();
        if (hour === c.DAWN_HOUR) {
            return c.SKY_SUNRISE;
        }
        if (hour === c.DUSK_HOUR) {
            return c.SKY_SUNSET;
        }
        if (hour > c.DAWN_HOUR && hour < c.DUSK_HOUR) {
            return c.SKY_DAY;
        }
        return c.SKY_NIGHT;
    };

    c.isFullDaylight = function (date) {
        var hour = date.getHours();
        return hour > c.DAWN_HOUR && hour < c.DUSK_HOUR;
    };

    c.isFullNight = function (date) {
        var hour = date.getHours();
        return !(hour >= c.DAWN_HOUR && hour <= c.DUSK_HOUR);
    };

    c.isDayOrTwilight = function (date) {
        var hour = date.getHours();
        return hour >= c.DAWN_HOUR && hour <= c.DUSK_HOUR;
    };

    c.isNightOrTwilight = function (date) {
        var hour = date.getHours();
        return !(hour > c.DAWN_HOUR && hour < c.DUSK_HOUR);
    };

    c.isTwilight = function (date) {
        var hour = date.getHours();
        return (hour === c.DAWN_HOUR || hour === c.DUSK_HOUR);
    };

    c.isSunrise = function (date) {
        var hour = date.getHours();
        return hour === c.DAWN_HOUR;
    };

    c.isSunset = function (date) {
        var hour = date.getHours();
        return hour === c.DUSK_HOUR;
    };

    c.db = function (message) {
        if (c.DEBUG) {
            console.log(message);
        }
    };

    c.db2 = function (message) {
        if (c.DEBUG2) {
            console.log(message);
        }
    };

    return c;
});
