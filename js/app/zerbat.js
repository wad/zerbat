define([
    'app/constants',
    'app/gameContext',
    'app/zerbatConstants',
    'app/places',
    'app/individuals',
    'app/crew',
    'app/gear'], function (c, gx, zc, Places, Individuals, Crew, Gear) {

    var Zerbat = {};

    Zerbat.introMessage = [
        "<p>",
        "You cling desperately to a small floating chest, trying to keep your face above water.",
        "Between flashes of lightning you glimpse towering waves bash the ship again and again",
        "against the mighty, jutting rocks, until there is nothing left but splinters.",
        "You brace yourself for certain death on those fangs of doom,",
        "but a strong current carries your helpless, bedraggled body safely past them, to the shore beyond.",
        "Just as the sun begins to rise, you drag yourself, wounded but still living, out of the sea.",
        "</p><p>",
        "You carefully open the chest, and find a dry writing kit inside, along with a map titled,",
        "<strong>Island of <em>Zerbat</em></strong>. You thought that was just a myth!",
        "You figure out where you are, and mark your position on the map.",
        "What's that red X, far on the other side of the island?",
        "</p><p>",
        "If you want to live, you'll need to find food soon.",
        "But you're so tired right now, you just want to sleep for a couple of hours...",
        "</p>"].join(" ");

    Zerbat.firstJournalEntry = [
        "Oh, the tragedy! My friends on our good ship, all dead!",
        "I alone survived, and washed up on this strange, desolate shore.",
        "I found this writing kit, I'll use it for a journal.",
        "There's a map here too. It looks like I'm on the legendary Island of Zerbat!",
        "I wonder what this red X mark is for?"
    ].join(" ");

    Zerbat.newPlayerCharacter = function (playerCharacterName, gender) {
        var playerCharacter = new Individuals.Individual(
            playerCharacterName,
            gender,
            c.determineRandomBirthdate(zc.DEFAULT_PLAYER_AGE_MIN, zc.DEFAULT_PLAYER_AGE_MAX, zc.GAME_STARTING_DATE));
        playerCharacter.health = .85;
        playerCharacter.hunger = .2;
        playerCharacter.physicalEnergy = .35;
        playerCharacter.numHoursUntilSleepy = 0;
        playerCharacter.dateJoinedCrew = c.cloneDate(zc.GAME_STARTING_DATE);
        return playerCharacter;
    };

    Zerbat.newPlayerGear = function (gender) {
        return [
            new Gear.Item(
                Gear.GearSet.body,
                c.ITEM_CONDITION_NEW,
                c.ITEM_QUALITY_SUPERIOR,
                1,
                c.cloneDate(Crew.getPlayerCharacter(gx.gs.playerCrew).birthdate)),
            new Gear.Item(
                gender === c.GENDER_MALE ? Gear.GearSet.adultClothingMale : Gear.GearSet.adultClothingFemale,
                c.ITEM_CONDITION_USED,
                c.ITEM_QUALITY_OK,
                1,
                c.cloneDate(zc.GAME_STARTING_DATE)),
            new Gear.Item(
                Gear.GearSet.writingKit,
                c.ITEM_CONDITION_NEW,
                c.ITEM_QUALITY_OK,
                1,
                c.cloneDate(zc.GAME_STARTING_DATE)),
            new Gear.Item(
                Gear.GearSet.mapOfZerbat,
                c.ITEM_CONDITION_NEW,
                c.ITEM_QUALITY_OK,
                1,
                c.cloneDate(zc.GAME_STARTING_DATE))
        ];
    };

    Zerbat.initialPlaces = function () {
        var places = [];

        var placeSpotX = new Places.Place(
            c.PLACE_TYPE_DESCRIPTION_ONLY,
            "Spot marked X",
            "This is where the mysterious red X is on the map of the Island of Zerbat.",
            "Spot X",
            c.ICON_INDEX_SPOT_X,
            [808, 3168],
            c.PLACE_VISIBILITY_NONE,
            new Places.PlaceDetailDescriptionOnly(
                "This is where that red X is on the map. You don't see anything special here at the moment, though."
            ));
        placeSpotX.isOnPlayerCharactersMap = true;
        places.push(placeSpotX);

        places.push(new Places.Place(
            c.PLACE_TYPE_LOOT,
            "your wrecked ship",
            "Some things from your ship have washed ashore here.",
            "wreckage",
            c.ICON_INDEX_QUESTION_MARK,
            [5598, 1212],
            c.PLACE_VISIBILITY_HUGE,
            new Places.PlaceDetailLoot(
                c.cloneDate(zc.GAME_STARTING_DATE),
                "There is some wreckage scattered along the shore here, some still floating in the water. You make a pile of items that might be useful.",
                [
                    new Gear.Item(
                        Gear.GearSet.adultClothingMale,
                        c.ITEM_CONDITION_NEW,
                        c.ITEM_QUALITY_SUPERIOR,
                        2,
                        c.cloneDate(zc.GAME_STARTING_DATE)),
                    new Gear.Item(
                        Gear.GearSet.adultClothingFemale,
                        c.ITEM_CONDITION_NEW,
                        c.ITEM_QUALITY_SUPERIOR,
                        1,
                        c.cloneDate(zc.GAME_STARTING_DATE)),
                    new Gear.Item(
                        Gear.GearSet.spear,
                        c.ITEM_CONDITION_USED,
                        c.ITEM_QUALITY_OK,
                        3,
                        c.cloneDate(zc.GAME_STARTING_DATE)),
                    new Gear.Item(
                        Gear.GearSet.dagger,
                        c.ITEM_CONDITION_USED,
                        c.ITEM_QUALITY_OK,
                        1,
                        c.cloneDate(zc.GAME_STARTING_DATE)),
                    new Gear.Item(
                        Gear.GearSet.dagger,
                        c.ITEM_CONDITION_NEW,
                        c.ITEM_QUALITY_POOR,
                        2,
                        c.cloneDate(zc.GAME_STARTING_DATE)),
                    new Gear.Item(
                        Gear.GearSet.backpack,
                        c.ITEM_CONDITION_USED,
                        c.ITEM_QUALITY_OK,
                        2,
                        c.cloneDate(zc.GAME_STARTING_DATE)),
                    new Gear.Item(
                        Gear.GearSet.paperMoney,
                        c.ITEM_CONDITION_USED,
                        c.ITEM_QUALITY_OK,
                        13,
                        c.cloneDate(zc.GAME_STARTING_DATE))
                ]
            )));

//        places.push(new Places.Place(
//            c.PLACE_TYPE_ENCOUNTER,
//            "a scavenger",
//            "A man with a large bag over his shoulder, full of scavenged items.",
//            "scavenger",
//            c.ICON_INDEX_QUESTION_MARK,
//            [5598, 1212],
//            c.PLACE_VISIBILITY_HUGE,
//            new Places.PlaceDetailEncounter(
//                "The man ignores you."
//            )));

        return places;
    };

    return Zerbat;
});
