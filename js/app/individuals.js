define([
    'app/constants',
    'app/gameContext',
    'app/skills'], function (c, gx, Skills) {

    var Individual = {};

    Individual.generateRandomAbilityScore = function () {
        var score = 0;
        for (var i = 0; i < 10; i++) {
            score += c.rnd();
        }
        return score / 10;
    };

    Individual.Individual = function (individualName, gender, birthdate) {
        this.individualName = individualName;
        this.gender = gender;
        this.birthdate = birthdate;

        this.isLiving = true;

        // hunger goes from 0 (not hungry at all) to 1 (haven't eaten in 24 hours or more).
        this.hunger = 0;
        this.maxEnergyWhenHungry = .7;

        // This decrements while wakeful, until it hits zero.
        this.numHoursUntilSleepy = 16;

        // This keeps track of how many hours the individual has been sleepy.
        // Too many of these, and health is impacted.
        this.numHoursSleepy = 0;

        // health of 1 means the individual is perfectly healthy.
        // Value of 0 means they are dead.
        this.health = 1;
        this.healingRatePerDay = .01;

        // a value of zero for any of these stats means that the individual is basically helpless.
        // a normal adult value is 50%.
        // a value of 100% is truly extraordinary, and extremely rare.
        this.baseAbilityScores = [
            Individual.generateRandomAbilityScore(),
            Individual.generateRandomAbilityScore(),
            Individual.generateRandomAbilityScore(),
            Individual.generateRandomAbilityScore(),
            Individual.generateRandomAbilityScore()
        ];
        this.abilityScores = [
            this.baseAbilityScores[c.STR],
            this.baseAbilityScores[c.DEX],
            this.baseAbilityScores[c.INT],
            this.baseAbilityScores[c.WIS],
            this.baseAbilityScores[c.CHA]
        ];

        // activity consumes physicalEnergy.
        // First thing in the morning, after a good breakfast, a healthy person will have physicalEnergy at 100%.
        // By the time late evening comes around, they should be at 50% or so, ready for bed.
        // A value of 0 means that they are unable to move.
        this.physicalEnergy = 1;

        // stamina is the rate (per hour) at which physicalEnergy decreases with activity.
        // walking one hour (activity intensity 50%) normally decreases physicalEnergy by .1 (10%),
        // assuming good health, and an adult in decent shape.
        this.physicalEnergyDecrementRateByActivityIntensity = [0, 0, .04, .07, .1, .3];

        // The base rate at which an hour of rest will increase physicalEnergy.
        this.physicalEnergyIncrementRate = 0.2;

        // this is an array of skills. Use Skills.select() to get a specific one.
        this.skills = Skills.getStartingSkillSet();

        this.dateJoinedCrew = c.cloneDate(gx.gs.currentDate);
        this.dateOfMostRecentMeal = c.addHours(this.dateJoinedCrew, -5);
    };

    Individual.Individual.prototype = {
        constructor: Individual.Individual,

        isAlive: function () {
            return this.isLiving;
        },

        computeAgeInYears: function () {
            return c.getDateDifferenceInYears(this.birthdate, gx.gs.currentDate);
        },

        newDayForIndividual: function () {
            var daysSinceLastMeal = this.getDaysSincePreviousMeal(gx.gs.currentDate);
            if (daysSinceLastMeal < c.DAYS_WITHOUT_FOOD_RAVENOUS) {
                this.incrementHealth(this.healingRatePerDay);
            } else if (daysSinceLastMeal > c.DAYS_WITHOUT_FOOD_STARVING) {
                this.decrementHealth(c.HEALTH_DECREMENT_RATE_WHEN_STARVING);
            }
        },

        // this returns true if there was enough physicalEnergy to complete the task, false if not
        canSpendPhysicalEnergyForOneHour: function (activityLevel) {
            return this.__getEnergyDecrementDelta(activityLevel) < this.physicalEnergy;
        },

        // this returns true if there was enough physicalEnergy to complete the task, false if not
        spendPhysicalEnergyForOneHour: function (activityLevel) {
            var didSpend = false;
            if (this.canSpendPhysicalEnergyForOneHour(activityLevel)) {
                var delta = this.__getEnergyDecrementDelta(activityLevel);
                this.physicalEnergy -= delta;
                this.__adjustPhysicalEnergyAfterModification();
                didSpend = true;
            }
            return didSpend;
        },

        recoverPhysicalEnergyForOneHour: function () {
            var delta = this.physicalEnergyIncrementRate * this.health;
            this.physicalEnergy += delta;
            this.__adjustPhysicalEnergyAfterModification();
        },

        isSleepy: function () {
            return this.numHoursUntilSleepy <= 0;
        },

        sleepForOneHour: function () {
            this.numHoursUntilSleepy += c.SLEEP_RECOVERY_HOURS_UNTIL_SLEEPY_PER_HOUR;
            if (this.numHoursUntilSleepy >= c.MAX_HOURS_UNTIL_SLEEPY) {
                this.numHoursUntilSleepy = c.MAX_HOURS_UNTIL_SLEEPY;
                this.numHoursSleepy = 0;
            }
        },

        incrementHealth: function (percentToIncrement) {
            this.health += percentToIncrement;
            if (this.health > 1) {
                this.health = 1;
            }
        },

        decrementHealth: function (percentToDecrement) {
            this.health -= percentToDecrement;
            if (this.health <= 0) {
                this.health = 0;
                this.isLiving = false;
            }
        },

        incrementWakefulnessHourCount: function () {
            this.numHoursUntilSleepy -= 1;
            if (this.numHoursUntilSleepy <= 0) {
                this.numHoursUntilSleepy = 0;
                this.numHoursSleepy++;
                if (this.numHoursSleepy >= c.SLEEP_DEPRIVATION_HOURS) {
                    this.decrementHealth(c.PERCENT_TO_DAMAGE_HEALTH_PER_HOUR_FROM_SLEEP_DEPRIVATION);
                }
            }
        },

        incrementHungerForOneHour: function () {
            this.hunger += c.HUNGER_INCREMENT_PER_HOUR;
            if (this.hunger > 1) {
                this.hunger = 1;
            }
        },

        resetHunger: function () {
            this.hunger = 0;
            this.dateOfMostRecentMeal = c.cloneDate(gx.gs.currentDate);
        },

        getDaysSincePreviousMeal: function (currentDate) {
            return c.getDateDifferenceInDays(this.dateOfMostRecentMeal, currentDate);
        },

        getSkill: function (skillType) {
            return this.skills.filter(function (skill) {
                return (skill.skillType === skillType);
            })[0];
        },

        getSkillRating: function (skillType) {

            var getAverageOfPertinentAbilityScores = function (pertinentAbilities, individualScores) {
                var sumOfAbilityScores = 0;
                pertinentAbilities.forEach(function (ability) {
                    sumOfAbilityScores += individualScores[ability];
                });
                return sumOfAbilityScores / pertinentAbilities.length;
            };

            var computeSkillRatingMultiplier = function (abilityScore) {
                return 1 + ((abilityScore - .5) / 2);
            };

            var pertinentAbilityScore = getAverageOfPertinentAbilityScores(skillType.pertinentAbilities, this.abilityScores);
            var skillRatingMultiplier = computeSkillRatingMultiplier(pertinentAbilityScore);
            return this.getSkill(skillType).getRating() * skillRatingMultiplier;
        },

        // the backPacks array is pre-sorted, best first
        getCarryingCapacity: function (backPacks) {
            var selectedBackPack = null;
            for (var i = 0; i < backPacks.length && selectedBackPack === null; i++) {
                if (backPacks[i].quantity > 0) {
                    selectedBackPack = backPacks[i];
                    selectedBackPack.quantity--;
                }
            }

            var str = this.abilityScores[c.STR];
            var abilityScoreMultiplier;
            if (str <= .5) {
                // if str = 0, then multiplier = 0
                // if str = .5, then multiplier = 1
                abilityScoreMultiplier = str * 2;
            } else {
                // if str = .5, then multiplier = 1
                // if str = 1, then multiplier = 3
                abilityScoreMultiplier = ((str - .5) * 4) + 1;
            }

            var backPackBonusCarryingCapacity = 0;
            if (selectedBackPack !== null) {
                switch(selectedBackPack.quality) {
                    case c.ITEM_QUALITY_POOR:
                        backPackBonusCarryingCapacity = 10;
                        break;
                    case c.ITEM_QUALITY_OK:
                        backPackBonusCarryingCapacity = 12;
                        break;
                    case c.ITEM_QUALITY_SUPERIOR:
                        backPackBonusCarryingCapacity = 16;
                        break;
                    case c.ITEM_QUALITY_MASTERPIECE:
                        backPackBonusCarryingCapacity = 24;
                        break;
                    default:
                        throw("Unknown backpack quality: " + selectedBackPack.quality);
                }
                var conditionMultiplier;
                switch(selectedBackPack.condition) {
                    case c.ITEM_CONDITION_NEW:
                        conditionMultiplier = 1.1;
                        break;
                    case c.ITEM_CONDITION_USED:
                        conditionMultiplier = 1;
                        break;
                    case c.ITEM_CONDITION_WORN:
                        conditionMultiplier = .8;
                        break;
                    case c.ITEM_CONDITION_BROKEN:
                    case c.ITEM_CONDITION_DESTROYED:
                        conditionMultiplier = 0;
                        break;
                    default:
                        throw("unknown backpack condition: " + selectedBackPack.condition);
                }
                backPackBonusCarryingCapacity *= (abilityScoreMultiplier * conditionMultiplier);
            }

            // person of average str (.5), without a backpack, at a brisk walk, can carry this much weight:
            var baseCarryingCapacity = 40;

            return (baseCarryingCapacity * abilityScoreMultiplier) + backPackBonusCarryingCapacity;
        },

        formatForDisplay: function () {
            return [
                '<td>' + this.individualName + '</td>',
                '<td>' + c.GENDER_NAMES[this.gender] + '</td>',
                '<td>' + this.computeAgeInYears() + '</td>',
                '<td>' + c.formatDateForDisplay(this.birthdate) + '</td>',
                '<td>' + c.formatFloat(this.baseAbilityScores[c.STR]) + '</td>',
                '<td>' + c.formatFloat(this.baseAbilityScores[c.DEX]) + '</td>',
                '<td>' + c.formatFloat(this.baseAbilityScores[c.INT]) + '</td>',
                '<td>' + c.formatFloat(this.baseAbilityScores[c.WIS]) + '</td>',
                '<td>' + c.formatFloat(this.baseAbilityScores[c.CHA]) + '</td>',
                '<td>' + this.numHoursUntilSleepy + '</td>',
                '<td>' + c.formatPercent(this.hunger) + '</td>',
                '<td>' + c.formatDateAndTimeForDisplay(this.dateOfMostRecentMeal) + '</td>',
                '<td>' + c.formatPercent(this.health) + '</td>',
                '<td>' + c.formatPercent(this.healingRatePerDay) + '</td>',
                '<td>' + c.formatPercent(this.physicalEnergy) + '</td>',
                '<td>' + c.formatDateForDisplay(this.dateJoinedCrew) + '</td>'
            ].join("");
        },

        formatForDisplayAsText: function () {
            var abilityScoresArray = [];
            for (var i = 0; i < c.ABILITY_SCORE_NAMES.length; i++) {
                abilityScoresArray.push(c.ABILITY_SCORE_NAMES[i] + "=" + c.formatFloat(this.abilityScores[i]) +
                    " (base=" + c.formatFloat(this.baseAbilityScores[i]) + ")");
            }
            var abilityScores = abilityScoresArray.join(", ");
            return this.individualName +
                ", " + c.GENDER_NAMES[this.gender] +
                ", age=" + this.computeAgeInYears() +
                ", birthday=" + c.formatDateForDisplay(this.birthdate) +
                ", " + abilityScores +
                ", hours until sleepy=" + this.numHoursUntilSleepy +
                ", hunger=" + c.formatPercent(this.hunger) +
                ", most recent meal=" + c.formatDateAndTimeForDisplay(this.dateOfMostRecentMeal) +
                ", health=" + c.formatPercent(this.health) +
                ", healing rate per day=" + c.formatPercent(this.healingRatePerDay) +
                ", physical energy=" + c.formatPercent(this.physicalEnergy) +
                ", date joined crew=" + c.formatDateForDisplay(this.dateJoinedCrew);
        },

        __getEnergyDecrementDelta: function (activityLevel) {
            return this.physicalEnergyDecrementRateByActivityIntensity[activityLevel] *
                (this.isSleepy() ? c.SLEEPY_MULTIPLIER_FOR_ENERGY_USE : 1);
        },

        __adjustPhysicalEnergyAfterModification: function () {
            var maxDueToHunger = this.hunger >= 1 ? this.maxEnergyWhenHungry : 1;
            var maxDueToHealth = this.health;
            var maxDueToSleepy = this.isSleepy() ? c.MAX_ENERGY_WHEN_SLEEPY : 1;
            var maxPossibleEnergy = Math.min(maxDueToHunger, maxDueToHealth, maxDueToSleepy);
            if (this.physicalEnergy > maxPossibleEnergy) {
                this.physicalEnergy = maxPossibleEnergy;
            }
        }
    };

    return Individual;
});
