define([
    'app/constants',
    'app/gameContext',
    'app/map',
    'app/world',
    'app/gear'], function (c, gx, Map, World, Gear) {

    var Places = {};

    Places.PlaceDetailDescriptionOnly = function (description) {
        return {
            placeDetailDescription: description
        };
    };

    Places.PlaceDetailLoot = function (dateLootGenerated, description, items) {
        return {
            dateLootGenerated: dateLootGenerated,
            description: description,
            items: items
        };
    };

    Places.PlaceDetailStash = function (howWellHiddenTheStashIs, dateStashed, stashNumber, items) {
        return {
            howWellHiddenTheStashIs: howWellHiddenTheStashIs,
            dateStashed: dateStashed,
            stashNumber: stashNumber,
            items: items
        };
    };

    Places.PlaceDetailMine = function (description, isInUse, hasSmelter, hasMonsters, hoursRequiredToExplore, itemTypeThatCanBeFound) {
        return {
            placeDetailDescription: description,
            isInUse: isInUse,
            hasSmelter: hasSmelter,
            hasMonsters: hasMonsters,
            hoursRequiredToExplore: hoursRequiredToExplore,
            itemTypeThatCanBeFound: itemTypeThatCanBeFound
        };
    };

    // todo
    Places.PlaceDetailEncounter = function (description) {
        return {
            placeDetailDescription: description
        };
    };

    Places.Place = function (placeType, placeName, placeDescription, tabName, iconIndex, coordinates, visibility, placeDetail) {
        return {
            placeId: gx.getNewUniqueId(),
            placeType: placeType,
            placeName: placeName,
            placeDescription: placeDescription,
            tabName: tabName,
            iconIndex: iconIndex,
            coordinates: coordinates,
            visibility: visibility,
            placeDetail: placeDetail,
            isOnPlayerCharactersMap: false
        };
    };

    Places.Block = function (blockCoordinates) {
        return {
            position: blockCoordinates,
            hasBeenPopulated: false,
            places: []
        };
    };

    Places.isStashStillHere = function (place) {
        // todo: consider how long the stash has been here, and how well it was hidden
        return true;
    };

    Places.computeChanceOfDiscovery = function (placeVisibility, terrainType, distanceAwayInMiles, isSearching, isDistracted, weather, date, wisdom, intelligence) {

        if (placeVisibility == c.PLACE_VISIBILITY_KNOWN) {
            return 1;
        }
        if (placeVisibility == c.PLACE_VISIBILITY_NONE) {
            return 0;
        }

        var canOnlyBeSeenInImmediateArea =
            placeVisibility === c.PLACE_VISIBILITY_TINY ||
                placeVisibility === c.PLACE_VISIBILITY_SMALL ||
                placeVisibility === c.PLACE_VISIBILITY_MEDIUM;
        if ((distanceAwayInMiles > 0.001) && canOnlyBeSeenInImmediateArea) {
            return 0;
        }

        var chance = 0;
        switch (placeVisibility) {
            case c.PLACE_VISIBILITY_TINY:
                // The discoverable thing is assumed to be in the vicinity, not a mile away.
                chance = .07;
                break;
            case c.PLACE_VISIBILITY_SMALL:
                chance = .1;
                break;
            case c.PLACE_VISIBILITY_MEDIUM:
                chance = .2;
                break;
            case c.PLACE_VISIBILITY_LARGE:
                chance = (-0.4 * distanceAwayInMiles) + 0.8;
                break;
            case c.PLACE_VISIBILITY_HUGE:
                chance = (-0.1 * distanceAwayInMiles) + 1.1;
                break;
        }

        // let's make it a bit harder to discover stuff.
        chance *= .5;

        if (wisdom > .65 || intelligence > .65) {
            chance += .1;
        }
        if (wisdom < .4 || intelligence < .4) {
            chance *= .8;
        }

        switch (terrainType) {
            case c.TERRAIN_TYPE_OCEAN:
            case c.TERRAIN_TYPE_MTN_OVER_PLAINS:
            case c.TERRAIN_TYPE_PLAIN:
            case c.TERRAIN_TYPE_LAKE:
            case c.TERRAIN_TYPE_DESERT:
            case c.TERRAIN_TYPE_AGRICULTURAL:
                chance += .2;
                break;
            case c.TERRAIN_TYPE_UNKNOWN:
            case c.TERRAIN_TYPE_SHORE:
            case c.TERRAIN_TYPE_MTN_OVER_DESERT:
            case c.TERRAIN_TYPE_RIVER:
            case c.TERRAIN_TYPE_TOWN:
                // no change
                break;
            case c.TERRAIN_TYPE_PINE_FOREST:
            case c.TERRAIN_TYPE_MTN_OVER_PINE:
            case c.TERRAIN_TYPE_MTN_OVER_JUNGLE:
            case c.TERRAIN_TYPE_JUNGLE:
            case c.TERRAIN_TYPE_CLIFFS:
            case c.TERRAIN_TYPE_IMPASSABLE_CLIFFS:
            case c.TERRAIN_TYPE_SWAMP:
            case c.TERRAIN_TYPE_LAVAFLOW:
            case c.TERRAIN_TYPE_LAVA:
                chance -= .2;
                break;
            default:
                throw "Unexpected terrain type encountered: " + terrainType;
        }

        if (isSearching) {
            chance += .15;
        }

        if (isDistracted) {
            chance *= .2;
        }

        if (c.isFullNight(date)) {
            chance *= .2;
        } else if (c.isTwilight(date)) {
            chance *= .75;
        }

        if (weather === c.WEATHER_CLOUDY) {
            chance *= .9;
        } else if (weather === c.WEATHER_STORMY) {
            chance *= .3;
        }

        return chance < 0 ? 0 : chance > 1 ? 1 : chance;
    };

    Places.createPlaceLoot = function(placeCoordinates) {
        return new Places.Place(
            c.PLACE_TYPE_LOOT,
            "an item",
            "This is something here you can pick up.",
            "Loot",
            c.ICON_INDEX_QUESTION_MARK,
            placeCoordinates,
            c.PLACE_VISIBILITY_SMALL,
            new Places.PlaceDetailLoot(
                c.cloneDate(gx.gs.currentDate),
                "This might be useful",
                Gear.generateRandomLoot()
            ));
    };

    Places.mineTypeOptions = [
        [40, Gear.GearSet.coal],
        [2, Gear.GearSet.roughTopaz],
        [2, Gear.GearSet.roughDiamond],
        [1, Gear.GearSet.roughSapphire],
        [1, Gear.GearSet.roughEmerald],
        [.7, Gear.GearSet.roughRuby],
        [15, Gear.GearSet.ironOre],
        [10, Gear.GearSet.copperOre],
        [5, Gear.GearSet.silverOre],
        [1, Gear.GearSet.goldOre],
        [.1, Gear.GearSet.mithrilOre]
    ];

    Places.createPlaceMine = function(placeCoordinates) {

        var isInUse = c.checkRandom(.1, "is mine in use");
        var hasMonsters = false;
        if (!isInUse && c.checkRandom(.4, "check empty mine for monsters")) {
            hasMonsters = true;
        }

        return new Places.Place(
            c.PLACE_TYPE_MINE,
            "a mine",
            "At some point, someone was extracting minerals from the ground here.",
            "Mine",
            c.ICON_INDEX_QUESTION_MARK,
            placeCoordinates,
            c.PLACE_VISIBILITY_LARGE,
            new Places.PlaceDetailMine(
                "The mine shaft leads downward into darkness, at a steep angle. Piles of crushed stone surround the entrance.",
                isInUse,
                c.checkRandom(.3, "mine has smelter"),
                hasMonsters,
                c.determineRandomNumberInRange(1, 10, "how long to explore mine"),
                c.chooseWeightedOption(c.getRandom("choose mine type"), Places.mineTypeOptions)
            ));
    };

    Places._populateBlock = function (block) {
        var blockPos = [
            block.position[X] * c.BLOCK_SIZE[X],
            block.position[Y] * c.BLOCK_SIZE[Y]
        ];
        if (c.DEBUG) {
            c.db("Populating block at position " + blockPos[X] + "," + blockPos[Y]);
        }
        for (var y = 0; y < c.BLOCK_SIZE[Y]; y++) {
            for (var x = 0; x < c.BLOCK_SIZE[X]; x++) {
                var placeCoordinates = [blockPos[X] + x, blockPos[Y] + y];
                var terrainType = Map.identifyTerrainType(placeCoordinates);
                var placeTypeOptions = World.getPlaceRandomOptions(terrainType);
                var placeType = c.chooseWeightedOption(c.getRandom("Determine a place type"), placeTypeOptions);
                var place = null;
                switch (placeType) {
                    case c.PLACE_TYPE_NOTHING_OF_INTEREST:
                    case c.PLACE_TYPE_STASH:
                    case c.PLACE_TYPE_DESCRIPTION_ONLY:
                    case c.PLACE_TYPE_CONVERSATION:
                        break;
                    case c.PLACE_TYPE_LOOT:
                        place = Places.createPlaceLoot(placeCoordinates);
                        break;
                    case c.PLACE_TYPE_MINE:
                        place = Places.createPlaceMine(placeCoordinates);
                        break;
                    case c.PLACE_TYPE_ENCOUNTER:
                    case c.PLACE_TYPE_DAMSEL_IN_DISTRESS:
                    case c.PLACE_TYPE_MERCHANT:
                    case c.PLACE_TYPE_SKYSHIP:
                    case c.PLACE_TYPE_TRAP:
                    case c.PLACE_TYPE_TREEHOUSE:
                    case c.PLACE_TYPE_COTTAGE:
                    case c.PLACE_TYPE_FARM:
                    case c.PLACE_TYPE_VILLAGE:
                    case c.PLACE_TYPE_FORTRESS:
                    case c.PLACE_TYPE_CASTLE:
                    case c.PLACE_TYPE_SHIP:
                    case c.PLACE_TYPE_TOWER:
                    case c.PLACE_TYPE_PYRAMID:
                    case c.PLACE_TYPE_FAIRY_RING:
                    case c.PLACE_TYPE_STONE_RUINS:
                    case c.PLACE_TYPE_WOODEN_RUINS:
                    case c.PLACE_TYPE_QUICKSAND:
                    case c.PLACE_TYPE_PIT:
                    case c.PLACE_TYPE_CAVE:
                        // todo: fill all these in
                        break;
                    default:
                        throw "Unknown place type: " + placeType;
                }
                if (place !== null) {
                    block.places.push(place);
                }
            }
        }
        c.db("Populated block with " + block.places.length + " places.");
        block.hasBeenPopulated = true;
    };

    Places._lookupBlock = function (blocks, blockCoordinates) {
        var key = c.convertBlockCoordinatesToKey(blockCoordinates);
        var block = blocks[key];
        if (block === undefined) {
            block = new Places.Block(blockCoordinates);
            blocks[key] = block;
        }
        return block;
    };

    Places._lookupPlaceIndexByPlaceId = function (places, placeId) {
        for (var i = 0; i < places.length; i++) {
            if (places[i].placeId === placeId) {
                return i;
            }
        }
        return -1;
    };

    Places.addPlace = function (blocks, place) {
        var mapCoordinates = place.coordinates;
        var blockCoordinates = c._computeBlockCoordinatesFromMapCoordinates(mapCoordinates);
        var block = Places._lookupBlock(blocks, blockCoordinates);
        block.places.push(place);
    };

    Places._removeFromListOfPlaces = function (places, placeId) {
        var indexToRemove = Places._lookupPlaceIndexByPlaceId(places, placeId);
        if (indexToRemove === -1) {
            throw "Cannot remove place, it doesn't exist: " + placeId;
        }
        places.splice(indexToRemove, 1);
    };

    Places.removePlace = function (blocks, place) {
        var blockCoordinates = c._computeBlockCoordinatesFromMapCoordinates(place.coordinates);
        var block = Places._lookupBlock(blocks, blockCoordinates);
        Places._removeFromListOfPlaces(block.places, place.placeId);
        Places._removeFromListOfPlaces(gx.gs.placesAtCurrentLocation, place.placeId);
    };

    Places._areBlockCoordinatesValid = function (blockCoordinates) {
        var max = c._computeBlockCoordinatesFromMapCoordinates(c.MAP_DETAIL_SIZE_IN_PIXELS);
        return blockCoordinates[X] >= 0 && blockCoordinates[X] < max[X] &&
            blockCoordinates[Y] >= 0 && blockCoordinates[Y] < max[Y];
    };

    Places._getPlacesFromBlock = function (blocks, blockCoordinates) {
        if (Places._areBlockCoordinatesValid(blockCoordinates)) {
            var block = Places._lookupBlock(blocks, blockCoordinates);
            if (!block.hasBeenPopulated) {
                Places._populateBlock(block);
            }
            return block.places;
        } else {
            return [];
        }
    };

    Places.getNearbyPlaces = function (blocks, playerMapCoordinates) {

        var centerPos = c._computeBlockCoordinatesFromMapCoordinates(playerMapCoordinates);
        return [].concat(
            Places._getPlacesFromBlock(blocks, [centerPos[X] - 1, centerPos[Y] - 1]),
            Places._getPlacesFromBlock(blocks, [centerPos[X], centerPos[Y] - 1]),
            Places._getPlacesFromBlock(blocks, [centerPos[X] + 1, centerPos[Y] - 1]),
            Places._getPlacesFromBlock(blocks, [centerPos[X] - 1, centerPos[Y]]),
            Places._getPlacesFromBlock(blocks, [centerPos[X], centerPos[Y]]),
            Places._getPlacesFromBlock(blocks, [centerPos[X] + 1, centerPos[Y]]),
            Places._getPlacesFromBlock(blocks, [centerPos[X] - 1, centerPos[Y] + 1]),
            Places._getPlacesFromBlock(blocks, [centerPos[X], centerPos[Y] + 1]),
            Places._getPlacesFromBlock(blocks, [centerPos[X] + 1, centerPos[Y] + 1])
        );
    };

    Places.getKnownPlacesAtThisLocation = function (blocks, playerMapCoordinates) {
        return Places._getPlacesFromBlock(blocks, c._computeBlockCoordinatesFromMapCoordinates(playerMapCoordinates)).filter(function (place) {
            return c.areLocationsEquivalent(playerMapCoordinates, place.coordinates) && place.isOnPlayerCharactersMap;
        });
    };

    Places.getNoticeMessage = function (currentPosition, place) {
        var message = "You notice " + place.placeName + " ";
        if (c.areLocationsEquivalent(gx.gs.playerLocation, place.coordinates)) {
            message += "here. (Click the area tab to check it out.)";
        } else {
            var distanceAway = c.computeDistanceBetweenTwoPointsInMiles(currentPosition, place.coordinates);
            var directionName = c.DIRECTION_NAMES[c.determineDirectionByAngle(c.angleOfLine(currentPosition, place.coordinates))];
            message += c.formatFloatSingleDecimal(distanceAway) + " miles to the " + directionName + ". " + place.placeDescription;
        }
        return message;
    };

    return Places;
});
