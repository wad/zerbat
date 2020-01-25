// weight is in pounds
// value is in goldBeads, where 1 goldBead is about $10 US.

define([
    'app/constants',
    'app/gameContext',
    'app/crew',
    'app/gui',
    'app/skills'], function (c, gx, Crew, Gui, Skills) {

    var Gear = {};

    Gear.ItemTypeSpecificNone = function () {
    };

    Gear.ItemTypeSpecificNone.prototype = {
        constructor: Gear.ItemTypeSpecificNone,
        __clone: function () {
            return new Gear.ItemTypeSpecificNone();
        },
        __equals: function (other) {
            return other !== null;
        },
        __formatForDisplay: function () {
            return "";
        }
    };

    Gear.ItemTypeSpecificFood = function (numPortions, terrainTypeWhereFound, isMeat) {
        this.numPortions = numPortions;
        this.terrainTypeWhereFound = terrainTypeWhereFound;
        this.isMeat = isMeat;
    };

    Gear.ItemTypeSpecificFood.prototype = {
        constructor: Gear.ItemTypeSpecificFood,
        __clone: function () {
            return new Gear.ItemTypeSpecificFood(this.numPortions, this.terrainTypeWhereFound, this.isMeat);
        },
        __equals: function (other) {
            return (other !== null) && (this.numPortions === other.numPortions);
        },
        __formatForDisplay: function () {
            return "<td>" + this.numPortions + "</td>";
        }
    };

    Gear.ItemTypeSpecificArmor = function (attackStat, defenceStat) {
        this.attackStat = attackStat;
        this.defenceStat = defenceStat;
    };

    Gear.ItemTypeSpecificArmor.prototype = {
        constructor: Gear.ItemTypeSpecificArmor,
        __clone: function () {
            return new Gear.ItemTypeSpecificArmor(this.attackStat, this.defenceStat);
        },
        __equals: function (other) {
            return (other !== null) && (this.attackStat === other.attackStat) && (this.defenceStat === other.defenceStat);
        },
        __formatForDisplay: function () {
            return "<td>" + c.formatPercent(this.attackStat) + "</td><td>" + c.formatPercent(this.defenceStat) + "</td>";
        }
    };

    Gear.ItemTypeSpecificWeapon = function (attackStat, defenceStat, usefulnessForHunting) {
        this.attackStat = attackStat;
        this.defenceStat = defenceStat;
        this.usefulnessForHunting = usefulnessForHunting;
    };

    Gear.ItemTypeSpecificWeapon.prototype = {
        constructor: Gear.ItemTypeSpecificWeapon,
        __clone: function () {
            return new Gear.ItemTypeSpecificWeapon(this.attackStat, this.defenceStat, this.usefulnessForHunting);
        },
        __equals: function (other) {
            return (other !== null) &&
                (this.attackStat === other.attackStat) &&
                (this.defenceStat === other.defenceStat) &&
                (this.usefulnessForHunting === other.usefulnessForHunting);
        },
        __formatForDisplay: function () {
            return "<td>" + c.formatPercent(this.attackStat) + "</td><td>" + c.formatPercent(this.defenceStat) + "</td>";
        }
    };

    Gear.ItemTypeSpecificLightSource = function (durationHours) {
        this.durationHours = durationHours;
    };

    Gear.ItemTypeSpecificFood.prototype = {
        constructor: Gear.ItemTypeSpecificLightSource,
        __clone: function () {
            return new Gear.ItemTypeSpecificLightSource(this.durationHours);
        },
        __equals: function (other) {
            return (other !== null) && (this.durationHours === other.durationHours);
        },
        __formatForDisplay: function () {
            return "";
        }
    };

    // these attributes of an item do not change
    Gear.ItemInfo = function (itemName, description, itemSize, itemType, itemTypeSpecific, weight, baseValue, isMagical, isQuest, isGoodForCombat, isGoodForHunting, willExpire, daysUntilExpires, associatedSkills) {
        this.itemName = itemName;
        this.description = description;
        this.itemSize = itemSize;
        this.itemType = itemType;
        this.itemTypeSpecific = itemTypeSpecific;
        this.weight = weight;
        this.baseValue = baseValue;
        this.isMagical = isMagical;
        this.isQuest = isQuest;
        this.isGoodForCombat = isGoodForCombat;
        this.isGoodForHunting = isGoodForHunting;
        this.willExpire = willExpire;
        this.daysUntilExpires = daysUntilExpires;
        this.associatedSkills = associatedSkills;
    };

    Gear.ItemInfo.prototype = {
        constructor: Gear.ItemInfo,

        __grabItemTypeSpecific: function () {
            return this.itemTypeSpecific.__clone();
        },

        __clone: function () {
            return new Gear.ItemInfo(
                this.itemName,
                this.description,
                this.itemSize,
                this.itemType,
                this.itemTypeSpecific.__clone(),
                this.weight,
                this.baseValue,
                this.isMagical,
                this.isQuest,
                this.isGoodForCombat,
                this.isGoodForHunting,
                this.willExpire,
                this.daysUntilExpires,
                this.associatedSkills)
        },

        __equals: function (other) {
            return (this.itemName === other.itemName) && (this.description === other.description);
        }
    };

    Gear.Item = function (itemInfo, condition, quality, quantity, acquisitionDate) {
        this.itemInfo = itemInfo;
        this.condition = condition;
        this.quality = quality;
        this.quantity = quantity;
        this.acquisitionDate = acquisitionDate;
        this.itemTypeSpecific = itemInfo.__grabItemTypeSpecific();
        this.tempId = -1;
    };

    Gear.Item.prototype = {
        constructor: Gear.Item,

        willExpire: function () {
            return this.itemInfo.willExpire;
        },

        computeWeight: function () {
            var weight = this.itemInfo.weight * this.quantity;
            if (this.itemInfo.itemType === c.ITEM_TYPE_FOOD) {
                var percentRemaining = this.itemTypeSpecific.numPortions / this.itemInfo.itemTypeSpecific.numPortions;
                weight *= percentRemaining;
            }
            return weight;
        },

        computeValue: function () {
            var itemConditionValueModifierUsed = .4;
            var itemConditionValueModifierWorn = .1;
            var itemConditionValueModifierBroken = .02;
            var baseValue = this.itemInfo.baseValue[this.quality];
            var actualValue;
            switch (this.condition) {
                case c.ITEM_CONDITION_NEW:
                    actualValue = baseValue;
                    break;
                case c.ITEM_CONDITION_USED:
                    actualValue = baseValue * itemConditionValueModifierUsed;
                    break;
                case c.ITEM_CONDITION_WORN:
                    actualValue = baseValue * itemConditionValueModifierWorn;
                    break;
                case c.ITEM_CONDITION_BROKEN:
                    if (this.quality === c.ITEM_QUALITY_MASTERPIECE) {
                        actualValue = baseValue * itemConditionValueModifierBroken;
                    }
                    break;
                case c.ITEM_CONDITION_DESTROYED:
                    actualValue = 0;
                    break;
                default:
                    throw "Unexpected item condition: " + this.condition;
            }
            return Math.floor(actualValue);
        },

        computeDaysUntilExpires: function (currentDate) {
            return this.willExpire() ? (this.itemInfo.daysUntilExpires - this.numDaysOwned(currentDate)) : c.INFINITY;
        },

        numDaysOwned: function (currentDate) {
            if (this.willExpire()) {
                return c.getDateDifferenceInDays(this.acquisitionDate, currentDate);
            } else {
                return c.INFINITY;
            }
        },

        numSecondsOwned: function (currentDate) {
            if (this.willExpire()) {
                return c.getDateDifferenceInSeconds(this.acquisitionDate, currentDate);
            } else {
                return c.INFINITY;
            }
        },

        updateCondition: function (currentDate) {
            var wasDestroyed = false;
            if (this.willExpire()) {
                var daysUntilExpires = this.computeDaysUntilExpires(currentDate);
                if (daysUntilExpires < 0) {
                    this.condition = c.ITEM_CONDITION_DESTROYED;
                    wasDestroyed = true;
                } else {
                    var itemConditionCutoffNew = .1;
                    var itemConditionCutoffUsed = .8;
                    var percentageExpired = daysUntilExpires / this.itemInfo.daysUntilExpires;
                    switch (this.condition) {
                        case c.ITEM_CONDITION_NEW:
                            if (percentageExpired >= itemConditionCutoffNew && percentageExpired < itemConditionCutoffUsed) {
                                this.condition = c.ITEM_CONDITION_USED;
                            } else if (percentageExpired >= itemConditionCutoffUsed) {
                                this.condition = c.ITEM_CONDITION_WORN;
                            }
                            break;
                        case c.ITEM_CONDITION_USED:
                            if (percentageExpired >= itemConditionCutoffUsed) {
                                this.condition = c.ITEM_CONDITION_WORN;
                            }
                            break;
                        case c.ITEM_CONDITION_WORN:
                        case c.ITEM_CONDITION_BROKEN:
                        case c.ITEM_CONDITION_DESTROYED:
                            // do not change
                            break;
                        default:
                            throw "Unexpected item condition: " + this.condition;
                    }
                }
            }
            return wasDestroyed;
        },

        clone: function () {
            var newItem = new Gear.Item(
                this.itemInfo.__clone(),
                this.condition,
                this.quality,
                this.quantity,
                c.cloneDate(this.acquisitionDate));
            return newItem;
        },

        isCombinableWith: function (other, currentDate) {
            var combinable = false;
            if (this.itemInfo.__equals(other.itemInfo)) {
                if ((this.condition === other.condition) && (this.quality === other.quality)) {
                    if (!this.itemInfo.willExpire) {
                        combinable = this.itemTypeSpecific.__equals(other.itemTypeSpecific);
                    } else {
                        var maxDaysExpirationDiffAcceptableForCombine = 3;
                        var daysExpirationApart = Math.abs(this.numDaysOwned(currentDate) - other.numDaysOwned(currentDate));
                        if (daysExpirationApart <= maxDaysExpirationDiffAcceptableForCombine) {
                            combinable = this.itemTypeSpecific.__equals(other.itemTypeSpecific);
                        }
                    }
                }
            }
            return combinable;
        },

        // you must call isCombinableWith before you call this method
        combineWith: function (other) {
            var result = this.clone();
            result.quantity += other.quantity;
            return result;
        }
    };

    Gear.countLikeItems = function (gear, itemInfo) {
        var numItems = 0;
        gear.forEach(function (item) {
            if (item.itemInfo === itemInfo) {
                numItems++;
            }
        });
        return numItems;
    };

    Gear.computeWeight = function (gear) {
        var totalWeight = 0;
        gear.forEach(function (item) {
            totalWeight += item.computeWeight();
        });
        return totalWeight;
    };

    Gear.computeWeightCarried = function (gear) {
        var totalWeight = 0;
        gear.forEach(function (item) {
            if (!Gear.isBody(item)) {
                totalWeight += item.computeWeight();
            }
        });
        return totalWeight;
    };

    Gear.isBody = function (item) {
        return item.itemInfo === Gear.GearSet.body;
    };

    Gear.formatForInventoryDisplay = function (item, currentDate) {
        return [
            '<td>' + item.itemInfo.itemName + '</td>',
            '<td>' + item.itemInfo.description + '</td>',
            '<td>' + c.ITEM_SIZE_NAMES[item.itemInfo.itemSize] + '</td>',
            '<td>' + c.ITEM_TYPE_NAMES[item.itemInfo.itemType] + '</td>',
            '<td>' + c.ITEM_QUALITY_NAMES[item.quality] + '</td>',
            '<td>' + c.ITEM_CONDITION_NAMES[item.condition] + '</td>',
            '<td>' + (item.willExpire() ? (item.computeDaysUntilExpires(currentDate)) : "∞") + '</td>',
            item.itemTypeSpecific.__formatForDisplay(),
            '<td>' + item.computeValue() + '</td>',
            '<td>' + item.quantity + '</td>',
            '<td>' + c.formatFloat(item.computeWeight()) + '</td>'
        ].join("");
    };

    Gear.showInventory = function () {

        var currentDate = gx.gs.currentDate;
        gx.gs.playerGear = Gear.combineCombinableGear(gx.gs.playerGear, currentDate);
        var gear = gx.gs.playerGear;

        var addRow = function (categoryName, item, gearEntryRowIndex, currentDate) {
            var gearFields = [
                '<tr>',
                Gear.formatForInventoryDisplay(item, currentDate),
                '<td>',
                '<input type="button" role="button" class="buttonControl zButton zButtonItemDump',
                item.itemInfo.isQuest ? ' zButtonItemDumpDisabled' : '',
                '" value="dump" id="buttonItemDump_',
                gearEntryRowIndex,
                '">',
                '</td>',
                '</tr>'
            ].join("");
            $('.' + categoryName + ' > tbody:last').append(gearFields);
            $("#buttonItemDump_" + gearEntryRowIndex).click(function () {
                item.quantity--;
                Gear.showInventory();
            });
        };

        // we need to be able to uniquely identify an item in the current inventory
        var itemTempId = 0;
        gear.forEach(function (item) {
            item.tempId = itemTempId++;
        });

        $(".zInventory").find("tr:gt(0)").remove();

        var gearEntryRowIndex = 0;

        var specialItems = Gear.filterGearByType(gear, c.ITEM_TYPE_SPECIAL);
        var $special = $("#tabs-inventory-special");
        if (specialItems.length === 0) {
            $special.empty();
            $special.html('<p>You aren\'t carrying any special items right now.</p>');
        } else {
            $special.html('<table class="zInventory zInventorySpecial zTable"><tbody><tr>' +
                '<th>item</th>' +
                '<th>description</th>' +
                '<th>size</th>' +
                '<th>type</th>' +
                '<th>quality</th>' +
                '<th>condition</th>' +
                '<th>days until expires</th>' +
                '<th>value each</th>' +
                '<th>quantity</th>' +
                '<th>total weight</th>' +
                '<th>actions</th>' +
                '</tr> </tbody> </table>');
            specialItems.forEach(function (item) {
                addRow("zInventorySpecial", item, gearEntryRowIndex++, currentDate);
            });
        }

        var foodItems = Gear.filterGearByType(gear, c.ITEM_TYPE_FOOD);
        var $food = $("#tabs-inventory-food");
        if (foodItems.length === 0) {
            $food.empty();
            $food.html('<p>You aren\'t carrying any food right now.</p>');
        } else {
            $food.html('<table class="zInventory zInventoryFood zTable"><tbody><tr>' +
                '<th>item</th>' +
                '<th>description</th>' +
                '<th>size</th>' +
                '<th>type</th>' +
                '<th>quality</th>' +
                '<th>condition</th>' +
                '<th>days until expires</th>' +
                '<th>portions</th>' +
                '<th>value each</th>' +
                '<th>quantity</th>' +
                '<th>total weight</th>' +
                '<th>actions</th>' +
                '</tr> </tbody> </table>');
            foodItems.forEach(function (item) {
                addRow("zInventoryFood", item, gearEntryRowIndex++, currentDate);
            });
        }

        var weaponItems = Gear.filterGearByType(gear, c.ITEM_TYPE_WEAPON);
        var $weapons = $("#tabs-inventory-weapons");
        if (weaponItems.length === 0) {
            $weapons.empty();
            $weapons.html('<p>You aren\'t carrying any weapons right now.</p>');
        } else {
            $weapons.html('<table class="zInventory zInventoryWeapons zTable"><tbody><tr>' +
                '<th>item</th>' +
                '<th>description</th>' +
                '<th>size</th>' +
                '<th>type</th>' +
                '<th>quality</th>' +
                '<th>condition</th>' +
                '<th>days until expires</th>' +
                '<th>attack</th>' +
                '<th>defence</th>' +
                '<th>value each</th>' +
                '<th>quantity</th>' +
                '<th>total weight</th>' +
                '<th>actions</th>' +
                '</tr> </tbody> </table>');
            weaponItems.forEach(function (item) {
                addRow("zInventoryWeapons", item, gearEntryRowIndex++, currentDate);
            });
        }

        var armorItems = Gear.filterGearByType(gear, c.ITEM_TYPE_ARMOR);
        var $armor = $("#tabs-inventory-armor");
        if (armorItems.length === 0) {
            $armor.empty();
            $armor.html('<p>You aren\'t carrying any armor right now.</p>');
        } else {
            $armor.html('<table class="zInventory zInventoryArmor zTable"><tbody><tr>' +
                '<th>item</th>' +
                '<th>description</th>' +
                '<th>size</th>' +
                '<th>type</th>' +
                '<th>quality</th>' +
                '<th>condition</th>' +
                '<th>days until expires</th>' +
                '<th>attack</th>' +
                '<th>defence</th>' +
                '<th>value each</th>' +
                '<th>quantity</th>' +
                '<th>total weight</th>' +
                '<th>actions</th>' +
                '</tr> </tbody> </table>');
            armorItems.forEach(function (item) {
                addRow("zInventoryArmor", item, gearEntryRowIndex++, currentDate);
            });
        }

        var equipmentItems = Gear.filterGearByType(gear, c.ITEM_TYPE_EQUIPMENT);
        var $equipment = $("#tabs-inventory-equipment");
        if (equipmentItems.length === 0) {
            $equipment.empty();
            $equipment.html('<p>You aren\'t carrying any equipment items right now.</p>');
        } else {
            $equipment.html('<table class="zInventory zInventoryEquipment zTable"><tbody><tr>' +
                '<th>item</th>' +
                '<th>description</th>' +
                '<th>size</th>' +
                '<th>type</th>' +
                '<th>quality</th>' +
                '<th>condition</th>' +
                '<th>days until expires</th>' +
                '<th>value each</th>' +
                '<th>quantity</th>' +
                '<th>total weight</th>' +
                '<th>actions</th>' +
                '</tr> </tbody> </table>');
            equipmentItems.forEach(function (item) {
                addRow("zInventoryEquipment", item, gearEntryRowIndex++, currentDate);
            });
        }

        var treasureItems = Gear.filterGearByType(gear, c.ITEM_TYPE_TREASURE);
        var $treasure = $("#tabs-inventory-treasure");
        if (treasureItems.length === 0) {
            $treasure.empty();
            $treasure.html('<p>You aren\'t carrying any treasure right now.</p>');
        } else {
            $treasure.html('<table class="zInventory zInventoryTreasure zTable"><tbody><tr>' +
                '<th>item</th>' +
                '<th>description</th>' +
                '<th>size</th>' +
                '<th>type</th>' +
                '<th>quality</th>' +
                '<th>condition</th>' +
                '<th>days until expires</th>' +
                '<th>value each</th>' +
                '<th>quantity</th>' +
                '<th>total weight</th>' +
                '<th>actions</th>' +
                '</tr> </tbody> </table>');
            treasureItems.forEach(function (item) {
                addRow("zInventoryTreasure", item, gearEntryRowIndex++, currentDate);
            });
        }

        $(".zButtonItemDumpDisabled").attr('disabled', true);
        $(".zButtonItemDump").button();
    };

    Gear.filterGearByType = function (gear, gearType) {
        return gear.filter(function (item) {
            return item.itemInfo.itemType === gearType;
        });
    };

    Gear.countPortionsOfFood = function (gear) {
        var food = Gear.filterGearByType(gear, c.ITEM_TYPE_FOOD);
        var numPortions = 0;
        food.forEach(function (item) {
            numPortions += (item.itemTypeSpecific.numPortions * item.quantity);
        });
        return numPortions;
    };

    Gear.extractMealFromGear = function (numPortionsNeeded, gear, currentDate) {

        gear = Gear.combineCombinableGear(gear, currentDate);

        // go through all the gear, make a list of food
        var allFood = [];
        var nonFood = [];
        gear.forEach(function (item) {
            if (item.itemInfo.itemType === c.ITEM_TYPE_FOOD) {
                allFood.push(item);
            } else {
                nonFood.push(item);
            }
        });

        // sort food by how many days left until it expires, with the food to eat soonest first in the list
        allFood.sort(function (f1, f2) {
            if (f1.computeDaysUntilExpires(currentDate) === f2.computeDaysUntilExpires(currentDate)) {
                if (f1.quantity === f2.quantity) {
                    return f1.itemTypeSpecific.numPortions > f2.itemTypeSpecific.numPortions;
                } else {
                    return f1.quantity > f2.quantity;
                }
            } else {
                return f1.computeDaysUntilExpires(currentDate) > f2.computeDaysUntilExpires(currentDate);
            }
        });

        function displayFood(item, currentDate) {
            return item.itemInfo.itemName +
                " expires=" + item.computeDaysUntilExpires(currentDate) +
                " quantity=" + item.quantity +
                " portions=" + item.itemTypeSpecific.numPortions;
        }

        function displayListOfFood(message, listOfFood, currentDate) {
            c.db2(message);
            listOfFood.forEach(function (item) {
                c.db2(displayFood(item, currentDate));
            });
        }

        displayListOfFood("Sorted list of food:", allFood, currentDate);

        // go through all food, and sort food by what to eat, and what isn't going to be eaten now
        var foodToEat = [];
        var foodNotEaten = [];
        var numPortionsStillNeeded = numPortionsNeeded;
        allFood.forEach(function (food) {
            if (numPortionsStillNeeded > 0) {
                c.db2("Checking: " + displayFood(food, currentDate));
                c.db2("num portions still needed: " + numPortionsStillNeeded);
                var portionsInThisFoodItem = (food.quantity * food.itemTypeSpecific.numPortions);
                if (portionsInThisFoodItem <= numPortionsStillNeeded) {
                    c.db2("adding to eat list: " + displayFood(food, currentDate));
                    foodToEat.push(food);
                    numPortionsStillNeeded -= portionsInThisFoodItem;
                } else {
                    c.db2("shattering: " + displayFood(food, currentDate));
                    var foodDividedIntoSingleQuantities = Gear.shatterItemIntoQuantitiesOfOne(food);
                    foodDividedIntoSingleQuantities.forEach(function (singleItem) {
                        if (numPortionsStillNeeded > 0) {
                            c.db2("checking in shatter: " + displayFood(singleItem, currentDate));
                            if (numPortionsStillNeeded >= singleItem.itemTypeSpecific.numPortions) {
                                c.db2("eating unsplit item: " + displayFood(singleItem, currentDate));
                                foodToEat.push(singleItem);
                                numPortionsStillNeeded -= singleItem.itemTypeSpecific.numPortions;
                            } else {
                                c.db2("splitting it");
                                var itemToEat = singleItem.clone();
                                itemToEat.itemTypeSpecific.numPortions = numPortionsStillNeeded;
                                c.db2("eating split item: " + displayFood(itemToEat, currentDate));
                                foodToEat.push(itemToEat);
                                singleItem.itemTypeSpecific.numPortions -= numPortionsStillNeeded;
                                c.db2("not eating split item: " + displayFood(singleItem, currentDate));
                                foodNotEaten.push(singleItem);
                                numPortionsStillNeeded = 0;
                            }
                        } else {
                            c.db2("Already got all portions, not eating: " + displayFood(singleItem, currentDate));
                            foodNotEaten.push(singleItem);
                        }
                    });
                }
            } else {
                c.db2("Already got all portions, not eating this: " + displayFood(food, currentDate));
                foodNotEaten.push(food);
            }
        });

        var listOfFoodToEat = Gear.combineCombinableGear(foodToEat, currentDate);
        displayListOfFood("Combined list of food eaten:", listOfFoodToEat, currentDate);
        var listOfStuffNotConsumed = Gear.combineCombinableGear(nonFood.concat(foodNotEaten), currentDate);
        displayListOfFood("Combined list of uneaten stuff:", listOfStuffNotConsumed, currentDate);
        return {
            foodToEat: listOfFoodToEat,
            gearNotConsumed: listOfStuffNotConsumed
        };
    };

    Gear.computePercentageOfOneMealsWorthOfFoodAvailable = function (crew, gear) {
        var numPeople = Crew.getCrewSize(crew);
        if (numPeople <= 0) {
            return 0;
        }
        var numPortions = Gear.countPortionsOfFood(gear);
        var percent = numPortions / numPeople;
        return percent > 1 ? 1 : percent;
    };

    Gear.canRide = function (crew, gear) {
        return false;
    };

    Gear.canFly = function (crew, gear) {
        return false;
    };

    Gear.shatterItemIntoQuantitiesOfOne = function (item) {
        var shattered = [];
        if (item.quantity > 1) {
            for (var i = 0; i < item.quantity; i++) {
                var singleItem = item.clone();
                singleItem.quantity = 1;
                shattered.push(singleItem);
            }
        } else {
            shattered.push(item);
        }
        return shattered;
    };

    Gear.getItemNamesWithQuantities = function (gear) {
        var res = {};
        gear.forEach(function (item) {
            if (!(item.itemInfo.itemName in res)) {
                res[item.itemInfo.itemName] = 0;
            }
            res[item.itemInfo.itemName] += (item.quantity * item.itemTypeSpecific.numPortions);
        });
        var msg = [];
        for (var i in res) {
            msg.push(res[i] + " portions of " + i);
        }
        return msg.join(",");
    };

    Gear.showSpoiledItemMessage = function (destroyedGear) {
        if (destroyedGear.length > 0) {
            Gui.showMessage("This stuff went bad: " + Gear.getItemNamesWithQuantities(destroyedGear));
        }
    };

    Gear.updateConditionOfItemsForDay = function (gear) {
        var keptItems = [];
        var destroyedItems = [];
        gear.forEach(function (item) {
            var wasDestroyed = item.updateCondition(gx.gs.currentDate);
            if (wasDestroyed) {
                destroyedItems.push(item);
            } else {
                keptItems.push(item);
            }
        });
        Gear.showSpoiledItemMessage(destroyedItems);
        return keptItems;
    };

    Gear.combineCombinableGear = function (gear, currentDate) {

        var filteredGear = gear.filter(function (item) {
            return item.quantity > 0;
        });

        var result = [];
        for (var i = 0; i < filteredGear.length; i++) {
            var itemToCheck = filteredGear[i];
            if (itemToCheck !== null) {
                for (var j = i + 1; j < filteredGear.length; j++) {
                    var itemToCheckAgainst = filteredGear[j];
                    if (itemToCheckAgainst !== null) {
                        if (itemToCheck.isCombinableWith(itemToCheckAgainst, currentDate)) {
                            itemToCheck = itemToCheck.combineWith(itemToCheckAgainst);
                            filteredGear[j] = null;
                        }
                    }
                }
                result.push(itemToCheck);
            }
        }
        return result;
    };

    Gear.addItem = function (gear, itemToAdd) {
        gear.push(itemToAdd);
        return gear;
    };

    Gear.combineGear = function (gearListA, gearListB, currentDate) {
        return Gear.combineCombinableGear(gearListA.concat(gearListB), currentDate);
    };

    Gear.clone = function (gear) {
        var cloneList = [];
        gear.forEach(function (item) {
            cloneList.push(item.clone());
        });
        return cloneList;
    };

    Gear.generateRandomItemQuality = function () {
        var r = c.getRandom("item quality");
        if (r < .2) {
            return c.ITEM_QUALITY_POOR;
        }
        if (r < .8) {
            return c.ITEM_QUALITY_OK;
        }
        if (r < .99) {
            return c.ITEM_QUALITY_SUPERIOR;
        }
        return c.ITEM_QUALITY_MASTERPIECE;
    };

    Gear.generateRandomLoot = function () {
        // todo: randomly choose some gear
        return [
            new Gear.Item(
                Gear.GearSet.dagger,
                c.ITEM_CONDITION_USED,
                c.ITEM_QUALITY_OK,
                1,
                c.cloneDate(gx.gs.currentDate))
        ];
    };

    Gear.calculateTotalValue = function (gear) {
        var totalValue = 0;
        gear.forEach(function (item) {
            totalValue += item.computeValue();
        });
        return totalValue;
    };

    Gear.identifyFindableFoodTypes = function (terrainTypeId, isMeat) {
        var foodItemInfoOptions = [];
        Object.keys(Gear.GearSet).forEach(function (key) {
            var property = Gear.GearSet[key];
            if (property instanceof Gear.ItemInfo) {
                if (property.itemType === c.ITEM_TYPE_FOOD) {
                    if (property.itemTypeSpecific.isMeat === isMeat) {
                        if (property.itemTypeSpecific.terrainTypeWhereFound === terrainTypeId) {
                            foodItemInfoOptions.push(property);
                        }
                    }
                }
            }
        });
        return foodItemInfoOptions
    };

    Gear.foragingResult = function (terrainTypeId) {
        var foodItemInfoOptions = Gear.identifyFindableFoodTypes(terrainTypeId, false);
        var itemIndexFound = c.determineRandomNumberInRange(0, foodItemInfoOptions.length - 1, "which foraging food found");
        var foodItem = new Gear.Item(
            foodItemInfoOptions[itemIndexFound],
            c.ITEM_CONDITION_NEW,
            Gear.generateRandomItemQuality(),
            1,
            c.cloneDate(gx.gs.currentDate));
        return foodItem;
    };

    Gear.huntingResultNoGear = function (terrainTypeId) {
        var foodItemInfoOptions = Gear.identifyFindableFoodTypes(terrainTypeId, true);
        var itemIndexFound = c.determineRandomNumberInRange(0, foodItemInfoOptions.length - 1, "which hunted food found without gear");
        var foodItem = new Gear.Item(
            foodItemInfoOptions[itemIndexFound],
            c.ITEM_CONDITION_NEW,
            Gear.generateRandomItemQuality(),
            1,
            c.cloneDate(gx.gs.currentDate));
        return foodItem;
    };

    Gear.huntingResult = function (terrainType, gearSelection) {
        // todo: consider item
        var foodItemInfoOptions = Gear.identifyFindableFoodTypes(terrainType, true);
        var itemIndexFound = c.determineRandomNumberInRange(0, foodItemInfoOptions.length - 1, "which hunted food found");
        var foodItem = new Gear.Item(
            foodItemInfoOptions[itemIndexFound],
            c.ITEM_CONDITION_NEW,
            Gear.generateRandomItemQuality(),
            1,
            c.cloneDate(gx.gs.currentDate));
        return foodItem;
    };

    Gear.GearSet = {};

    //////////////////////////////            SPECIAL

    Gear.GearSet.writingKit = new Gear.ItemInfo(
        "writing kit",
        "a small chest containing a thick leather-bound book of blank pages, bottles of ink, and some quill pens",
        c.ITEM_SIZE_TWO_HANDS,
        c.ITEM_TYPE_SPECIAL, new Gear.ItemTypeSpecificNone(),
        3, [2, 6, 10, 500],
        false, true, false, false, false, c.INFINITY, []);

    Gear.GearSet.mapOfZerbat = new Gear.ItemInfo(
        "map of Zerbat Island",
        "piece of parchment, with a drawn and colored map of the Island of Zerbat",
        c.ITEM_SIZE_TINY,
        c.ITEM_TYPE_SPECIAL, new Gear.ItemTypeSpecificNone(),
        0.01, [.1, 2, 4, 100],
        false, true, false, false, false, c.INFINITY, []);

    //////////////////////////////            WEAPONS

    Gear.GearSet.body = new Gear.ItemInfo(
        "body",
        "an adult human body",
        c.ITEM_SIZE_TWO_MEN,
        c.ITEM_TYPE_WEAPON, new Gear.ItemTypeSpecificWeapon(.1, .1, .08),
        160, [0, 0, 0, 0],
        false, true, true, true, true, 30000, [Skills.SkillSet.bareHanded]);
    Skills.SkillSet.hunting.associatedItemTypes.push(Gear.GearSet.body);
    Skills.SkillSet.bareHanded.associatedItemTypes.push(Gear.GearSet.body);

    Gear.GearSet.spear = new Gear.ItemInfo(
        "stone-tipped spear",
        "wooden shaft with a stone spearhead lashed to the end",
        c.ITEM_SIZE_TWO_HANDS,
        c.ITEM_TYPE_WEAPON, new Gear.ItemTypeSpecificWeapon(.5, .3, 1),
        4, [.4, .8, 2, 10],
        false, false, true, true, false, c.INFINITY, [Skills.SkillSet.spear]);
    Skills.SkillSet.hunting.associatedItemTypes.push(Gear.GearSet.spear);
    Skills.SkillSet.spear.associatedItemTypes.push(Gear.GearSet.spear);

    Gear.GearSet.dagger = new Gear.ItemInfo(
        "dagger",
        "a wicked-looking iron knife with a leather-wrapped hilt",
        c.ITEM_SIZE_IN_HAND,
        c.ITEM_TYPE_WEAPON, new Gear.ItemTypeSpecificWeapon(.55, .2, .2),
        1, [.8, 1.5, 7, 39],
        false, false, true, true, false, c.INFINITY, [Skills.SkillSet.dagger]);
    Skills.SkillSet.hunting.associatedItemTypes.push(Gear.GearSet.dagger);
    Skills.SkillSet.dagger.associatedItemTypes.push(Gear.GearSet.dagger);

    Gear.GearSet.pick = new Gear.ItemInfo(
        "pick",
        "a sturdy pick, useful for mining",
        c.ITEM_SIZE_TWO_HANDS,
        c.ITEM_TYPE_WEAPON, new Gear.ItemTypeSpecificWeapon(.3, .1, 0),
        9.5, [1, 1.5, 2, 3],
        false, false, true, false, false, c.INFINITY, [Skills.SkillSet.pick]);
    Skills.SkillSet.pick.associatedItemTypes.push(Gear.GearSet.pick);

    //////////////////////////////            ARMOR

    Gear.GearSet.adultClothingMale = new Gear.ItemInfo(
        "men's clothing",
        "set of clothing for one normal-sized adult male",
        c.ITEM_SIZE_TWO_HANDS,
        c.ITEM_TYPE_ARMOR, new Gear.ItemTypeSpecificArmor(0, .05),
        4, [1.3, 4, 10, 110],
        false, false, false, false, true, 360, []);

    Gear.GearSet.adultClothingFemale = new Gear.ItemInfo(
        "women's clothing",
        "set of clothing for one normal-sized adult female",
        c.ITEM_SIZE_TWO_HANDS,
        c.ITEM_TYPE_ARMOR, new Gear.ItemTypeSpecificArmor(0, .05),
        4, [1.5, 5, 12, 120],
        false, false, false, false, true, 360, []);

    Gear.GearSet.bootsOfWaterWalking = new Gear.ItemInfo(
        "Boots of Water Walking",
        "magical boots that allow the wearer to walk across the surface of water",
        c.ITEM_SIZE_TWO_HANDS,
        c.ITEM_TYPE_ARMOR, new Gear.ItemTypeSpecificArmor(.01, .03),
        2.41, [1000, 1300, 2000, 4000],
        true, false, false, false, false, c.INFINITY, []);

    //////////////////////////////            EQUIPMENT

    Gear.GearSet.backpack = new Gear.ItemInfo(
        "backpack",
        "allows the wearer to more easily carry items",
        c.ITEM_SIZE_TWO_HANDS,
        c.ITEM_TYPE_EQUIPMENT, new Gear.ItemTypeSpecificNone(),
        3.5, [1, 2, 10, 85],
        false, false, false, false, false, c.INFINITY, []);

    Gear.GearSet.torch = new Gear.ItemInfo(
        "torch",
        "provides light for about an hour",
        c.ITEM_SIZE_TWO_HANDS,
        c.ITEM_TYPE_EQUIPMENT, new Gear.ItemTypeSpecificLightSource(1),
        2.25, [.15,.15,.15,.15],
        false, false, false, false, false, c.INFINITY, []);

    Gear.GearSet.lamp = new Gear.ItemInfo(
        "lamp",
        "provides light if you have some lamp oil",
        c.ITEM_SIZE_IN_HAND,
        c.ITEM_TYPE_EQUIPMENT, new Gear.ItemTypeSpecificLightSource(c.INFINITY),
        .3, [.5,.72,1.5,3.5],
        false, false, false, false, false, c.INFINITY, []);

    Gear.GearSet.lantern = new Gear.ItemInfo(
        "lantern",
        "provides light if you have some lamp oil",
        c.ITEM_SIZE_TWO_HANDS,
        c.ITEM_TYPE_EQUIPMENT, new Gear.ItemTypeSpecificLightSource(c.INFINITY),
        1.3, [.4,.5,.8,1.8],
        false, false, false, false, false, c.INFINITY, []);

    Gear.GearSet.oil = new Gear.ItemInfo(
        "oil",
        "a small pouch of oil, good for lamps and other things",
        c.ITEM_SIZE_IN_HAND,
        c.ITEM_TYPE_EQUIPMENT, new Gear.ItemTypeSpecificLightSource(4),
        .2, [.05,.05,.05,.05],
        false, false, false, false, false, c.INFINITY, []);

    Gear.GearSet.coal = new Gear.ItemInfo(
        "coal",
        "a lump of coal, very black and dirty",
        c.ITEM_SIZE_IN_HAND,
        c.ITEM_TYPE_EQUIPMENT, new Gear.ItemTypeSpecificNone(),
        .1, [.001, .001, .001, .001],
        false, false, false, false, false, c.INFINITY, []);

    Gear.GearSet.coalSack = new Gear.ItemInfo(
        "sack of coal",
        "a sack of black, dirty coal",
        c.ITEM_SIZE_IN_HAND,
        c.ITEM_TYPE_EQUIPMENT, new Gear.ItemTypeSpecificNone(),
        10, [.1, .1, .1, .1],
        false, false, false, false, false, c.INFINITY, []);

    Gear.GearSet.shovel = new Gear.ItemInfo(
        "shovel",
        "a wooden handle and metal scoop make a shovel",
        c.ITEM_SIZE_TWO_HANDS,
        c.ITEM_TYPE_EQUIPMENT, new Gear.ItemTypeSpecificNone(),
        2.1, [.8, 1.1, 1.5, 2.5],
        false, false, false, false, false, c.INFINITY, []);

    //////////////////////////////            FOOD (from foraging)

    Gear.GearSet.kelp = new Gear.ItemInfo(
        "kelp",
        "a slippery rope of light brown kelp, theoretically edible, but highly unsatisfying",
        c.ITEM_SIZE_TWO_HANDS,
        c.ITEM_TYPE_FOOD, new Gear.ItemTypeSpecificFood(2, c.TERRAIN_TYPE_SHORE, false),
        2.1, [.01, .02, .03, .1],
        false, false, false, false, true, 7, []);

    Gear.GearSet.bullKelp = new Gear.ItemInfo(
        "bull kelp",
        "a large slippery rope of dark brown kelp, theoretically edible, but horrible regardless",
        c.ITEM_SIZE_TWO_ARMS,
        c.ITEM_TYPE_FOOD, new Gear.ItemTypeSpecificFood(8, c.TERRAIN_TYPE_OCEAN, false),
        7, [.02, .04, .06, .2],
        false, false, false, false, true, 7, []);

    Gear.GearSet.walnuts = new Gear.ItemInfo(
        "walnuts",
        "a bag of brown, hard walnuts",
        c.ITEM_SIZE_TWO_HANDS,
        c.ITEM_TYPE_FOOD, new Gear.ItemTypeSpecificFood(4, c.TERRAIN_TYPE_MTN_OVER_PLAINS, false),
        2, [1, 1.2, 1.6, 2.2],
        false, false, false, false, true, 550, []);

    Gear.GearSet.hazelnuts = new Gear.ItemInfo(
        "hazelnuts",
        "a bag of hazelnuts",
        c.ITEM_SIZE_TWO_HANDS,
        c.ITEM_TYPE_FOOD, new Gear.ItemTypeSpecificFood(4, c.TERRAIN_TYPE_MTN_OVER_PINE, false),
        2.5, [1.1, 1.3, 1.7, 2.4],
        false, false, false, false, true, 660, []);

    Gear.GearSet.brazilnuts = new Gear.ItemInfo(
        "brazilnuts",
        "a bag of brazilnuts",
        c.ITEM_SIZE_TWO_HANDS,
        c.ITEM_TYPE_FOOD, new Gear.ItemTypeSpecificFood(4, c.TERRAIN_TYPE_MTN_OVER_JUNGLE, false),
        2.6, [2.1, 2.3, 2.7, 3.4],
        false, false, false, false, true, 660, []);

    Gear.GearSet.pecans = new Gear.ItemInfo(
        "pecans",
        "a bag of pecans",
        c.ITEM_SIZE_TWO_HANDS,
        c.ITEM_TYPE_FOOD, new Gear.ItemTypeSpecificFood(4, c.TERRAIN_TYPE_MTN_OVER_DESERT, false),
        2.7, [2.2, 2.3, 2.8, 4.4],
        false, false, false, false, true, 560, []);

    Gear.GearSet.wheat = new Gear.ItemInfo(
        "wheat",
        "a bag of whole wheat grains",
        c.ITEM_SIZE_TWO_HANDS,
        c.ITEM_TYPE_FOOD, new Gear.ItemTypeSpecificFood(8, c.TERRAIN_TYPE_PLAIN, false),
        5, [.2, .3, .6, 1],
        false, false, false, false, true, 53, []);

    Gear.GearSet.corn = new Gear.ItemInfo(
        "corn",
        "a large bag of corn ears",
        c.ITEM_SIZE_TWO_ARMS,
        c.ITEM_TYPE_FOOD, new Gear.ItemTypeSpecificFood(10, c.TERRAIN_TYPE_PLAIN, false),
        22.7, [.35, .5, .72, 1.1],
        false, false, false, false, true, 14, []);

    Gear.GearSet.blackberries = new Gear.ItemInfo(
        "blackberries",
        "a gourd full of ripe, sweet blackberries",
        c.ITEM_SIZE_TWO_HANDS,
        c.ITEM_TYPE_FOOD, new Gear.ItemTypeSpecificFood(1, c.TERRAIN_TYPE_PINE_FOREST, false),
        1, [.1, .13, .2, 4.2],
        false, false, false, false, true, 4, []);

    Gear.GearSet.mushrooms = new Gear.ItemInfo(
        "mushrooms",
        "a gourd full of white edible mushrooms",
        c.ITEM_SIZE_TWO_HANDS,
        c.ITEM_TYPE_FOOD, new Gear.ItemTypeSpecificFood(1, c.TERRAIN_TYPE_PINE_FOREST, false),
        .9, [.25, .43, .8, 1.1],
        false, false, false, false, true, 13, []);

    Gear.GearSet.apples = new Gear.ItemInfo(
        "apples",
        "a bag of ripe, red apples",
        c.ITEM_SIZE_TWO_HANDS,
        c.ITEM_TYPE_FOOD, new Gear.ItemTypeSpecificFood(10, c.TERRAIN_TYPE_PINE_FOREST, false),
        2, [.2, .2, .2, .5],
        false, false, false, false, true, 20, []);

    Gear.GearSet.lillyPadBulbs = new Gear.ItemInfo(
        "lilly pad bulbs",
        "a bundle of lilly pad bulbs, quite tasty in soup",
        c.ITEM_SIZE_TWO_HANDS,
        c.ITEM_TYPE_FOOD, new Gear.ItemTypeSpecificFood(5, c.TERRAIN_TYPE_LAKE, false),
        3.6, [1, 1.3, 1.7, 3.5],
        false, false, false, false, true, 120, []);

    Gear.GearSet.chopRoot = new Gear.ItemInfo(
        "chop root",
        "a large, bitter, rubbery root that can be chopped into pieces, boiled and eaten",
        c.ITEM_SIZE_TWO_HANDS,
        c.ITEM_TYPE_FOOD, new Gear.ItemTypeSpecificFood(6, c.TERRAIN_TYPE_RIVER, false),
        4, [.1, .2, .5, .9],
        false, false, false, false, true, 46, []);

    Gear.GearSet.bananas = new Gear.ItemInfo(
        "bananas",
        "a bunch of yellow bananas",
        c.ITEM_SIZE_TWO_HANDS,
        c.ITEM_TYPE_FOOD, new Gear.ItemTypeSpecificFood(13, c.TERRAIN_TYPE_JUNGLE, false),
        2, [.2, .2, .2, .5],
        false, false, false, false, true, 15, []);

    Gear.GearSet.passionFruit = new Gear.ItemInfo(
        "passion fruit",
        "a small sack of red juicy passion fruit",
        c.ITEM_SIZE_TWO_HANDS,
        c.ITEM_TYPE_FOOD, new Gear.ItemTypeSpecificFood(6, c.TERRAIN_TYPE_JUNGLE, false),
        2, [.2, .22, .25, .35],
        false, false, false, false, true, 11, []);

    Gear.GearSet.tubers = new Gear.ItemInfo(
        "tubers",
        "a small sack of muddy brown tubers",
        c.ITEM_SIZE_TWO_HANDS,
        c.ITEM_TYPE_FOOD, new Gear.ItemTypeSpecificFood(5, c.TERRAIN_TYPE_JUNGLE, false),
        4, [.2, .22, .25, .35],
        false, false, false, false, true, 34, []);

    Gear.GearSet.coconut = new Gear.ItemInfo(
        "coconut",
        "a hard, ripe coconut, removed from the husk",
        c.ITEM_SIZE_TWO_HANDS,
        c.ITEM_TYPE_FOOD, new Gear.ItemTypeSpecificFood(1, c.TERRAIN_TYPE_DESERT, false),
        1.2, [.1, .28, .42, .82],
        false, false, false, false, true, 70, []);

    Gear.GearSet.brownbread = new Gear.ItemInfo(
        "brownbread",
        "one loaf of dark brown molasses bread",
        c.ITEM_SIZE_TWO_HANDS,
        c.ITEM_TYPE_FOOD, new Gear.ItemTypeSpecificFood(8, c.TERRAIN_TYPE_TOWN, false),
        2, [.1, .2, .4, 1.2],
        false, false, false, false, true, 6, []);

    Gear.GearSet.brownbread = new Gear.ItemInfo(
        "pumpkin",
        "a large, tasty-looking pumpkin",
        c.ITEM_SIZE_TWO_HANDS,
        c.ITEM_TYPE_FOOD, new Gear.ItemTypeSpecificFood(6, c.TERRAIN_TYPE_AGRICULTURAL, false),
        10, [.1, .2, .4, 1.2],
        false, false, false, false, true, 16, []);

    Gear.GearSet.whiteroot = new Gear.ItemInfo(
        "whiteroot",
        "a large, stringy, slimy whiteroot",
        c.ITEM_SIZE_TWO_HANDS,
        c.ITEM_TYPE_FOOD, new Gear.ItemTypeSpecificFood(3, c.TERRAIN_TYPE_SWAMP, false),
        2, [.1, .3, .4, 1.2],
        false, false, false, false, true, 15, []);

    //////////////////////////////            FOOD (from hunting)

    Gear.GearSet.crab = new Gear.ItemInfo(
        "crab",
        "a large saltwater crab",
        c.ITEM_SIZE_TWO_HANDS,
        c.ITEM_TYPE_FOOD, new Gear.ItemTypeSpecificFood(2, c.TERRAIN_TYPE_SHORE, true),
        2, [1, 1.2, 1.5, 5],
        false, false, false, false, true, 1, []);

    Gear.GearSet.clams = new Gear.ItemInfo(
        "clams",
        "a double handful of small saltwater clams",
        c.ITEM_SIZE_TWO_HANDS,
        c.ITEM_TYPE_FOOD, new Gear.ItemTypeSpecificFood(1, c.TERRAIN_TYPE_SHORE, true),
        1.8, [.2, .22, .5, .8],
        false, false, false, false, true, 1, []);

    Gear.GearSet.seaBass = new Gear.ItemInfo(
        "sea bass",
        "several medium-sized saltwater flatfish",
        c.ITEM_SIZE_TWO_ARMS,
        c.ITEM_TYPE_FOOD, new Gear.ItemTypeSpecificFood(10, c.TERRAIN_TYPE_OCEAN, true),
        15, [.4, .45, .5, 2],
        false, false, false, false, true, 2, []);

    Gear.GearSet.mountainSheep = new Gear.ItemInfo(
        "mountain sheep",
        "a large amount of somewhat greasy mutton",
        c.ITEM_SIZE_TWO_ARMS,
        c.ITEM_TYPE_FOOD, new Gear.ItemTypeSpecificFood(20, c.TERRAIN_TYPE_MTN_OVER_PLAINS, true),
        50, [7.2, 9.2, 11.3, 20],
        false, false, false, false, true, 12, []);

    Gear.GearSet.mountainGoat = new Gear.ItemInfo(
        "mountain goat",
        "a large amount of somewhat greasy goat meat",
        c.ITEM_SIZE_TWO_ARMS,
        c.ITEM_TYPE_FOOD, new Gear.ItemTypeSpecificFood(20, c.TERRAIN_TYPE_MTN_OVER_PINE, true),
        50, [7.2, 9.2, 11.3, 20],
        false, false, false, false, true, 12, []);

    Gear.GearSet.toucan = new Gear.ItemInfo(
        "toucan",
        "a scrawny, but large-billed, bird",
        c.ITEM_SIZE_TWO_HANDS,
        c.ITEM_TYPE_FOOD, new Gear.ItemTypeSpecificFood(1, c.TERRAIN_TYPE_MTN_OVER_JUNGLE, true),
        1.4, [.2, .24, .3, .6],
        false, false, false, false, true, 4, []);

    Gear.GearSet.toucan = new Gear.ItemInfo(
        "raven",
        "a scrawny, gamey black bird",
        c.ITEM_SIZE_TWO_HANDS,
        c.ITEM_TYPE_FOOD, new Gear.ItemTypeSpecificFood(1, c.TERRAIN_TYPE_MTN_OVER_DESERT, true),
        1.4, [.21, .27, .4, .66],
        false, false, false, false, true, 4, []);

    Gear.GearSet.buffalo = new Gear.ItemInfo(
        "buffalo",
        "a vast amount of buffalo meat",
        c.ITEM_SIZE_TWO_MEN,
        c.ITEM_TYPE_FOOD, new Gear.ItemTypeSpecificFood(80, c.TERRAIN_TYPE_PLAIN, true),
        100, [25, 30, 40, 62],
        false, false, false, false, true, 12, []);

    Gear.GearSet.jackrabbit = new Gear.ItemInfo(
        "jackrabbit",
        "a large, tough rabbit",
        c.ITEM_SIZE_TWO_HANDS,
        c.ITEM_TYPE_FOOD, new Gear.ItemTypeSpecificFood(3, c.TERRAIN_TYPE_PLAIN, true),
        4, [.4, .6, .8, 1.2],
        false, false, false, false, true, 12, []);

    Gear.GearSet.deer = new Gear.ItemInfo(
        "deer",
        "a large amount of dear meat",
        c.ITEM_SIZE_TWO_ARMS,
        c.ITEM_TYPE_FOOD, new Gear.ItemTypeSpecificFood(20, c.TERRAIN_TYPE_PINE_FOREST, true),
        50, [7.2, 9.2, 11.3, 20],
        false, false, false, false, true, 12, []);

    Gear.GearSet.rabbit = new Gear.ItemInfo(
        "rabbit",
        "a medium-sized brown rabbit",
        c.ITEM_SIZE_TWO_HANDS,
        c.ITEM_TYPE_FOOD, new Gear.ItemTypeSpecificFood(1, c.TERRAIN_TYPE_PINE_FOREST, true),
        2, [.2, .3, .4, .8],
        false, false, false, false, true, 12, []);

    Gear.GearSet.lakeTrout = new Gear.ItemInfo(
        "lake trout",
        "several silvery medium-sized freshwater fish",
        c.ITEM_SIZE_TWO_HANDS,
        c.ITEM_TYPE_FOOD, new Gear.ItemTypeSpecificFood(6, c.TERRAIN_TYPE_LAKE, true),
        5, [.2, .2, .2, 1],
        false, false, false, false, true, 2, []);

    Gear.GearSet.riverBass = new Gear.ItemInfo(
        "river bass",
        "several brown medium-sized freshwater fish",
        c.ITEM_SIZE_TWO_HANDS,
        c.ITEM_TYPE_FOOD, new Gear.ItemTypeSpecificFood(4, c.TERRAIN_TYPE_RIVER, true),
        3.15, [.25, .25, .25, 1.5],
        false, false, false, false, true, 2, []);

    Gear.GearSet.boar = new Gear.ItemInfo(
        "boar",
        "a large amount of boar meat",
        c.ITEM_SIZE_TWO_ARMS,
        c.ITEM_TYPE_FOOD, new Gear.ItemTypeSpecificFood(20, c.TERRAIN_TYPE_JUNGLE, true),
        55, [7.1, 8.2, 10.3, 24],
        false, false, false, false, true, 10, []);

    Gear.GearSet.snake = new Gear.ItemInfo(
        "snake",
        "a medium-sized green snake",
        c.ITEM_SIZE_TWO_HANDS,
        c.ITEM_TYPE_FOOD, new Gear.ItemTypeSpecificFood(1, c.TERRAIN_TYPE_JUNGLE, true),
        2, [.21, .31, .41, .82],
        false, false, false, false, true, 10, []);

    Gear.GearSet.lizard = new Gear.ItemInfo(
        "lizard",
        "a bundle of spindly lizards",
        c.ITEM_SIZE_TWO_HANDS,
        c.ITEM_TYPE_FOOD, new Gear.ItemTypeSpecificFood(2, c.TERRAIN_TYPE_DESERT, true),
        1.2, [.26, .36, .46, .87],
        false, false, false, false, true, 19, []);

    Gear.GearSet.dog = new Gear.ItemInfo(
        "dog",
        "an unfortunately edible dog",
        c.ITEM_SIZE_TWO_HANDS,
        c.ITEM_TYPE_FOOD, new Gear.ItemTypeSpecificFood(5, c.TERRAIN_TYPE_TOWN, true),
        5.1, [.16, .26, .36, .47],
        false, false, false, false, true, 17, []);

    Gear.GearSet.duck = new Gear.ItemInfo(
        "duck",
        "a white duck that looks tasty",
        c.ITEM_SIZE_TWO_HANDS,
        c.ITEM_TYPE_FOOD, new Gear.ItemTypeSpecificFood(2, c.TERRAIN_TYPE_AGRICULTURAL, true),
        2.1, [.26, .36, .46, .57],
        false, false, false, false, true, 11, []);

    Gear.GearSet.alligator = new Gear.ItemInfo(
        "alligator",
        "a smallish, roughed-up looking alligator",
        c.ITEM_SIZE_TWO_HANDS,
        c.ITEM_TYPE_FOOD, new Gear.ItemTypeSpecificFood(2, c.TERRAIN_TYPE_SWAMP, true),
        2.1, [.66, .76, .86, .97],
        false, false, false, false, true, 12, []);

    //////////////////////////////            FOOD (from merchants)

    Gear.GearSet.bread = new Gear.ItemInfo(
        "bread",
        "one loaf of heavy, crusty bread",
        c.ITEM_SIZE_TWO_HANDS,
        c.ITEM_TYPE_FOOD, new Gear.ItemTypeSpecificFood(8, c.TERRAIN_TYPE_TOWN, false),
        2, [.1, .2, .4, 1.2],
        false, false, false, false, true, 6, []);

    Gear.GearSet.trailRations = new Gear.ItemInfo(
        "trail rations",
        "one jar of bland ready-to-eat preserved meat",
        c.ITEM_SIZE_TWO_HANDS,
        c.ITEM_TYPE_FOOD, new Gear.ItemTypeSpecificFood(8, c.TERRAIN_TYPE_TOWN, true),
        2, [.5, .7, 1, 2],
        false, false, false, false, true, 730, []);

    //////////////////////////////            TREASURE

    Gear.GearSet.goldBead = new Gear.ItemInfo(
        "goldbead",
        "a tiny bead of refined, purified gold, with a hole in the middle. Used as currency. Can be strung together and worn",
        c.ITEM_SIZE_TINY,
        c.ITEM_TYPE_TREASURE, new Gear.ItemTypeSpecificNone(),
        0.001, [1, 1, 1, 1],
        false, false, false, false, false, c.INFINITY, []);

    Gear.GearSet.paperMoney = new Gear.ItemInfo(
        "paper money",
        "a piece of durable paper with a fancy engraving on it. Used as currency in some places.",
        c.ITEM_SIZE_TINY,
        c.ITEM_TYPE_TREASURE, new Gear.ItemTypeSpecificNone(),
        0.001, [0, 0, 0, 0],
        false, false, false, false, false, c.INFINITY, []);

    Gear.GearSet.roughTopaz = new Gear.ItemInfo(
        "rough topaz",
        "an uncut topaz. It glimmers dully yellow.",
        c.ITEM_SIZE_TINY,
        c.ITEM_TYPE_TREASURE, new Gear.ItemTypeSpecificNone(),
        0.001, [9.1, 18.5, 36, 63],
        false, false, false, false, false, c.INFINITY, []);

    Gear.GearSet.cutTopaz = new Gear.ItemInfo(
        "cut topaz",
        "a cut topaz. It glimmers brilliantly yellow.",
        c.ITEM_SIZE_TINY,
        c.ITEM_TYPE_TREASURE, new Gear.ItemTypeSpecificNone(),
        0.001, [18, 36.1, 70, 113.7],
        false, false, false, false, false, c.INFINITY, []);

    Gear.GearSet.roughDiamond = new Gear.ItemInfo(
        "rough diamond",
        "An uncut diamond. It glimmers dully.",
        c.ITEM_SIZE_TINY,
        c.ITEM_TYPE_TREASURE, new Gear.ItemTypeSpecificNone(),
        0.001, [10, 20.5, 41, 87.5],
        false, false, false, false, false, c.INFINITY, []);

    Gear.GearSet.cutDiamond = new Gear.ItemInfo(
        "cut diamond",
        "A cut diamond. It glimmers brilliantly.",
        c.ITEM_SIZE_TINY,
        c.ITEM_TYPE_TREASURE, new Gear.ItemTypeSpecificNone(),
        0.001, [20, 41, 80, 175.3],
        false, false, false, false, false, c.INFINITY, []);

    Gear.GearSet.roughSapphire = new Gear.ItemInfo(
        "rough sapphire",
        "an uncut sapphire. It glimmers dully blue.",
        c.ITEM_SIZE_TINY,
        c.ITEM_TYPE_TREASURE, new Gear.ItemTypeSpecificNone(),
        0.001, [10, 20.5, 41, 87.5],
        false, false, false, false, false, c.INFINITY, []);

    Gear.GearSet.cutSapphire = new Gear.ItemInfo(
        "cut sapphire",
        "a cut sapphire. It glimmers brilliantly blue.",
        c.ITEM_SIZE_TINY,
        c.ITEM_TYPE_TREASURE, new Gear.ItemTypeSpecificNone(),
        0.001, [20, 40.5, 81, 180.5],
        false, false, false, false, false, c.INFINITY, []);

    Gear.GearSet.roughEmerald = new Gear.ItemInfo(
        "rough emerald",
        "an uncut emerald. It glimmers dully green.",
        c.ITEM_SIZE_TINY,
        c.ITEM_TYPE_TREASURE, new Gear.ItemTypeSpecificNone(),
        0.001, [10, 20.5, 41, 87.5],
        false, false, false, false, false, c.INFINITY, []);

    Gear.GearSet.cutEmerald = new Gear.ItemInfo(
        "cut emerald",
        "a cut emerald. It glimmers brilliantly green.",
        c.ITEM_SIZE_TINY,
        c.ITEM_TYPE_TREASURE, new Gear.ItemTypeSpecificNone(),
        0.001, [25, 45, 85, 184],
        false, false, false, false, false, c.INFINITY, []);

    Gear.GearSet.roughRuby = new Gear.ItemInfo(
        "rough ruby",
        "an uncut ruby. This is the most rare and valuable of the precious stones. It glimmers dully red.",
        c.ITEM_SIZE_TINY,
        c.ITEM_TYPE_TREASURE, new Gear.ItemTypeSpecificNone(),
        0.001, [15, 26.5, 49, 101.3],
        false, false, false, false, false, c.INFINITY, []);

    Gear.GearSet.cutRuby = new Gear.ItemInfo(
        "cut ruby",
        "a cut ruby. This is the most rare and valuable of the precious stones. It glimmers brilliantly red.",
        c.ITEM_SIZE_TINY,
        c.ITEM_TYPE_TREASURE, new Gear.ItemTypeSpecificNone(),
        0.001, [35, 55.3, 103.15, 210.9],
        false, false, false, false, false, c.INFINITY, []);

    Gear.GearSet.ironOre = new Gear.ItemInfo(
        "iron ore",
        "a large rock containing significant iron deposits",
        c.ITEM_SIZE_TWO_ARMS,
        c.ITEM_TYPE_TREASURE, new Gear.ItemTypeSpecificNone(),
        50, [.05,.07,.1,.15],
        false, false, false, false, false, c.INFINITY, []);

    Gear.GearSet.copperOre = new Gear.ItemInfo(
        "copper ore",
        "a large rock containing significant copper deposits",
        c.ITEM_SIZE_TWO_ARMS,
        c.ITEM_TYPE_TREASURE, new Gear.ItemTypeSpecificNone(),
        50, [.15,.17,.2,.45],
        false, false, false, false, false, c.INFINITY, []);

    Gear.GearSet.silverOre = new Gear.ItemInfo(
        "silver ore",
        "a large rock containing significant silver deposits",
        c.ITEM_SIZE_TWO_ARMS,
        c.ITEM_TYPE_TREASURE, new Gear.ItemTypeSpecificNone(),
        50, [.35,.47,.6,1],
        false, false, false, false, false, c.INFINITY, []);

    Gear.GearSet.goldOre = new Gear.ItemInfo(
        "gold ore",
        "a large rock containing significant gold deposits",
        c.ITEM_SIZE_TWO_ARMS,
        c.ITEM_TYPE_TREASURE, new Gear.ItemTypeSpecificNone(),
        50, [2.1,2.6,3.5,6.7],
        false, false, false, false, false, c.INFINITY, []);

    Gear.GearSet.mithrilOre = new Gear.ItemInfo(
        "mithril ore",
        "a large rock containing significant mithril deposits",
        c.ITEM_SIZE_TWO_ARMS,
        c.ITEM_TYPE_TREASURE, new Gear.ItemTypeSpecificNone(),
        50, [18, 25, 38, 61],
        false, false, false, false, false, c.INFINITY, []);

    return Gear;
});
