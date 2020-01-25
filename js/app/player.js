define([
    'app/constants',
    'app/zerbatConstants',
    'app/gameContext',
    'app/places',
    'app/individuals',
    'app/skills',
    'app/map',
    'app/gui',
    'app/status',
    'app/journal',
    'app/world',
    'app/crew',
    'app/gear',
    'app/travel'], function (c, zc, gx, Places, Individuals, Skills, Map, Gui, Status, Journal, World, Crew, Gear, Travel) {

    var Player = {};

    Player.clickButtonRest = function () {
        Player.spendHourAsEntireCrew(c.ACTIVITY_LEVEL_RESTING);
        Gui.showMessage("You sit and rest for an hour. " + gx.gs.descriptionOfCurrentLocation);
    };

    Player.clickButtonSleep = function () {
        var dialogIdSleep = gx.getNewUniqueId();
        var dialogHtml = [
            '<div id="' + dialogIdSleep + '">',
            '<form><div id="dialogRadio">',
            '<input type="radio" id="radioTillMorning" name="radio" checked="checked"/><label for="radioTillMorning">until morning</label>',
            '<input type="radio" id="radio4" name="radio" /><label for="radio4">4 hours</label>',
            '<input type="radio" id="radio8" name="radio" /><label for="radio8">8 hours</label>',
            '</div></form></div>'
        ].join("\n");
        $("#zGameArea").append(dialogHtml);
        $("#dialogRadio").buttonset();
        $("#" + dialogIdSleep).dialog({
            modal: true,
            width: "50%",
            title: "How long do you want to sleep?",
            buttons: [
                {
                    text: "Ok",
                    click: function () {
                        var sleepHours = 0;
                        if ($("#radioTillMorning").prop('checked')) {
                            sleepHours = c.countHoursUntilDawn(gx.gs.currentDate);
                            if (sleepHours === 0) {
                                sleepHours = 24;
                            }
                        } else if ($("#radio4").prop('checked')) {
                            sleepHours = 4;
                        } else if ($("#radio8").prop('checked')) {
                            sleepHours = 8;
                        } else {
                            throw "Unsupported radio button clicked";
                        }

                        for (var i = 0; i < sleepHours; i++) {
                            Player.spendHourAsEntireCrew(c.ACTIVITY_LEVEL_SLEEPING);
                        }
                        $(this).dialog("close");
                        $("#" + dialogIdSleep).remove();
                        Status.updateStatus();
                        Gui.showMessage("You got some sleep, and feel rested. " + gx.gs.descriptionOfCurrentLocation);
                        Player.eatIfHungry();
                    }
                }
            ]
        });
    };

    Player.clickButtonSeekFood = function () {

        var huntingEnergyRequired = c.ACTIVITY_LEVEL_BRISK_WALKING;
        var foragingEnergyRequired = c.ACTIVITY_LEVEL_SLOW_WALKING;

        var playerKnowsNoForagingHere = gx.gs.foodPlantPresenceInAreaKnown && gx.gs.foodPlantPresenceAreaStatus === c.FOOD_PRESENCE_IN_AREA_NONE;
        var playerKnowsNoHuntingHere = gx.gs.foodAnimalPresenceInAreaKnown && gx.gs.foodAnimalPresenceAreaStatus === c.FOOD_PRESENCE_IN_AREA_NONE;
        var forageIsHere = gx.gs.foodPlantPresenceAreaStatus === c.FOOD_PRESENCE_IN_AREA_SOME;
        var gameIsHere = gx.gs.foodAnimalPresenceAreaStatus === c.FOOD_PRESENCE_IN_AREA_SOME;

        var numForagers = 0;
        var numSuccessfulForagers = 0;
        var numHunters = 0;
        var numSuccessfulHunters = 0;

        if (playerKnowsNoForagingHere && playerKnowsNoHuntingHere) {
            Gui.showMessage("There is no food to be found here. Better try somewhere else.");
        } else if (c.isFullNight(gx.gs.currentDate)) {
            Gui.showMessage("It's too dark to hunt or forage for food.");
        } else if (gx.gs.currentWeather === c.WEATHER_STORMY) {
            Gui.showMessage("It's too stormy to hunt or forage for food.");
        } else {
            var terrainTypeId = Map.identifyTerrainType(gx.gs.playerLocation);

            // Items are not removed from this list, only quantities are decremented as they are picked up by hunters
            var huntingGear = Gear.clone(gx.gs.playerGear.filter(function (item) {
                    return item.itemInfo.isGoodForHunting;
                })).sort(function (a, b) {
                    return b.itemTypeSpecific.usefulnessForHunting - a.itemTypeSpecific.usefulnessForHunting;
                });

            var allFoodFound = [];

            var crewSortedByHuntOrForageSkillLevel = Crew.sortByHuntAndForageSkill(gx.gs.playerCrew);
            crewSortedByHuntOrForageSkillLevel.forEach(function (crewMember) {
                var hasEnoughEnergyToHunt = crewMember.canSpendPhysicalEnergyForOneHour(huntingEnergyRequired);
                var hasEnoughEnergyToForage = crewMember.canSpendPhysicalEnergyForOneHour(foragingEnergyRequired);
                if (hasEnoughEnergyToHunt || hasEnoughEnergyToForage) {
                    var resultOfDecidingHowToFindFood = Crew.decideHowToFindFood(crewMember, huntingGear, hasEnoughEnergyToHunt, playerKnowsNoForagingHere, playerKnowsNoHuntingHere);
                    if (resultOfDecidingHowToFindFood.shouldDoNothing) {
                        Player.spendHourIndividuallyPart1(crewMember, c.ACTIVITY_LEVEL_RESTING);
                        Gui.showMessage(crewMember.individualName + " didn't have enough energy to hunt, knew there wasn't forage here, so rested instead.");
                    } else {
                        if (resultOfDecidingHowToFindFood.isHunting) {

                            // hunting
                            numHunters++;
                            Player.spendHourIndividuallyPart1(crewMember, c.ACTIVITY_LEVEL_BRISK_WALKING);

                            // hunting with an item
                            huntingGear[resultOfDecidingHowToFindFood.selectedGearItemIndex].quantity--;

                            Player.practiceSkill(crewMember, resultOfDecidingHowToFindFood.selectedGearItemSkillType);

                            var huntingSkillRatingWithItem = resultOfDecidingHowToFindFood.skillRating;
                            var itemUsedForHunting = huntingGear[resultOfDecidingHowToFindFood.selectedGearItemIndex];
                            var itemDesc = itemUsedForHunting.itemInfo.itemName + " (quality " +
                                c.ITEM_QUALITY_NAMES[itemUsedForHunting.quality] + ", condition " +
                                c.ITEM_CONDITION_NAMES[itemUsedForHunting.condition] + ")";

                            if (c.checkRandom(huntingSkillRatingWithItem + c.DUMB_LUCK_BASELINE, "hunting with an item") && gameIsHere) {
                                var foodFoundByHunting = Gear.huntingResult(terrainTypeId, itemUsedForHunting);
                                var foodFoundHuntingDescription = Player.describeFoodFound([foodFoundByHunting]);
                                allFoodFound.push(foodFoundByHunting);
                                Gui.showMessage(crewMember.individualName +
                                    " hunted for food (skill " + c.formatPercent(huntingSkillRatingWithItem) +
                                    ") with a " + itemDesc + ", and found: " + foodFoundHuntingDescription);
                                numSuccessfulHunters++;
                            } else {
                                Gui.showMessage(crewMember.individualName +
                                    " hunted for food (skill " + c.formatPercent(huntingSkillRatingWithItem) +
                                    ") with a " + itemDesc + ", but failed to get anything.");
                            }
                            Player.practiceSkill(crewMember, Skills.SkillSet.hunting);
                        } else {

                            // foraging
                            numForagers++;
                            Player.spendHourIndividuallyPart1(crewMember, c.ACTIVITY_LEVEL_SLOW_WALKING);
                            var forageSkillRating = crewMember.getSkillRating(Skills.SkillSet.foraging);
                            if (c.checkRandom(forageSkillRating + c.DUMB_LUCK_BASELINE, "foraging") && forageIsHere) {
                                var foodFoundByForaging = Gear.foragingResult(terrainTypeId);
                                var foodFoundByForagingDescription = Player.describeFoodFound([foodFoundByForaging]);
                                allFoodFound.push(foodFoundByForaging);
                                numSuccessfulForagers++;
                                Gui.showMessage(crewMember.individualName +
                                    " foraged for food (skill " + c.formatPercent(forageSkillRating) +
                                    "), and found: " + foodFoundByForagingDescription);
                            } else {
                                Gui.showMessage(crewMember.individualName +
                                    " foraged for food (skill " + c.formatPercent(forageSkillRating) +
                                    "), but didn't find anything worth harvesting.");
                            }
                            Player.practiceSkill(crewMember, Skills.SkillSet.foraging);
                        }
                    }
                } else {
                    Player.spendHourIndividuallyPart1(crewMember, c.ACTIVITY_LEVEL_RESTING);
                    Gui.showMessage(crewMember.individualName + " didn't have enough energy to seek food, and wound up resting instead.");
                }
            });

            if (gx.gs.foodPlantPresenceAreaStatus === c.FOOD_PRESENCE_IN_AREA_SOME) {
                if (numSuccessfulForagers > 0) {
                    gx.gs.foodPlantPresenceInAreaKnown = true;
                    if (c.checkRandom(0.5, "chance that there is no more food here after successful foraging")) {
                        gx.gs.foodPlantPresenceAreaStatus = c.FOOD_PRESENCE_IN_AREA_NONE;
                    }
                    if (gx.gs.foodPlantPresenceAreaStatus === c.FOOD_PRESENCE_IN_AREA_NONE) {
                        Gui.showMessage("The foragers determine that there is no more food here to harvest right now.");
                    }
                } else if (numForagers > 0) {
                    // people foraged, but nobody found food
                    if (!gx.gs.foodPlantPresenceInAreaKnown) {
                        if (c.checkRandom(0.45, "chance of learning whether area has food (plants)")) {
                            gx.gs.foodPlantPresenceInAreaKnown = true;
                            if (gx.gs.foodPlantPresenceAreaStatus === c.FOOD_PRESENCE_IN_AREA_NONE) {
                                Gui.showMessage("The foragers determine that there is no food here to harvest right now.");
                            }
                        }
                    }
                }
            } else {
                if (numForagers > 0) {
                    if (!gx.gs.foodPlantPresenceInAreaKnown) {
                        if (c.checkRandom(0.45, "chance of learning whether area has food (plants)")) {
                            gx.gs.foodPlantPresenceInAreaKnown = true;
                            if (gx.gs.foodPlantPresenceAreaStatus === c.FOOD_PRESENCE_IN_AREA_NONE) {
                                Gui.showMessage("The foragers determine that there is no food here to harvest right now.");
                            }
                        }
                    }
                }
            }

            if (gx.gs.foodAnimalPresenceAreaStatus === c.FOOD_PRESENCE_IN_AREA_SOME) {
                if (numSuccessfulHunters > 0) {
                    gx.gs.foodAnimalPresenceInAreaKnown = true;
                    if (c.checkRandom(0.5, "chance that there is no more food here after successful hunting")) {
                        gx.gs.foodAnimalPresenceAreaStatus = c.FOOD_PRESENCE_IN_AREA_NONE;
                    }
                    if (gx.gs.foodAnimalPresenceAreaStatus === c.FOOD_PRESENCE_IN_AREA_NONE) {
                        Gui.showMessage("The hunters determine that there is no more game here right now.");
                    }
                } else if (numHunters > 0) {
                    // people hunted, but nobody found food
                    if (!gx.gs.foodAnimalPresenceInAreaKnown) {
                        if (c.checkRandom(0.35, "chance of learning whether area has food (animals)")) {
                            gx.gs.foodAnimalPresenceInAreaKnown = true;
                            if (gx.gs.foodAnimalPresenceAreaStatus === c.FOOD_PRESENCE_IN_AREA_NONE) {
                                Gui.showMessage("The hunters determine that there is no game here right now.");
                            }
                        }
                    }
                }
            } else {
                if (numHunters > 0) {
                    if (!gx.gs.foodAnimalPresenceInAreaKnown) {
                        if (c.checkRandom(0.35, "chance of learning whether area has food (animals)")) {
                            gx.gs.foodAnimalPresenceInAreaKnown = true;
                            if (gx.gs.foodAnimalPresenceAreaStatus === c.FOOD_PRESENCE_IN_AREA_NONE) {
                                Gui.showMessage("The hunters determine that there is no food here to hunt right now.");
                            }
                        }
                    }
                }
            }

            if (allFoodFound.length > 0) {
                var foodFoundDescription = Player.describeFoodFound(allFoodFound);
                gx.gs.playerGear = Gear.combineGear(gx.gs.playerGear, allFoodFound, gx.gs.currentDate);
                Journal.addEntry(gx.gs.journal, new Journal.Entry(
                    "found some food: " + foodFoundDescription,
                    c.JOURNAL_ENTRY_TYPE_FOUND_FOOD,
                    foodFoundDescription));
            }
            Player.spendHourIndividuallyPart2(true);
        }
    };

    Player.describeFoodFound = function (foodFound) {
        return foodFound.map(function (item) {
            return [
                item.quantity,
                item.itemInfo.itemName,
                "(" + item.itemInfo.description + ",",
                c.ITEM_QUALITY_NAMES[item.quality] + " quality,",
                item.itemTypeSpecific.numPortions,
                "portions each, will spoil in",
                item.itemInfo.daysUntilExpires,
                "days)"].join(" ");
        }).join(", ");
    };

    // returns a value between .75 (ability score is really bad, makes it hard to do stuff) and 1.25 (really good)
    Player.computeAbilityScoreInfluenceFactor = function (abilityScore) {
        return .5 + (abilityScore / 2);
    };

    Player.practiceSkill = function (crewMember, skillType) {
        var didLevelUp = crewMember.getSkill(skillType).practiceForOneHour();
        if (didLevelUp) {
            Gui.showMessage(crewMember.individualName + " is now better at " + skillType.skillName + "!");
        }
    };

    Player.clickButtonTrain = function () {
        // todo
        Gui.showMessage("You don't have a trainer available.");
    };

    Player.discoverPlaces = function (isSearching, isDistracted) {
        var discoveries = [];
        var nearbyPlaces = Places.getNearbyPlaces(gx.gs.blocks, gx.gs.playerLocation);
        nearbyPlaces.forEach(function (place) {
            if (!place.isOnPlayerCharactersMap) {
                gx.gs.playerCrew.forEach(function (crewMember) {
                    var chanceOfDiscovery = Places.computeChanceOfDiscovery(
                        place.visibility,
                        Map.identifyTerrainType(place.coordinates),
                        c.computeDistanceBetweenTwoPointsInMiles(gx.gs.playerLocation, place.coordinates),
                        isSearching,
                        isDistracted,
                        gx.gs.currentWeather,
                        gx.gs.currentDate,
                        crewMember.abilityScores[c.WIS],
                        crewMember.abilityScores[c.INT]);
                    if (c.checkRandom(chanceOfDiscovery, crewMember.individualName + " discovering place " + place.placeName)) {
                        place.isOnPlayerCharactersMap = true;
                        discoveries.push(place);
                    }
                });
            }
        });
        discoveries.forEach(function (discoveredPlace) {
            if (c.areLocationsEquivalent(discoveredPlace.coordinates, gx.gs.playerLocation)) {
                gx.gs.placesAtCurrentLocation.push(discoveredPlace);
            }
        });
        return discoveries;
    };

    Player.clickButtonChooseDestination = function () {

        var constructPlaceButtonId = function (place) {
            return "radio_" + place.placeId + "_" + place.coordinates[X] + "_" + place.coordinates[Y];
        };

        var getCoordinatesFromPlaceButtonId = function (placeButtonId) {
            var pieces = placeButtonId.split("_");
            return [parseInt(pieces[2]), parseInt(pieces[3])];
        };

        var nearbyKnownPlaces = Places.getNearbyPlaces(gx.gs.blocks, gx.gs.playerLocation).filter(function (place) {
            return place.isOnPlayerCharactersMap;
        });
        var placeListHtml = nearbyKnownPlaces.map(function (place) {
            if (c.areLocationsEquivalent(gx.gs.playerLocation, place.coordinates)) {
                return "";
            }
            var distance = c.computeDistanceBetweenTwoPointsInMiles(gx.gs.playerLocation, place.coordinates);
            var direction = c.determineDirectionByAngle(c.angleOfLine(gx.gs.playerLocation, place.coordinates));
            var directionName = c.DIRECTION_NAMES[direction];
            var placeButtonId = constructPlaceButtonId(place);
            return [
                '<li>',
                '<input type="radio" id="',
                placeButtonId,
                '" name="radio" />',
                '<label for="',
                placeButtonId,
                '">',
                place.placeName,
                '</label> &nbsp; is ',
                c.formatFloatSingleDecimal(distance),
                ' miles to the ',
                directionName
            ].join("");
        }).join("\n");

        var placeButtonIds = nearbyKnownPlaces.map(function (place) {
            return constructPlaceButtonId(place);
        });

        var dialogIdChooseDestination = gx.getNewUniqueId();
        var dialogHtml = [
            '<div id="' + dialogIdChooseDestination + '">',
            '<form><div id="dialogRadio">',
            '<ul class="zDestinations">',
            placeListHtml,
            '</ul>',
            '</div></form></div>'
        ].join("\n");
        $("#zGameArea").append(dialogHtml);
        $("#dialogRadio").buttonset();
        $("#" + dialogIdChooseDestination).dialog({
            modal: true,
            width: "50%",
            title: "Go towards which destination?",
            buttons: [
                {
                    text: "Ok",
                    click: function () {

                        var destinationCoordinates = null;
                        placeButtonIds.forEach(function (placeButtonId) {
                            if ($("#" + placeButtonId).prop('checked')) {
                                destinationCoordinates = getCoordinatesFromPlaceButtonId(placeButtonId);
                            }
                        });

                        $(this).dialog("close");
                        $("#" + dialogIdChooseDestination).remove();
                        if (destinationCoordinates != null) {
                            Travel.travelToLocation(destinationCoordinates, Player.spendHourAsEntireCrew, Player.discoverPlaces);
                        }
                    }
                }
            ]
        });
    };

    Player.clickButtonSearch = function () {
        var hasEnoughEnergyForTask = Crew.hasEnoughEnergyForTask(gx.gs.playerCrew, c.ACTIVITY_LEVEL_SLOW_WALKING);
        if (!hasEnoughEnergyForTask) {
            Gui.showMessage("You're too tired to search right now.");
        } else {
            var discoveries = Player.discoverPlaces(true, false);
            Player.spendHourAsEntireCrew(c.ACTIVITY_LEVEL_SLOW_WALKING);
            if (discoveries.length === 0) {
                Gui.showMessage("You don't notice anything new.");
            } else {
                discoveries.forEach(function (place) {
                    Gui.showMessage(Places.getNoticeMessage(gx.gs.playerLocation, place));
                });
                Map.refreshMap();
            }
        }
    };

    Player.clickButtonBuild = function () {
        var stashEnabled = '';
        var houseEnabled = 'disabled="disabled" ';
        var palisadeEnabled = 'disabled="disabled" ';
        var fortEnabled = 'disabled="disabled" ';
        var castleEnabled = 'disabled="disabled" ';
        var palaceEnabled = 'disabled="disabled" ';
        var shipEnabled = 'disabled="disabled" ';

        var dialogIdConstruct = gx.getNewUniqueId();
        var dialogHtml = [
            '<div id="' + dialogIdConstruct + '">',
            '<form><div id="dialogRadio">',
            '<input type="radio" id="radioStash" ' + stashEnabled + 'name="radio" checked="checked"/><label for="radioStash">Stash</label>',
            '<input type="radio" id="radioHouse" ' + houseEnabled + 'name="radio"/><label for="radioHouse">House</label>',
            '<input type="radio" id="radioPalisade" ' + palisadeEnabled + 'name="radio" /><label for="radioPalisade">Palisade</label>',
            '<input type="radio" id="radioFort" ' + fortEnabled + 'name="radio" /><label for="radioFort">Fort</label>',
            '<input type="radio" id="radioCastle" ' + castleEnabled + 'name="radio" /><label for="radioCastle">Castle</label>',
            '<input type="radio" id="radioPalace" ' + palaceEnabled + 'name="radio" /><label for="radioPalace">Palace</label>',
            '<input type="radio" id="radioShip" ' + shipEnabled + 'name="radio" /><label for="radioShip">Ship</label>',
            '</div></form></div>'
        ].join("\n");
        $("#zGameArea").append(dialogHtml);
        $("#dialogRadio").buttonset();
        $("#" + dialogIdConstruct).dialog({
            modal: true,
            width: "70%",
            title: "What would you like to construct?",
            buttons: [
                {
                    text: "Ok",
                    click: function () {
                        var whatToConstruct;
                        if ($("#radioStash").prop('checked')) {
                            whatToConstruct = c.CONSTRUCT_STASH;
                        } else if ($("#radioHouse").prop('checked')) {
                            whatToConstruct = c.CONSTRUCT_HOUSE;
                        } else if ($("#radioPalisade").prop('checked')) {
                            whatToConstruct = c.CONSTRUCT_PALISADE;
                        } else if ($("#radioFort").prop('checked')) {
                            whatToConstruct = c.CONSTRUCT_FORT;
                        } else if ($("#radioCastle").prop('checked')) {
                            whatToConstruct = c.CONSTRUCT_CASTLE;
                        } else if ($("#radioPalace").prop('checked')) {
                            whatToConstruct = c.CONSTRUCT_PALACE;
                        } else if ($("#radioShip").prop('checked')) {
                            whatToConstruct = c.CONSTRUCT_SHIP;
                        } else {
                            throw "Unsupported radio button clicked";
                        }

                        $(this).dialog("close");
                        $("#" + dialogIdConstruct).remove();

                        switch (whatToConstruct) {
                            case c.CONSTRUCT_STASH:
                                Player.constructStash();
                                break;
                            default:
                                throw "unsupported construction";
                        }
                    }
                }
            ]
        });
    };

    Player.computeHowHiddenStashIs = function (terrainType) {
        // todo
        return 1;
    };

    Player.constructStash = function () {
        var hasEnoughEnergyForTask = Crew.hasEnoughEnergyForTask(gx.gs.playerCrew, c.ACTIVITY_LEVEL_BRISK_WALKING);
        var terrainType = Map.identifyTerrainType(gx.gs.playerLocation);
        if (!hasEnoughEnergyForTask) {
            Gui.showMessage("You're too tired to build a decent stash right now.");
        } else if (c.isFullNight(gx.gs.currentDate)) {
            Gui.showMessage("It is too dark to be able to build a decent stash right now.");
        } else if (gx.gs.currentWeather.weatherType === c.WEATHER_STORMY) {
            Gui.showMessage("It is too stormy to be able to build a decent stash right now.");
        } else if (terrainType === c.TERRAIN_TYPE_LAKE || terrainType === c.TERRAIN_TYPE_LAVA || terrainType === c.TERRAIN_TYPE_OCEAN || terrainType === c.TERRAIN_TYPE_TOWN || terrainType === c.TERRAIN_TYPE_UNKNOWN) {
            Gui.showMessage("You don't think you'll be able to make a decently hidden stash, that you can later retrieve, in this area.");
        } else {
            Player.spendHourAsEntireCrew(c.ACTIVITY_LEVEL_BRISK_WALKING);
            var thisStashNumber = gx.gs.currentStashNumber++;
            var thisStashDate = c.cloneDate(gx.gs.currentDate);
            var stash = new Places.Place(
                c.PLACE_TYPE_STASH,
                "your stash number " + thisStashNumber,
                "You made a hiding place for some items here on " + c.formatDateForStatusDisplay(thisStashDate) + ".",
                "Stash " + thisStashNumber,
                c.ICON_INDEX_SPOT_X,
                [gx.gs.playerLocation[X], gx.gs.playerLocation[Y]],
                c.PLACE_VISIBILITY_KNOWN,
                new Places.PlaceDetailStash(Player.computeHowHiddenStashIs(terrainType), thisStashDate, thisStashNumber, [])
            );
            stash.isOnPlayerCharactersMap = true;
            Places.addPlace(gx.gs.blocks, stash);
            gx.gs.placesAtCurrentLocation.push(stash);
            Map.refreshMap();
            Gui.showMessage("You construct a concealed place to hide some stuff. This is stash number " + thisStashNumber + ". Click the AREA tab to access it.");
        }
    };

    // be sure to check to make sure the crew has enough energy before you call this
    Player.spendHourAsEntireCrew = function (activityLevel) {
        var couldEatMeal = true;
        gx.gs.playerCrew.forEach(function (crewMember) {
            var thisCrewMemberCouldEatMeal = Player.spendHourIndividuallyPart1(crewMember, activityLevel);
            if (!thisCrewMemberCouldEatMeal) {
                couldEatMeal = false;
            }
        });
        Player.spendHourIndividuallyPart2(couldEatMeal);
    };

    // return true if there's an opportunity to eat a meal
    // before calling this, make sure that the crewMember has enough energy to spend
    // after calling this, call part2
    // this doesn't update the universe's time, it just consumes energy and stuff
    // call this for EVERY crewMember in the crew
    Player.spendHourIndividuallyPart1 = function (crewMember, activityLevel) {
        var couldEatMeal = true;
        crewMember.incrementHungerForOneHour();
        switch (activityLevel) {
            case c.ACTIVITY_LEVEL_SLEEPING:
                crewMember.sleepForOneHour();
                crewMember.recoverPhysicalEnergyForOneHour();
                couldEatMeal = false;
                break;
            case c.ACTIVITY_LEVEL_RESTING:
                crewMember.incrementWakefulnessHourCount();
                crewMember.recoverPhysicalEnergyForOneHour();
                break;
            case c.ACTIVITY_LEVEL_STANDING_AROUND:
                crewMember.incrementWakefulnessHourCount();
                crewMember.spendPhysicalEnergyForOneHour(activityLevel);
                break;
            case c.ACTIVITY_LEVEL_SLOW_WALKING:
            case c.ACTIVITY_LEVEL_BRISK_WALKING:
                crewMember.incrementWakefulnessHourCount();
                crewMember.spendPhysicalEnergyForOneHour(activityLevel);
                break;
            case c.ACTIVITY_LEVEL_RUNNING:
                crewMember.incrementWakefulnessHourCount();
                crewMember.spendPhysicalEnergyForOneHour(activityLevel);
                couldEatMeal = false;
                break;
            default:
                throw "Unknown activity level: " + activityLevel;
        }
        return couldEatMeal;
    };

    // this part advances the universe's time, and eats a meal if we can.
    Player.spendHourIndividuallyPart2 = function (couldEatMeal) {
        var arrivedInNewDay = false;
        var dayBeforeIncrement = gx.gs.currentDate.getDay();
        gx.gs.currentDate = c.addHours(gx.gs.currentDate, 1);
        gx.gs.currentWeather = gx.gs.currentWeather.consumeHour();
        gx.gs.descriptionOfCurrentLocation = World.getTerrainDescription(
            Map.identifyTerrainType(gx.gs.playerLocation),
            gx.gs.currentWeather.weatherType,
            gx.gs.currentDate);

        var isGameOver = !Crew.getPlayerCharacter(gx.gs.playerCrew).isAlive();
        if (isGameOver) {
            Player.playerDeath();
        } else {
            arrivedInNewDay = gx.gs.currentDate.getDay() !== dayBeforeIncrement;
            if (arrivedInNewDay) {
                Player.newDay();
            }
            if (couldEatMeal) {
                Player.eatIfHungry();
            }
        }
        Status.updateStatus();
    };

    Player.newDay = function () {
        Gui.clearMessageBox();
        Gui.showMessage("New day! Maybe you'll live to see it through.");
        Crew.newDayForTheCrew(gx.gs.playerCrew);
        gx.gs.playerGear = Gear.updateConditionOfItemsForDay(gx.gs.playerGear);
    };

    Player.eatIfHungry = function () {
        if (Crew.getAverageCrewHunger(gx.gs.playerCrew) >= c.HUNGER_LEVEL_AT_WHICH_TO_EAT) {
            var percentageOfMealAvailable = Gear.computePercentageOfOneMealsWorthOfFoodAvailable(gx.gs.playerCrew, gx.gs.playerGear);
            if (percentageOfMealAvailable > 0) {
                var foodEaten = Player.eat();
                if (percentageOfMealAvailable < 1) {
                    Gui.showMessage("You ate the rest of your food: " + foodEaten);
                    Gui.showMessage("You were still hungry, so you managed to scrounge around and find a little more food here and there, but there's nothing left now.");
                } else {
                    Gui.showMessage("You ate a meal: " + foodEaten);
                    Journal.addEntry(gx.gs.journal, new Journal.Entry(
                        "ate a meal: " + foodEaten,
                        c.JOURNAL_ENTRY_TYPE_ATE_MEAL,
                        foodEaten));
                }
            }
        }
    };

    Player.eat = function () {
        var eatResult = Gear.extractMealFromGear(Crew.getCrewSize(gx.gs.playerCrew), gx.gs.playerGear, gx.gs.currentDate);
        gx.gs.playerGear = eatResult.gearNotConsumed;
        Crew.resetHunger(gx.gs.playerCrew);
        return Gear.getItemNamesWithQuantities(eatResult.foodToEat);
    };

    Player.playerDeath = function () {
        $(".buttonNav").button("option", "disabled", true);
        $(".buttonControl").button("option", "disabled", true);
        Gui.showMessage("You died.");
        $("#zGameArea").tabs({
            active: c.TAB_INDEX_SCORE
        });
        Journal.addEntry(gx.gs.journal, new Journal.Entry(
            "I perished!",
            c.JOURNAL_ENTRY_TYPE_RED_LETTER,
            ""));
        Gui.showMessageDialog("You died! Game over. Here's your score.", "Game Over", "50%");
    };

    return Player;
});
