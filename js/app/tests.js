define([
    'app/constants',
    'app/zerbatConstants',
    'app/crew',
    'app/gear',
    'app/travel'], function (c, zc, Crew, Gear, Travel) {

    var Tests = {};

    Tests.runAllTests = function () {

        function TestFailed(msg) {
            this.msg = msg;
        }

        function assertEquals(expectedValue, actualValue) {
            if (expectedValue !== actualValue) {
                throw new TestFailed("Expected value: `" + expectedValue + "` Actual value: `" + actualValue + "`");
            }
        }

        function assertArrayEquals(expectedValue, actualValue) {
            if (expectedValue.length !== actualValue.length) {
                throw new TestFailed("Arrays of different length. Expected value is " + expectedValue.length + " long, and actual is " + actualValue.length + " long.");
            }
            for (var i = 0; i < expectedValue.length; i++) {
                if (expectedValue[i] !== actualValue[i]) {
                    throw new TestFailed("Element[" + i + "] Expected value: `" + expectedValue + "` Actual value: `" + actualValue + "`");
                }
            }
        }

        /////////////////////// Add tests here

        var Test = {};

        Test.testAddHour = function () {
            var dateA = new Date(1970, 12, 2, 6, 1, 1, 42);
            var dateB = new Date(1970, 12, 2, 9, 1, 1, 42);
            assertEquals(dateB.getTime(), c.addHours(dateA, 3).getTime());
        };

        Test.testAddHourSpanDay = function () {
            var dateA = new Date(1970, 12, 2, 6, 1, 1, 42);
            var dateB = new Date(1970, 12, 3, 6, 1, 1, 42);
            assertEquals(dateB.getTime(), c.addHours(dateA, 24).getTime());
        };

        Test.testDayDifference = function () {
            var d1 = new Date(2013, 5, 5, 5, 5, 5, 1);
            var d2 = new Date(2013, 5, 10, 5, 5, 5, 5);
            var diff = c.getDateDifferenceInDays(d1, d2);
            assertEquals(5, diff);
        };

        Test.testCountHoursUntilDawn = function () {
            assertEquals(0, c.countHoursUntilDawn(new Date(2013, 5, 5, 5, 5, 5, 1)));
            assertEquals(3, c.countHoursUntilDawn(new Date(2013, 5, 5, 2, 5, 5, 1)));
            assertEquals(22, c.countHoursUntilDawn(new Date(2013, 5, 5, 7, 5, 5, 1)));
        };

        Test.testGearCountLikeItems = function () {
            var gear = [
                new Gear.Item(
                    Gear.GearSet.mapOfZerbat,
                    c.ITEM_CONDITION_NEW,
                    c.ITEM_QUALITY_SUPERIOR,
                    1,
                    c.cloneDate(zc.GAME_STARTING_DATE)),
                new Gear.Item(
                    Gear.GearSet.mapOfZerbat,
                    c.ITEM_CONDITION_NEW,
                    c.ITEM_QUALITY_SUPERIOR,
                    1,
                    c.cloneDate(zc.GAME_STARTING_DATE)),
                new Gear.Item(
                    Gear.GearSet.bootsOfWaterWalking,
                    c.ITEM_CONDITION_NEW,
                    c.ITEM_QUALITY_OK,
                    1,
                    c.cloneDate(zc.GAME_STARTING_DATE))
            ];
            var count = Gear.countLikeItems(gear, Gear.GearSet.mapOfZerbat);
            assertEquals(2, count);
        };

        Test.testUpdateCondition = function() {
            var foundDate = new Date(2000, 0, 1, 0, 0, 0, 0);
            var buffalo = new Gear.Item(
                Gear.GearSet.buffalo,
                c.ITEM_CONDITION_NEW,
                c.ITEM_QUALITY_OK,
                1,
                foundDate);
            assertEquals(12, buffalo.itemInfo.daysUntilExpires);
            var wasDestroyed = buffalo.updateCondition(c.addHours(foundDate, (c.NUM_HOURS_PER_DAY * 12)));
            assertEquals(false, wasDestroyed);
            var currentDate = c.addHours(foundDate, (c.NUM_HOURS_PER_DAY * 13));
            wasDestroyed = buffalo.updateCondition(currentDate);
            assertEquals(true, wasDestroyed);
        };

        Test.testIsCombinableWithBuffalo = function() {
            var foundDate = new Date(2000, 0, 1, 0, 0, 0, 0);
            var buffaloA = new Gear.Item(
                Gear.GearSet.buffalo,
                c.ITEM_CONDITION_NEW,
                c.ITEM_QUALITY_OK,
                1,
                foundDate);
            var buffaloB = new Gear.Item(
                Gear.GearSet.buffalo,
                c.ITEM_CONDITION_NEW,
                c.ITEM_QUALITY_OK,
                1,
                foundDate);
            assertEquals(true, buffaloA.isCombinableWith(buffaloB, foundDate));
        };

        Test.testIsCombinableWithBoots = function() {
            var foundDate = new Date(2000, 0, 1, 0, 0, 0, 0);
            var bootsA = new Gear.Item(
                Gear.GearSet.bootsOfWaterWalking,
                c.ITEM_CONDITION_NEW,
                c.ITEM_QUALITY_OK,
                2,
                foundDate);
            var bootsB = new Gear.Item(
                Gear.GearSet.bootsOfWaterWalking,
                c.ITEM_CONDITION_NEW,
                c.ITEM_QUALITY_OK,
                1,
                foundDate);
            assertEquals(true, bootsA.isCombinableWith(bootsB, foundDate));
        };

        Test.testAddBuffalo = function() {
            var foundDate = new Date(2000, 0, 1, 0, 0, 0, 0);
            var buffaloA = new Gear.Item(
                Gear.GearSet.buffalo,
                c.ITEM_CONDITION_NEW,
                c.ITEM_QUALITY_OK,
                2,
                foundDate);
            var buffaloB = new Gear.Item(
                Gear.GearSet.buffalo,
                c.ITEM_CONDITION_NEW,
                c.ITEM_QUALITY_OK,
                1,
                foundDate);
            var gear = [buffaloA];
            gear = Gear.addItem(gear, buffaloB);
            gear = Gear.combineCombinableGear(gear, foundDate);
            assertEquals(1, gear.length);
            assertEquals(3, gear[0].quantity);
        };

        Test.testAddBoots = function() {
            var foundDate = new Date(2000, 0, 1, 0, 0, 0, 0);
            var bootsA = new Gear.Item(
                Gear.GearSet.bootsOfWaterWalking,
                c.ITEM_CONDITION_NEW,
                c.ITEM_QUALITY_OK,
                2,
                foundDate);
            var bootsB = new Gear.Item(
                Gear.GearSet.bootsOfWaterWalking,
                c.ITEM_CONDITION_NEW,
                c.ITEM_QUALITY_OK,
                1,
                foundDate);
            var gear = [bootsA];
            gear = Gear.addItem(gear, bootsB);
            gear = Gear.combineCombinableGear(gear, foundDate);
            assertEquals(1, gear.length);
            assertEquals(3, gear[0].quantity);
        };

        Test.testExtractMealFromGear = function() {
            var foundDate = new Date(2000, 0, 1, 0, 0, 0, 0);
            var crab = new Gear.Item(
                Gear.GearSet.crab,
                c.ITEM_CONDITION_NEW,
                c.ITEM_QUALITY_OK,
                5,
                foundDate);
            var kelp = new Gear.Item(
                Gear.GearSet.kelp,
                c.ITEM_CONDITION_NEW,
                c.ITEM_QUALITY_OK,
                10,
                foundDate);
            var gear = [crab, kelp];
            var res = Gear.extractMealFromGear(1, gear, foundDate);

            var foodToEat = res.foodToEat;
            assertEquals(1, foodToEat.length);
            assertEquals("crab", foodToEat[0].itemInfo.itemName);
            assertEquals(1, foodToEat[0].quantity);
            assertEquals(1, foodToEat[0].itemTypeSpecific.numPortions);

            var gearNotConsumed = res.gearNotConsumed;
            // 1 kelp, two crabs (1 crab with qty=1, portions=2, and the other with qty=4, portions=3)
            assertEquals(3, gearNotConsumed.length);
        };

        Test.testAdjacentLocations = function() {
            assertEquals(true, c.areLocationsAdjacent([10, 10], [9, 10]));
            assertEquals(true, c.areLocationsAdjacent([10, 10], [9, 9]));
            assertEquals(true, c.areLocationsAdjacent([10, 10], [11, 11]));
            assertEquals(true, c.areLocationsAdjacent([10, 10], [10, 9]));
            assertEquals(true, c.areLocationsAdjacent([10, 10], [10, 10]));
            assertEquals(false, c.areLocationsAdjacent([10, 10], [12, 12]));
            assertEquals(false, c.areLocationsAdjacent([10, 10], [12, 8]));
            assertEquals(false, c.areLocationsAdjacent([10, 10], [9, 8]));
            assertEquals(false, c.areLocationsAdjacent([10, 10], [10, 8]));
        };

        Test.testLookupDirectionByDirectionDelta = function() {
            assertEquals(c.NW, Travel.lookupDirectionByDirectionDelta([-1,-1]));
            assertEquals(c.E, Travel.lookupDirectionByDirectionDelta([1,0]));
        };

        Test.determineDirectionByAngle = function() {
            var rightOn = 0;
            var justUnder = -0.1;
            var justOver = 0.1;
            var angleBetweenEastAndNortheast = Math.PI / 4;
            assertEquals(c.E, c.determineDirectionByAngle(rightOn));
            assertEquals(c.E, c.determineDirectionByAngle(justUnder));
            assertEquals(c.E, c.determineDirectionByAngle(justOver));

            rightOn += angleBetweenEastAndNortheast;
            justUnder += angleBetweenEastAndNortheast;
            justOver += angleBetweenEastAndNortheast;
            assertEquals(c.NE, c.determineDirectionByAngle(rightOn));
            assertEquals(c.NE, c.determineDirectionByAngle(justUnder));
            assertEquals(c.NE, c.determineDirectionByAngle(justOver));

            rightOn += angleBetweenEastAndNortheast;
            justUnder += angleBetweenEastAndNortheast;
            justOver += angleBetweenEastAndNortheast;
            assertEquals(c.N, c.determineDirectionByAngle(rightOn));
            assertEquals(c.N, c.determineDirectionByAngle(justUnder));
            assertEquals(c.N, c.determineDirectionByAngle(justOver));

            rightOn += angleBetweenEastAndNortheast;
            justUnder += angleBetweenEastAndNortheast;
            justOver += angleBetweenEastAndNortheast;
            assertEquals(c.NW, c.determineDirectionByAngle(rightOn));
            assertEquals(c.NW, c.determineDirectionByAngle(justUnder));
            assertEquals(c.NW, c.determineDirectionByAngle(justOver));

            rightOn += angleBetweenEastAndNortheast;
            justUnder += angleBetweenEastAndNortheast;
            justOver += angleBetweenEastAndNortheast;
            assertEquals(c.W, c.determineDirectionByAngle(rightOn));
            assertEquals(c.W, c.determineDirectionByAngle(justUnder));
            assertEquals(c.W, c.determineDirectionByAngle(justOver));

            rightOn += angleBetweenEastAndNortheast;
            justUnder += angleBetweenEastAndNortheast;
            justOver += angleBetweenEastAndNortheast;
            assertEquals(c.SW, c.determineDirectionByAngle(rightOn));
            assertEquals(c.SW, c.determineDirectionByAngle(justUnder));
            assertEquals(c.SW, c.determineDirectionByAngle(justOver));

            rightOn += angleBetweenEastAndNortheast;
            justUnder += angleBetweenEastAndNortheast;
            justOver += angleBetweenEastAndNortheast;
            assertEquals(c.S, c.determineDirectionByAngle(rightOn));
            assertEquals(c.S, c.determineDirectionByAngle(justUnder));
            assertEquals(c.S, c.determineDirectionByAngle(justOver));

            rightOn += angleBetweenEastAndNortheast;
            justUnder += angleBetweenEastAndNortheast;
            justOver += angleBetweenEastAndNortheast;
            assertEquals(c.SE, c.determineDirectionByAngle(rightOn));
            assertEquals(c.SE, c.determineDirectionByAngle(justUnder));
            assertEquals(c.SE, c.determineDirectionByAngle(justOver));

            assertEquals(c.E, c.determineDirectionByAngle(12.44201561981241));
        };

        Test.testIsBody = function() {
            var body = new Gear.Item(
                Gear.GearSet.body,
                c.ITEM_CONDITION_NEW,
                c.ITEM_QUALITY_SUPERIOR,
                1,
                new Date());
            assertEquals(true, Gear.isBody(body));
            var writingKit = new Gear.Item(
                Gear.GearSet.mapOfZerbat,
                c.ITEM_CONDITION_NEW,
                c.ITEM_QUALITY_OK,
                1,
                new Date());
            assertEquals(false, Gear.isBody(writingKit));
        };

        Test.testHuntingComputationMax = function() {
            assertEquals(1, Crew.computeHuntingSkillRatingWithItem(
                1, // hunting skill rating
                1, // hunting skill item rating
                c.ITEM_QUALITY_MASTERPIECE,
                c.ITEM_CONDITION_NEW,
                false, // is magic
                1)); // item usefulness for hunting
        };

        Test.testHuntingComputationMagic = function() {
            assertEquals(.75, Crew.computeHuntingSkillRatingWithItem(
                .5, // hunting skill rating
                0, // hunting skill item rating
                c.ITEM_QUALITY_POOR,
                c.ITEM_CONDITION_WORN,
                true, // is magic
                0)); // item usefulness for hunting
        };

        Test.testHuntingComputationAverage = function() {
            assertEquals(.37375, Crew.computeHuntingSkillRatingWithItem(
                .5, // hunting skill rating
                .5, // hunting skill item rating
                c.ITEM_QUALITY_OK,
                c.ITEM_CONDITION_USED,
                false, // is magic
                .5)); // item usefulness for hunting
        };

        Test.testChooseWightedOption = function() {
            var options = [
                [.5, 2],
                [.5, 4],
                [.5, 5],
                [.5, "foo"],
                [.1, "bar"]
            ];

            assertEquals(2, c.chooseWeightedOption(0, options));
            assertEquals(2, c.chooseWeightedOption(.23, options));
            assertEquals(4, c.chooseWeightedOption(.24, options));
            assertEquals("foo", c.chooseWeightedOption(.94, options));
            assertEquals("bar", c.chooseWeightedOption(.96, options));
            assertEquals("bar", c.chooseWeightedOption(1, options));
        };

        ////////////////// This part runs the tests

        var numTestsRun = 0;
        var numTestsPassed = 0;
        var numTestsFailed = 0;
        var numTestsInError = 0;
        for (var i in Test) {
            //noinspection JSUnfilteredForInLoop
            if (typeof Test[i] === 'function') {
                console.log("Running test: " + i);
                numTestsRun++;
                try {
                    //noinspection JSUnfilteredForInLoop
                    Test[i]();
                    numTestsPassed++;
                } catch (error) {
                    if (error instanceof TestFailed) {
                        numTestsFailed++;
                        console.log("Test failed: " + error.msg);
                    } else {
                        numTestsInError++;
                        console.log("Test generated error: " + error.message);
                    }
                }
            }
        }
        console.log("Tests run      : " + numTestsRun);
        console.log("Tests passed   : " + numTestsPassed);
        if (numTestsFailed > 0) {
            console.log("Tests failed   : " + numTestsFailed);
        }
        if (numTestsInError > 0) {
            console.log("Tests in error : " + numTestsInError);
        }
        if (numTestsFailed + numTestsInError === 0) {
            console.log("Result: @@@@@@  SUCCESS  @@@@@@")
        } else {
            console.log("Result: >>>>>>  FAILURE  <<<<<<")
        }
    };

    return Tests;
});
