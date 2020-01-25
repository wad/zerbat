define([
    'app/constants',
    'app/gameContext',
    'app/world',
    'app/places',
    'app/crew',
    'app/map',
    'app/gear',
    'app/status',
    'app/gui'], function (c, gx, World, Places, Crew, Map, Gear, Status, Gui) {

    var Travel = {};

    Travel.isDirectionDiagonal = function (direction) {
        return direction === c.NW || direction === c.NE || direction === c.SW || direction === c.SE;
    };

    Travel.getActivityLevelByTravelMode = function (travelMode) {
        var activityLevel = c.ACTIVITY_LEVEL_SLOW_WALKING;
        switch (travelMode) {
            case c.TRAVEL_MODE_WALKING_SLOW:
                activityLevel = c.ACTIVITY_LEVEL_SLOW_WALKING;
                break;
            case c.TRAVEL_MODE_WALKING_FAST:
            case c.TRAVEL_MODE_RIDING:
            case c.TRAVEL_MODE_FLYING:
                activityLevel = c.ACTIVITY_LEVEL_BRISK_WALKING;
                break;
            case c.TRAVEL_MODE_RUNNING:
                activityLevel = c.ACTIVITY_LEVEL_RUNNING;
                break;
            default:
                throw "unknown travel mode: " + travelMode;
        }
        return activityLevel;
    };

    Travel.calculateEncumbranceMultiplier = function (crew, gear) {

        // Get a clone of the backpacks in the gear, ordered by preferred-first
        // quantities will be deducted from this list to compute the carrying capacity
        var backPacksOnly = gear.filter(function (item) {
            return item.itemType === Gear.GearSet.backpack;
        });
        backPacksOnly.sort(function (itemA, itemB) {
            if (itemA.quality === itemB.quality) {
                return itemA.condition <= itemB.condition;
            } else {
                return itemA.quality <= itemB.quality;
            }
        });
        var backPacks = Gear.clone(backPacksOnly);

        var totalCarryingCapacity = 0;
        crew.forEach(function (crewMember) {
            totalCarryingCapacity += crewMember.getCarryingCapacity(backPacks);
        });

        var totalWeight = Gear.computeWeightCarried(gear);

        if (totalWeight <= totalCarryingCapacity) {
            return 1;
        } else {
            return totalCarryingCapacity / totalWeight;
        }
    };

    Travel.isTerrainTypeRough = function (terrainType) {
        switch (terrainType) {
            case c.TERRAIN_TYPE_AGRICULTURAL:
            case c.TERRAIN_TYPE_PLAIN:
            case c.TERRAIN_TYPE_DESERT:
            case c.TERRAIN_TYPE_TOWN:
                return false;
            case c.TERRAIN_TYPE_UNKNOWN:
            case c.TERRAIN_TYPE_SHORE:
            case c.TERRAIN_TYPE_OCEAN:
            case c.TERRAIN_TYPE_MTN_OVER_PLAINS:
            case c.TERRAIN_TYPE_MTN_OVER_PINE:
            case c.TERRAIN_TYPE_MTN_OVER_JUNGLE:
            case c.TERRAIN_TYPE_MTN_OVER_DESERT:
            case c.TERRAIN_TYPE_PINE_FOREST:
            case c.TERRAIN_TYPE_LAKE:
            case c.TERRAIN_TYPE_RIVER:
            case c.TERRAIN_TYPE_JUNGLE:
            case c.TERRAIN_TYPE_IMPASSABLE_CLIFFS:
            case c.TERRAIN_TYPE_CLIFFS:
            case c.TERRAIN_TYPE_SWAMP:
            case c.TERRAIN_TYPE_LAVAFLOW:
            case c.TERRAIN_TYPE_LAVA:
                return true;
            default:
                throw "unknown terrain type: " + terrainType;
        }
    };

    Travel.lookupDirectionByDirectionDelta = function (directionDelta) {
        return c.DIRECTION_SYMBOLS.indexOf(["N", "", "S"][directionDelta[Y] + 1] + ["W", "", "E"][directionDelta[X] + 1]);
    };

    // If there is noplace to go, this will return null.
    Travel.determineDirectionOfNextStep = function (curPos, destPos, locationsAlreadyVisited, crew, gear) {

        // this return null if the player could travel there, or a string message explaining why not.
        var getMessageIfCannotCrossTerrain = function (destinationTerrainType, playerCrew, playerGear) {

            function canTravelOverWater(playerCrew, playerGear) {
                return Gear.countLikeItems(playerGear, Gear.GearSet.bootsOfWaterWalking) >= Crew.getCrewSize(playerCrew);
            }

            function canTravelOverCliffs(playerCrew, playerGear) {
                // todo: check inventory for climbing gear
                return false;
            }

            switch (destinationTerrainType) {
                case c.TERRAIN_TYPE_UNKNOWN:
                    return "Cannot travel into unknown terrain";
                case c.TERRAIN_TYPE_IMPASSABLE_CLIFFS:
                    return "There are very steep cliffs in that direction, you cannot climb them.";
                case c.TERRAIN_TYPE_OCEAN:
                    if (!canTravelOverWater(playerCrew, playerGear)) {
                        return "You currently don't have the ability to travel on the ocean.";
                    } else {
                        return null;
                    }
                case c.TERRAIN_TYPE_LAKE:
                    if (!canTravelOverWater(playerCrew, playerGear)) {
                        return "You currently don't have the ability to travel on the lake.";
                    } else {
                        return null;
                    }
                case c.TERRAIN_TYPE_CLIFFS:
                    if (!canTravelOverCliffs(playerCrew, playerGear)) {
                        return "You currently don't have the ability to scale cliffs.";
                    } else {
                        return null;
                    }
                case c.TERRAIN_TYPE_LAVA:
                    if (!canTravelOverCliffs(playerCrew, playerGear)) {
                        return "You currently don't have the ability to travel over lava.";
                    } else {
                        return null;
                    }
                case c.TERRAIN_TYPE_SHORE:
                case c.TERRAIN_TYPE_MTN_OVER_PLAINS:
                case c.TERRAIN_TYPE_MTN_OVER_PINE:
                case c.TERRAIN_TYPE_MTN_OVER_JUNGLE:
                case c.TERRAIN_TYPE_MTN_OVER_DESERT:
                case c.TERRAIN_TYPE_PINE_FOREST:
                case c.TERRAIN_TYPE_RIVER:
                case c.TERRAIN_TYPE_JUNGLE:
                case c.TERRAIN_TYPE_SWAMP:
                case c.TERRAIN_TYPE_LAVAFLOW:
                case c.TERRAIN_TYPE_DESERT:
                case c.TERRAIN_TYPE_TOWN:
                case c.TERRAIN_TYPE_AGRICULTURAL:
                case c.TERRAIN_TYPE_PLAIN:
                    return null;
                default:
                    throw "Unexpected terrain type: " + destinationTerrainType;
            }
        };

        var computeDifferenceBetweenTwoAngles = function (angleA, angleB) {
            return Math.abs(angleA - angleB);
        };

        var angleToDestination = c.angleOfLine(curPos, destPos);

        var candidateDirectionsWithDeviationFromTarget = [
            [c.E, computeDifferenceBetweenTwoAngles(c.DIRECTION_ANGLES[c.E], angleToDestination)],
            [c.NE, computeDifferenceBetweenTwoAngles(c.DIRECTION_ANGLES[c.NE], angleToDestination)],
            [c.N, computeDifferenceBetweenTwoAngles(c.DIRECTION_ANGLES[c.N], angleToDestination)],
            [c.NW, computeDifferenceBetweenTwoAngles(c.DIRECTION_ANGLES[c.NW], angleToDestination)],
            [c.W, computeDifferenceBetweenTwoAngles(c.DIRECTION_ANGLES[c.W], angleToDestination)],
            [c.SW, computeDifferenceBetweenTwoAngles(c.DIRECTION_ANGLES[c.SW], angleToDestination)],
            [c.S, computeDifferenceBetweenTwoAngles(c.DIRECTION_ANGLES[c.S], angleToDestination)],
            [c.SE, computeDifferenceBetweenTwoAngles(c.DIRECTION_ANGLES[c.SE], angleToDestination)]
        ];

        // filter out directions that don't work
        var filteredCandidates = candidateDirectionsWithDeviationFromTarget.filter(function (option) {
            var newLoc = [
                curPos[X] + c.DIRECTION_DELTAS[option[0]][X],
                curPos[Y] + c.DIRECTION_DELTAS[option[0]][Y]
            ];

            // remove directions that go off the map
            if (newLoc[X] < 0 || newLoc[Y] < 0 ||
                newLoc[X] >= c.MAP_DETAIL_SIZE_IN_PIXELS[X] || newLoc[Y] >= c.MAP_DETAIL_SIZE_IN_PIXELS[Y]) {
                return false;
            }

            // remove directions that have already been visited in a previous step
            var alreadyVisited = false;
            locationsAlreadyVisited.some(function (prevLoc) {
                if (c.areLocationsEquivalent(newLoc, prevLoc)) {
                    alreadyVisited = true;
                    return true;
                }
                return false;
            });
            if (alreadyVisited) {
                return false;
            }

            // remove directions with a terrain type that cannot be traveled to
            var nextStepTerrainType = Map.identifyTerrainType(newLoc);
            var travelPreventedMessage = getMessageIfCannotCrossTerrain(nextStepTerrainType, crew, gear);
            if (travelPreventedMessage != null) {
                return false;
            }

            return true;
        });

        if (filteredCandidates.length === 0) {
            return null;
        }

        filteredCandidates.sort(function (itemA, itemB) {
            return itemA[1] - itemB[1];
        });

        // the first one is the most direct option available, return it
        return filteredCandidates[0][0];
    };

    Travel.travelToLocation = function (destinationLocation, spendHourAsEntireCrew, discoverPlaces) {

        var determineTravelSpeedForSingleStep = function (travelMode, isRough, isFullNight, isWeatherClear, isWeatherStormy) {
            var milesPerHour;
            switch (travelMode) {
                case c.TRAVEL_MODE_WALKING_SLOW:
                    milesPerHour = isRough ? 1.5 : 2.5;
                    if (isFullNight && !isWeatherClear) {
                        milesPerHour *= .8;
                    }
                    milesPerHour *= (isWeatherStormy ? .9 : 1);
                    break;
                case c.TRAVEL_MODE_WALKING_FAST:
                    milesPerHour = isRough ? 3 : 5;
                    if (isFullNight) {
                        milesPerHour *= (isWeatherClear ? .8 : .5);
                    }
                    milesPerHour *= (isWeatherStormy ? .9 : 1);
                    break;
                case c.TRAVEL_MODE_RUNNING:
                    milesPerHour = isRough ? 5.5 : 10;
                    if (isFullNight) {
                        milesPerHour *= (isWeatherClear ? .6 : .35);
                    }
                    milesPerHour *= (isWeatherStormy ? .8 : 1);
                    break;
                case c.TRAVEL_MODE_RIDING:
                    milesPerHour = isRough ? 6 : 15;
                    if (isFullNight) {
                        milesPerHour *= (isWeatherClear ? .5 : .3);
                    }
                    milesPerHour *= (isWeatherStormy ? .75 : 1);
                    break;
                case c.TRAVEL_MODE_FLYING:
                    milesPerHour = 20;
                    milesPerHour *= (isWeatherStormy ? .5 : 1);
                    break;
                default:
                    throw "Unhandled case for selected mode of travel: " + gx.gs.playerTravelMode;
            }
            milesPerHour *= Travel.calculateEncumbranceMultiplier(gx.gs.playerCrew, gx.gs.playerGear);
            return milesPerHour;
        };

        var isFullNight = c.isFullNight(gx.gs.currentDate);
        var isWeatherClear = gx.gs.currentWeather.weatherType === c.WEATHER_CLEAR;
        var isWeatherStormy = gx.gs.currentWeather.weatherType === c.WEATHER_STORMY;
        var initialLocation = [gx.gs.playerLocation[X], gx.gs.playerLocation[Y]];
        var currentStepLocation = [gx.gs.playerLocation[X], gx.gs.playerLocation[Y]];
        var activityLevel = Travel.getActivityLevelByTravelMode(gx.gs.playerTravelMode);

        if (Crew.hasEnoughEnergyForTask(gx.gs.playerCrew, activityLevel)) {
            var hoursElapsed = 0;
            var blocked = false;
            var arrived = false;
            var locationsAlreadyTraveledThisHour = [];
            var terrainTypePath = "";
            var numStepsMoved = 0;
            var speeds = [];
            var distanceTraveled = 0;
            var discoveries = [];
            while (hoursElapsed <= 1 && !blocked && !arrived) {
                arrived = c.areLocationsEquivalent(currentStepLocation, destinationLocation);
                if (!arrived) {
                    var direction = Travel.determineDirectionOfNextStep(
                        currentStepLocation,
                        destinationLocation,
                        locationsAlreadyTraveledThisHour,
                        gx.gs.playerCrew,
                        gx.gs.playerGear);

                    blocked = direction === null;
                    if (!blocked) {
                        currentStepLocation[X] += c.DIRECTION_DELTAS[direction][X];
                        currentStepLocation[Y] += c.DIRECTION_DELTAS[direction][Y];
                        numStepsMoved++;
                        locationsAlreadyTraveledThisHour.push([currentStepLocation[X], currentStepLocation[Y]]);
                        var newTerrainType = Map.identifyTerrainType(currentStepLocation);
                        terrainTypePath += c.TERRAIN_TYPE_SYMBOLS[newTerrainType];
                        var isRough = Travel.isTerrainTypeRough(newTerrainType);
                        var milesPerHour = determineTravelSpeedForSingleStep(
                            gx.gs.playerTravelMode,
                            isRough,
                            isFullNight,
                            isWeatherClear,
                            isWeatherStormy);
                        var distance = (Travel.isDirectionDiagonal(direction) ? 1.4142 : 1) * c.MILES_PER_DETAIL_MAP_PIXEL;
                        hoursElapsed += distance / milesPerHour;
                        speeds.push(milesPerHour);
                        distanceTraveled += distance;
                        var listOfDiscoveries = discoverPlaces(false, false);
                        listOfDiscoveries.forEach(function(discovery) {
                            discoveries.push(discovery);
                        });
                    }
                } else {
                    c.db("Arrived!");
                }
            }

            if (numStepsMoved === 0) {
                if (!arrived) {
                    if (blocked) {
                        Gui.showMessage("You could not make any progress in that direction, because something was blocking you.");
                    } else {
                        Gui.showMessage("You were not able to make any progress in that direction.");
                    }
                }
            } else {
                gx.gs.playerLocation = [currentStepLocation[X], currentStepLocation[Y]];
                World.populatePlantsAndAnimalsForNewLocation(Map.identifyTerrainType(gx.gs.playerLocation));
                spendHourAsEntireCrew(activityLevel);
                gx.gs.placesAtCurrentLocation = Places.getKnownPlacesAtThisLocation(gx.gs.blocks, gx.gs.playerLocation);

                var sumSpeeds = 0;
                for (var i = 0; i < speeds.length; i++) {
                    sumSpeeds += speeds[i];
                }
                var averageSpeed = sumSpeeds / speeds.length;
                var blockedMessage = blocked ? "You reached a point where you couldn't make any more progress in that direction. " : "";
                Gui.showMessage(
                    "You traveled " + c.formatFloat(distanceTraveled) +
                        " miles " + c.DIRECTION_NAMES[c.determineDirectionByAngle(c.angleOfLine(initialLocation, gx.gs.playerLocation))] +
                        " at " + c.formatFloat(averageSpeed) + " miles per hour. " +
                        blockedMessage +
                        gx.gs.descriptionOfCurrentLocation);

                discoveries.forEach(function (place) {
                    Gui.showMessage(Places.getNoticeMessage(gx.gs.playerLocation, place));
                });

                if (gx.gs.placesAtCurrentLocation.length > 0) {
                    Gui.showMessageDialog(
                        "Click the <em>area</em> tab to check it out.",
                        "There is something here.",
                        400);
                }

                Map.refreshMap();
                Status.updateStatus();
            }
        } else {
            Gui.showMessage("You need to rest or sleep first.");
        }
    };

    Travel.clickButtonTravelMode = function () {

        var f = function (i) {
            return gx.gs.playerTravelMode === i ? ' checked="checked"' : '';
        };

        var rideEnabled = Gear.canRide(gx.gs.playerCrew, gx.gs.playerGear) ? "" : 'disabled="disabled" ';
        var flyEnabled = Gear.canFly(gx.gs.playerCrew, gx.gs.playerGear) ? "" : 'disabled="disabled" ';

        var dialogIdTravelMode = gx.getNewUniqueId();
        var dialogHtml = [
            '<div id="' + dialogIdTravelMode + '">',
            '<form><div id="dialogRadio">',
            '<input type="radio" id="radio0" name="radio" ' + f(c.TRAVEL_MODE_WALKING_SLOW) + '/><label for="radio0">slow walk</label>',
            '<input type="radio" id="radio1" name="radio" ' + f(c.TRAVEL_MODE_WALKING_FAST) + '/><label for="radio1">fast walk</label>',
            '<input type="radio" id="radio2" name="radio" ' + f(c.TRAVEL_MODE_RUNNING) + '/><label for="radio2">run</label>',
            '<input type="radio" id="radio3" ' + rideEnabled + 'name="radio" ' + f(c.TRAVEL_MODE_RIDING) + '/><label for="radio3">ride</label>',
            '<input type="radio" id="radio4" ' + flyEnabled + 'name="radio" ' + f(c.TRAVEL_MODE_FLYING) + '/><label for="radio4">fly</label>',
            '</div></form></div>'
        ].join("\n");
        $("#zGameArea").append(dialogHtml);
        $("#dialogRadio").buttonset();
        $("#" + dialogIdTravelMode).dialog({
            modal: true,
            width: "50%",
            title: "Choose how you will be traveling",
            buttons: [
                {
                    text: "Ok",
                    click: function () {
                        for (var i = 0; i < c.TRAVEL_MODE_NAMES.length; i++) {
                            if ($("#radio" + i).prop('checked')) {
                                gx.gs.playerTravelMode = i;
                                break;
                            }
                        }
                        $(this).dialog("close");
                        $("#" + dialogIdTravelMode).remove();
                        Status.updateStatus();
                    }
                }
            ]
        });
    };

    return Travel;
});
