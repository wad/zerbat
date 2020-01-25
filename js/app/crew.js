define([
    'app/constants',
    'app/gui',
    'app/skills'], function (c, Gui, Skills) {

    var Crew = {};

    Crew.getCrewSize = function (crew) {
        return crew.filter(function (crewMember) {
            return crewMember.health > 0;
        }).length;
    };

    Crew.sortByDateAddedToCrew = function (crew) {
        crew.sort(function (crewMemberA, crewMemberB) {
            if (crewMemberA.dateJoinedCrew === crewMemberB.dateJoinedCrew) {
                return (crewMemberA.individualName < crewMemberB.individualName) ? -1 : 1;
            } else {
                return (crewMemberA.dateJoinedCrew < crewMemberB.dateJoinedCrew) ? -1 : 1;
            }
        })
    };

    Crew.sortByHuntAndForageSkill = function (crew) {
        return crew.sort(function (crewMemberA, crewMemberB) {
            var sumA = crewMemberA.getSkillRating(Skills.SkillSet.hunting) + crewMemberA.getSkillRating(Skills.SkillSet.foraging);
            var sumB = crewMemberB.getSkillRating(Skills.SkillSet.hunting) + crewMemberB.getSkillRating(Skills.SkillSet.foraging);
            return sumA === sumB ? 0 : (sumA < sumB ? -1 : 1);
        });
    };

    Crew.addCrew = function (crew, individualToAdd) {
        crew.push(individualToAdd);
        return crew;
    };

    Crew.getMinimumCrewPhysicalEnergy = function (crew) {
        var minPhysicalEnergy = 1;
        crew.forEach(function (crewMember) {
            if (crewMember.physicalEnergy < minPhysicalEnergy) {
                minPhysicalEnergy = crewMember.physicalEnergy;
            }
        });
        return minPhysicalEnergy;
    };

    Crew.getAverageCrewHunger = function (crew) {
        var totalHunger = 0;
        crew.forEach(function (crewMember) {
            totalHunger += crewMember.hunger;
        });
        return totalHunger / crew.length;
    };

    Crew.getMinimumCrewHealth = function (crew) {
        var minHealth = 1;
        crew.forEach(function (crewMember) {
            if (crewMember.health < minHealth) {
                minHealth = crewMember.health;
            }
        });
        return minHealth;
    };

    Crew.getAverageCrewHealth = function (crew) {
        var totalHealth = 0;
        crew.forEach(function (crewMember) {
            totalHealth += crewMember.health;
        });
        return totalHealth / crew.length;
    };

    Crew.getAverageCrewAbilityScore = function (crew, abilityScoreId) {
        var avgScore = 0;
        var numInCrew = 0;
        crew.forEach(function (crewMember) {
            avgScore += crewMember.abilityScores[abilityScoreId];
            numInCrew++;
        });
        return avgScore / numInCrew;
    };

    Crew.hasEnoughEnergyForTask = function (crew, activityLevel) {
        var everyoneInCrewHasEnough = true;
        crew.forEach(function (crewMember) {
            var hasEnough = crewMember.canSpendPhysicalEnergyForOneHour(activityLevel);
            if (!hasEnough) {
                everyoneInCrewHasEnough = false;
            }
        });
        return everyoneInCrewHasEnough;
    };

    Crew.newDayForTheCrew = function (crew) {
        crew.forEach(function (crewMember) {
            crewMember.newDayForIndividual();
        });
    };

    Crew.computeMaxDaysSincePreviousMeal = function (crew, currentDate) {
        var max = 0;
        crew.forEach(function (crewMember) {
            var daysSinceLastMeal = crewMember.getDaysSincePreviousMeal(currentDate);
            if (daysSinceLastMeal > max) {
                max = daysSinceLastMeal;
            }
        });
        return max;
    };

    Crew.resetHunger = function (crew) {
        crew.forEach(function (crewMember) {
            crewMember.resetHunger();
        });
    };

    Crew.numCrewSleepy = function (crew) {
        var numSleepy = 0;
        crew.forEach(function (crewMember) {
            if (crewMember.isSleepy()) {
                numSleepy++;
            }
        });
        return numSleepy;
    };

    Crew.computeHuntingSkillRatingWithItem = function (huntingSkillRating, huntingSkillItemRating, itemQuality, itemCondition, itemIsMagic, itemUsefulnessForHunting) {
        var itemSkill;
        if (itemIsMagic) {
            itemSkill = 1;
        } else {
            var itemSkillRatingMultiplier = c.ITEM_QUALITY_SKILL_MULTIPLIER[itemQuality];
            var itemConditionMultiplier = c.ITEM_CONDITION_SKILL_MULTIPLIER[itemCondition];
            itemSkill = huntingSkillItemRating * itemSkillRatingMultiplier * itemConditionMultiplier * itemUsefulnessForHunting;
        }
        var skill = (itemSkill + huntingSkillRating) / 2;
        return skill < 0 ? 0 : skill > 1 ? 1 : skill;
    };

    // return a bunch of info about the result of the food finding
    Crew.decideHowToFindFood = function (crewMember, gearAvailable, hasEnoughEnergyToHunt, foragingIsFutileHere, huntingIsFutileHere) {

        var foragingSkillRating = crewMember.getSkillRating(Skills.SkillSet.foraging);
        var crewMemberBaseHuntingSkillRating = crewMember.getSkillRating(Skills.SkillSet.hunting);

        // choose a piece of hunting gear to use
        var bestHuntingSkillRating = -1;
        var selectedGear = null;
        var selectedGearItemIndex = -1;
        var gearItemIndex = 0;
        var selectedGearItemSkillType = -1;
        gearAvailable.forEach(function (item) {
            var associatedSkills = item.itemInfo.associatedSkills;
            if (item.quantity > 0) {
                associatedSkills.forEach(function (itemSkill) {
                    var computedHuntingSkillRatingWithItem = Crew.computeHuntingSkillRatingWithItem(
                        crewMemberBaseHuntingSkillRating,
                        crewMember.getSkillRating(itemSkill),
                        item.quality,
                        item.condition,
                        item.itemInfo.isMagical,
                        item.itemTypeSpecific.usefulnessForHunting
                    );
                    if (computedHuntingSkillRatingWithItem > bestHuntingSkillRating) {
                        bestHuntingSkillRating = computedHuntingSkillRatingWithItem;
                        selectedGear = item;
                        selectedGearItemIndex = gearItemIndex;
                        selectedGearItemSkillType = itemSkill;
                    }
                });
            }
            gearItemIndex++;
        });

        var msg = crewMember.individualName + " considered whether to hunt (skill " +
            c.formatPercent(bestHuntingSkillRating) + ") or forage (skill " +
            c.formatPercent(foragingSkillRating) + "), and decided to ";

        var shouldForage = foragingSkillRating > bestHuntingSkillRating;
        if (foragingSkillRating === bestHuntingSkillRating) {
            shouldForage = c.checkRandom(.5, "should one forage when foraging and hunting skills equal");
        }

        var randomChanceToSwitch = false;
        if (c.checkRandom(.2, "random chance to switch foraging or hunting")) {
            randomChanceToSwitch = true;
            shouldForage = !shouldForage;
        }

        if (!hasEnoughEnergyToHunt) {
            shouldForage = true;
            randomChanceToSwitch = false;
        }

        var shouldDoNothing = false;
        if (foragingIsFutileHere && shouldForage) {
            if (hasEnoughEnergyToHunt) {
                randomChanceToSwitch = false;
                shouldForage = false;
            } else {
                shouldDoNothing = true;
            }
        } else if (huntingIsFutileHere && !shouldForage) {
            randomChanceToSwitch = false;
            shouldForage = true;
        }

        var result = {};
        if (shouldForage) {
            result.isHunting = false;
            result.skillRating = foragingSkillRating;
            msg += "forage";
        } else {
            if (shouldDoNothing) {
                result.shouldDoNothing = true;
            } else {
                result.isHunting = true;
                result.skillRating = bestHuntingSkillRating;
                if (selectedGear === null) {
                    throw "Did not choose an item. Should at least be a body available to use bare hands with!";
                }
                result.huntingItem = selectedGear;
                result.selectedGearItemIndex = selectedGearItemIndex;
                result.selectedGearItemSkillType = selectedGearItemSkillType;
                msg += "hunt with a " + selectedGear.itemInfo.itemName;
            }
        }
        if (randomChanceToSwitch && (foragingSkillRating !== bestHuntingSkillRating) && !foragingIsFutileHere && !huntingIsFutileHere) {
            msg += ", just because " + c.GENDER_PRONOUNS[crewMember.gender] + " felt like it.";
        } else {
            msg += ".";
        }
        Gui.showMessage(msg);
        return result;
    };

    // todo: change this to hasThisNewIndividualNameAlreadyBeenSeen
    Crew.isIndividualNameAlreadyUsed = function (nameToConsider, crew) {
        var nameIsTaken = false;
        crew.forEach(function (crewMember) {
            if (nameToConsider === crewMember.individualName) {
                nameIsTaken = true;
            }
        });
        return nameIsTaken;
    };

    Crew.getPlayerCharacter = function (crew) {
        var playerCharacter = crew[0];
        for (var i = 1; i < crew.length; i++) {
            if (crew[i].dateJoinedCrew < playerCharacter.dateJoinedCrew) {
                playerCharacter = crew[i];
            }
        }
        return playerCharacter;
    };

    Crew.showCrew = function (crew) {
        $(".zCrew").find("tr:gt(0)").remove();
        var i = 0;
        Crew.sortByDateAddedToCrew(crew);
        crew.forEach(function (crewMember) {
            var crewmemberFields = [
                '<tr>',
                crewMember.formatForDisplay(),
                '<td>',
                '<input type="button" class="buttonControl zButton zButtonSkills" value="skills" id="buttonSkills_',
                i,
                '">',
                '</td>',
                '</tr>'
            ].join("");
            $('.zCrew > tbody:last').append(crewmemberFields);
            $("#buttonSkills_" + i).click(function (event) {
                var crewIndex = event.target.id.split("_")[1];
                Skills.showSkills(crew[crewIndex]);
            });
            i++;
        });
        $(".zButtonSkills").button();
    };

    return Crew;
});
