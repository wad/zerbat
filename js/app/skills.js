define([
    'app/constants',
    'app/gui'], function (c, Gui) {

    var Skills = {};

    Skills.SkillType = function (skillName, skillDescription, pertinentAbilities, hoursOfPracticeRequiredToAdvanceToLevel, hoursOfTrainingRequiredToAdvanceToLevel, associatedItemTypes) {
        this.skillName = skillName;
        this.skillDescription = skillDescription;
        this.pertinentAbilities = pertinentAbilities;
        this.hoursOfPracticeRequiredToAdvanceFromLevel = hoursOfPracticeRequiredToAdvanceToLevel;
        this.hoursOfTrainingRequiredToAdvanceFromLevel = hoursOfTrainingRequiredToAdvanceToLevel;
        this.associatedItemTypes = associatedItemTypes;
    };

    Skills.SkillType.prototype = {
        constructor: Skills.SkillType
    };

    Skills.Skill = function (skillType) {
        this.skillType = skillType;
        this.currentSkillLevel = c.SKILL_LEVEL_NONE;
        this.hoursOfPracticeAtCurrentLevel = 0;
        this.hoursOfTrainingAtCurrentLevel = 0;
    };

    Skills.Skill.prototype = {

        constructor: Skills.Skill,

        __checkForSkillLevelIncrease: function () {
            if (this.currentSkillLevel === c.SKILL_LEVEL_GRANDMASTER) {
                return false;
            }
            var practiceNeeded = this.skillType.hoursOfPracticeRequiredToAdvanceFromLevel[this.currentSkillLevel];
            var trainingNeeded = this.skillType.hoursOfTrainingRequiredToAdvanceFromLevel[this.currentSkillLevel];
            var practiceSufficientToNegateTrainingNeed = this.hoursOfPracticeAtCurrentLevel >= 100 + (trainingNeeded * 100);
            var enoughPracticeToAdvance = this.hoursOfPracticeAtCurrentLevel >= practiceNeeded;
            var enoughTrainingToAdvance = this.hoursOfTrainingAtCurrentLevel >= trainingNeeded;
            if ((enoughTrainingToAdvance && enoughPracticeToAdvance) || practiceSufficientToNegateTrainingNeed) {
                this.currentSkillLevel++;
                this.hoursOfPracticeAtCurrentLevel = 0;
                this.hoursOfTrainingAtCurrentLevel = 0;
                return true;
            }
            return false;
        },

        // this will return a value from 0 to .9
        getRating: function () {
            var maxPracticeHoursThatCount = (this.hoursOfPracticeAtCurrentLevel > 100) ? 100 : this.hoursOfPracticeAtCurrentLevel;
            return this.currentSkillLevel * .15 + (maxPracticeHoursThatCount / 1000);
        },

        practiceForOneHour: function () {
            this.hoursOfPracticeAtCurrentLevel++;
            return this.__checkForSkillLevelIncrease();
        },

        receiveTrainingForOneHour: function (instructorSkillLevel) {
            if (instructorSkillLevel > this.currentSkillLevel) {
                this.hoursOfTrainingAtCurrentLevel++;
            } else {
                this.hoursOfPracticeAtCurrentLevel++;
            }
            return this.__checkForSkillLevelIncrease();
        },

        formatForDisplay: function () {
            var practiceRequired = 0;
            var trainingRequired = 0;
            if (this.currentSkillLevel < c.SKILL_LEVEL_GRANDMASTER) {
                practiceRequired = this.skillType.hoursOfPracticeRequiredToAdvanceFromLevel[this.currentSkillLevel] - this.hoursOfPracticeAtCurrentLevel;
                trainingRequired = this.skillType.hoursOfTrainingRequiredToAdvanceFromLevel[this.currentSkillLevel] - this.hoursOfTrainingAtCurrentLevel;
            }
            if (practiceRequired < 0) {
                practiceRequired = 0;
            }
            if (trainingRequired < 0) {
                trainingRequired = 0;
            }
            return [
                '<tr>',
                '<td>' + this.skillType.skillName + '</td>',
                '<td>' + this.skillType.skillDescription + '</td>',
                '<td>' + c.SKILL_LEVEL_NAMES[this.currentSkillLevel] + '</td>',
                '<td>' + c.formatPercent(this.getRating()) + '</td>',
                '<td>' + this.hoursOfPracticeAtCurrentLevel + '</td>',
                '<td>' + practiceRequired + '</td>',
                '<td>' + this.hoursOfTrainingAtCurrentLevel + '</td>',
                '<td>' + trainingRequired + '</td>',
                '</tr>'
            ].join("");
        }
    };

    Skills.select = function (skills, skillType) {
        return skills.filter(function (skill) {
            return skillType === skill.skillType;
        })[0];
    };

    Skills.showSkills = function (crewMember) {
        var skillTable = [
            '<table class="zSkills zTable">',
            '<tbody>',
            '<tr>',
            '<th>skill</th>',
            '<th>description</th>',
            '<th>level</th>',
            '<th>rating</th>',
            '<th>hours practiced at this level</th>',
            '<th>additional practice needed</th>',
            '<th>hours trained at this level</th>',
            '<th>additional training needed</th>',
            '</tr>'
        ];
        var anyNonZeroSkills = false;
        crewMember.skills.forEach(function (skill) {
            if (skill.getRating() > 0) {
                skillTable.push(skill.formatForDisplay());
                anyNonZeroSkills = true;
            }
        });
        var message;
        if (anyNonZeroSkills) {
            skillTable.push('</tbody></table>');
            message = skillTable.join("")
        } else {
            message = '<p>This individual has no useful skills yet.</p>';
        }
        Gui.showMessageDialog(message, "Skills for " + crewMember.individualName, "90%");
    };

    Skills.getStartingSkillSet = function () {
        var startingSkillSet = [];
        Object.keys(Skills.SkillSet).forEach(function (key) {
            var property = Skills.SkillSet[key];
            if (property instanceof Skills.SkillType) {
                startingSkillSet.push(new Skills.Skill(property));
            }
        });
        return startingSkillSet;
    };

    Skills.SkillSet = {};

    Skills.SkillSet.hunting = new Skills.SkillType(
        "hunting",
        "seeking and slaying wild animals",
        [c.DEX],
        [5, 20, 30, 100, 600],
        [0, 0, 0, 8, 20],
        []);

    Skills.SkillSet.foraging = new Skills.SkillType(
        "foraging",
        "finding edible plants in the wild",
        [c.WIS],
        [4, 10, 40, 50, 200],
        [0, 0, 0, 10, 25],
        []);

    Skills.SkillSet.bareHanded = new Skills.SkillType(
        "bare-handed",
        "weaponless combat and hunting",
        [c.DEX, c.STR],
        [4, 8, 20, 100, 600],
        [0, 2, 6, 14, 20],
        []); // this array is populated in the Gear module

    Skills.SkillSet.spear = new Skills.SkillType(
        "spear",
        "use of the spear for melee attack, ranged attack, and defense",
        [c.DEX, c.STR],
        [4, 8, 20, 100, 600],
        [0, 2, 6, 14, 20],
        []); // this array is populated in the Gear module

    Skills.SkillSet.dagger = new Skills.SkillType(
        "dagger",
        "use of the dagger for melee attack, ranged attack, and defense",
        [c.DEX, c.STR],
        [4, 10, 20, 100, 600],
        [0, 2, 6, 14, 20],
        []); // this array is populated in the Gear module

    Skills.SkillSet.pick = new Skills.SkillType(
        "pick",
        "use of the pick for combat and mining",
        [c.STR],
        [14, 20, 40, 200, 800],
        [0, 2, 6, 14, 20],
        []); // this array is populated in the Gear module

    return Skills;
});
