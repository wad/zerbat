define([
    'app/constants',
    'app/gameContext',
    'app/world',
    'app/map',
    'app/places',
    'app/gear',
    'app/gui',
    'app/status'], function (c, gx, World, Map, Places, Gear, Gui, Status) {

    var Area = {};

    Area._getTableHtml = function (tableClass) {
        var html = [];
        html.push('<table class="' + tableClass + ' zTable">');
        html.push('<tbody>');
        html.push('<tr>');
        html.push('<th>item</th>');
        html.push('<th>description</th>');
        html.push('<th>size</th>');
        html.push('<th>type</th>');
        html.push('<th>quality</th>');
        html.push('<th>condition</th>');
        html.push('<th>quantity</th>');
        html.push('<th>actions</th>');
        html.push('</tr>');
        html.push('</tbody>');
        html.push('</table>');
        return html.join("\n");
    };

    Area._getRowHtml = function (tableClass, item, placeId, gearEntryRowIndex, actionButtonText) {
        return [
            '<tr>',
            '<td>' + item.itemInfo.itemName + '</td>',
            '<td>' + item.itemInfo.description + '</td>',
            '<td>' + c.ITEM_SIZE_NAMES[item.itemInfo.itemSize] + '</td>',
            '<td>' + c.ITEM_TYPE_NAMES[item.itemInfo.itemType] + '</td>',
            '<td>' + c.ITEM_QUALITY_NAMES[item.quality] + '</td>',
            '<td>' + c.ITEM_CONDITION_NAMES[item.condition] + '</td>',
            '<td id="quantityId_' + placeId + '_' + gearEntryRowIndex + '">' + item.quantity + '</td>',
            '<td>',
            '<input type="button" role="button" class="buttonControl zButton zButtonItemTake" value="',
            actionButtonText,
            '" id="buttonItemAction_',
            placeId,
            '_',
            gearEntryRowIndex,
            '">',
            '</td>',
            '</tr>'
        ].join("");
    };

    Area._setButtonClickOnGet = function (item, place, gearEntryRowIndex) {
        $("#buttonItemAction_" + place.placeId + "_" + gearEntryRowIndex).click(function () {
            if (item.quantity > 0) {
                item.quantity--;
                var obtainedItem = item.clone();
                obtainedItem.quantity = 1;
                obtainedItem.acquisitionDate = c.cloneDate(gx.gs.currentDate);
                Gear.addItem(gx.gs.playerGear, obtainedItem);
                $("#quantityId_" + place.placeId + "_" + gearEntryRowIndex).text(item.quantity);
            }
        });
    };

    Area._setButtonClickOnPut = function (item, place, gearFromInventoryEntryRowIndex) {
        $("#buttonItemAction_" + place.placeId + "_" + gearFromInventoryEntryRowIndex).click(function () {
            if (item.quantity > 0) {
                item.quantity--;
                var placedItem = item.clone();
                placedItem.quantity = 1;
                Gear.addItem(place.placeDetail.items, placedItem);
                $("#quantityId_" + place.placeId + "_" + gearFromInventoryEntryRowIndex).text(item.quantity);
            }
        });
    };

    Area._removeArea = function ($tabArea, place) {
        Places.removePlace(gx.gs.blocks, place);
        Map.refreshMap();
        Status.updateStatus();
    };

    Area._displayPageDescriptionOnly = function ($tabArea, place) {
        $tabArea.append('<p>You see ' + place.placeName + '. ' + place.placeDescription + '</p>');
        $tabArea.append('<p>' + place.placeDetail.placeDetailDescription + '</p>');
    };

    Area._displayPageLoot = function ($tabArea, place) {
        $tabArea.empty();
        if (place == null) {
            $tabArea.append('<p>There is no more loot here now.</p>');
            return;
        }
        $tabArea.append('<p>You see ' + place.placeName + '. ' + place.placeDescription + '</p>');
        place.placeDetail.items = Gear.combineCombinableGear(Gear.updateConditionOfItemsForDay(place.placeDetail.items), gx.gs.currentDate);
        var numItemsInLoot = place.placeDetail.items.length;
        if (numItemsInLoot === 0) {
            $tabArea.append('<p>There is nothing left in the pile of loot.</p>');
        } else {
            $tabArea.append('<p>There are ' + numItemsInLoot + ' items in the pile of loot.</p>');
        }
        $tabArea.append('<li><input type="button" class="zButton zStashButton zListButtonControl" value="Pick up items" id="buttonGetItemsFromLoot_' + place.placeId + '"/></li>');
        $tabArea.append('<li><input type="button" class="zButton zStashButton zListButtonControl" value="Abandon the loot pile" id="buttonDismantleLoot_' + place.placeId + '"/></li>');
        $(".zStashButton").button();
        $("#buttonGetItemsFromLoot_" + place.placeId).click(function () {
            if (place.placeDetail.items.length == 0) {
                Gui.showMessageDialog("There are no items in the pile of loot to take.");
            } else {
                var dialogIdTakeItems = gx.getNewUniqueId();
                $tabArea.append('<div id="' + dialogIdTakeItems + '"></div>');
                var $dialogTakeItems = $("#" + dialogIdTakeItems);
                $dialogTakeItems.append(Area._getTableHtml("zTakeFromStash"));
                var gearFromLootEntryRowIndex = 0;
                place.placeDetail.items.forEach(function (item) {
                    var row = Area._getRowHtml("zTakeFromStash", item, place.placeId, gearFromLootEntryRowIndex, "take");
                    $('.zTakeFromStash > tbody:last').append(row);
                    Area._setButtonClickOnGet(item, place, gearFromLootEntryRowIndex++);
                });
                $(".zButtonItemTake").button();
                $dialogTakeItems.dialog({
                    closeOnEscape: false,
                    dialogClass: "no-close",
                    modal: true,
                    width: "80%",
                    title: "Take items from the loot pile",
                    buttons: [
                        {
                            text: "Ok",
                            click: function () {
                                $(this).dialog("close");
                                $("#" + dialogIdTakeItems).remove();
                                place.placeDetail.items = Gear.combineCombinableGear(place.placeDetail.items, gx.gs.currentDate);
                                if (place.placeDetail.items.length === 0) {
                                    Area._removeArea($tabArea, place);
                                    Area._displayPageLoot($tabArea, null);
                                } else {
                                    Area._displayPageLoot($tabArea, place);
                                }
                            }
                        }
                    ]
                });
            }
        });
        $("#buttonDismantleLoot_" + place.placeId).click(function () {
            Area._removeArea($tabArea, place);
            Area._displayPageLoot($tabArea, null);
            Gui.showMessage("You abandon the remaining loot.");
        });
    };

    Area._displayPageStash = function ($tabArea, place) {
        gx.gs.playerGear = Gear.combineCombinableGear(gx.gs.playerGear, gx.gs.currentDate);
        $tabArea.empty();
        if (place == null) {
            $tabArea.append('<p>This stash is now gone.</p>');
            return;
        }
        if (Places.isStashStillHere(place)) {
            $tabArea.append('<p>' + place.placeDescription + '</p>');
            place.placeDetail.items = Gear.combineCombinableGear(Gear.updateConditionOfItemsForDay(place.placeDetail.items), gx.gs.currentDate);
            var numItemsInStash = place.placeDetail.items.length;
            if (numItemsInStash === 0) {
                $tabArea.append('<p>This stash is empty.</p>');
            } else {
                $tabArea.append('<p>This stash has ' + numItemsInStash + ' items in it.</p>');
            }
            $tabArea.append('<li><input type="button" class="zButton zStashButton zListButtonControl" value="Get items from stash" id="buttonGetItemsFromStash_' + place.placeId + '"/></li>');
            $tabArea.append('<li><input type="button" class="zButton zStashButton zListButtonControl" value="Put items in stash" id="buttonPutItemsInStash_' + place.placeId + '"/></li>');
            $tabArea.append('<li><input type="button" class="zButton zStashButton zListButtonControl" value="Dismantle stash" id="buttonDismantleStash_' + place.placeId + '"/></li>');
            $(".zStashButton").button();
            $("#buttonGetItemsFromStash_" + place.placeId).click(function () {
                if (place.placeDetail.items.length == 0) {
                    Gui.showMessageDialog("There are no items in the stash to take.");
                } else {
                    var dialogIdTakeItems = gx.getNewUniqueId();
                    $tabArea.append('<div id="' + dialogIdTakeItems + '"></div>');
                    var $dialogTakeItems = $("#" + dialogIdTakeItems);
                    $dialogTakeItems.append(Area._getTableHtml("zTakeFromStash"));
                    var gearFromStashEntryRowIndex = 0;
                    place.placeDetail.items.forEach(function (item) {
                        var row = Area._getRowHtml("zTakeFromStash", item, place.placeId, gearFromStashEntryRowIndex, "take");
                        $('.zTakeFromStash > tbody:last').append(row);
                        Area._setButtonClickOnGet(item, place, gearFromStashEntryRowIndex++);
                    });
                    $(".zButtonItemTake").button();
                    $dialogTakeItems.dialog({
                        closeOnEscape: false,
                        dialogClass: "no-close",
                        modal: true,
                        width: "80%",
                        title: "Take items from the stash",
                        buttons: [
                            {
                                text: "Ok",
                                click: function () {
                                    $(this).dialog("close");
                                    $("#" + dialogIdTakeItems).remove();
                                    Area._displayPageStash($tabArea, place);
                                }
                            }
                        ]
                    });
                }
            });
            $("#buttonPutItemsInStash_" + place.placeId).click(function () {
                var dialogIdStashItems = gx.getNewUniqueId();
                $tabArea.append('<div id="' + dialogIdStashItems + '"></div>');
                var $dialogStashItems = $("#" + dialogIdStashItems);
                $dialogStashItems.append(Area._getTableHtml("zPutInStash"));
                var gearFromInventoryEntryRowIndex = 0;
                var stashableGear = gx.gs.playerGear.filter(function (itemToCheck) {
                    return !itemToCheck.itemInfo.isQuest;
                });
                stashableGear.forEach(function (item) {
                    var row = Area._getRowHtml("zPutInStash", item, place.placeId, gearFromInventoryEntryRowIndex, "put");
                    $('.zPutInStash > tbody:last').append(row);
                    Area._setButtonClickOnPut(item, place, gearFromInventoryEntryRowIndex++);
                });
                $(".zButtonItemTake").button();
                $dialogStashItems.dialog({
                    closeOnEscape: false,
                    dialogClass: "no-close",
                    modal: true,
                    width: "80%",
                    title: "Put items into this stash",
                    buttons: [
                        {
                            text: "Ok",
                            click: function () {
                                $(this).dialog("close");
                                $("#" + dialogIdStashItems).remove();
                                Area._displayPageStash($tabArea, place);
                            }
                        }
                    ]
                });
            });
            $("#buttonDismantleStash_" + place.placeId).click(function () {
                if (place.placeDetail.items.length == 0) {
                    Area._removeArea($tabArea, place);
                    Area._displayPageStash($tabArea, null);
                    Gui.showMessage("You dismantle stash number " + place.placeDetail.stashNumber + ".");
                } else {
                    Gui.showMessageDialog("Take everything out of the stash first.");
                }
            });
        } else {
            Area._removeArea($tabArea, place);
            Area._displayPageStash($tabArea, null);
            Gui.showMessageDialog("This stash has been destroyed, and everything is gone!");
            Gui.showMessage("Stash number " + place.placeDetail.stashNumber + " has been destroyed.");
        }
    };

    Area._displayPageMine = function ($tabArea, place) {
        $tabArea.append('<p>You see ' + place.placeName + '. ' + place.placeDescription + '</p>');
        $tabArea.append('<p>' + place.placeDetail.placeDetailDescription + '</p>');

        if (place.placeDetail.isInUse) {
            $tabArea.append('<p>Several dirty-looking men are working here. You suspect that they are miners.</p>');
        } else {
            $tabArea.append('<p>Nobody seems to be around. The place looks deserted.</p>');
        }

        if (place.placeDetail.hasMonsters) {
            $tabArea.append('<p>You see some gnawed bones.</p>');
        }

        switch (place.placeDetail.itemTypeThatCanBeFound) {
            case Gear.GearSet.coal:
                $tabArea.append('<p>Judging by the piles of coal, it\'s a coal mine.</p>');
                break;
            case Gear.GearSet.roughTopaz:
            case Gear.GearSet.roughDiamond:
            case Gear.GearSet.roughSapphire:
            case Gear.GearSet.roughEmerald:
            case Gear.GearSet.roughRuby:
                $tabArea.append('<p>It appears to be some sort of gemstone mine, but you can\'t tell what kind of gemstone.</p>');
                break;
            case Gear.GearSet.ironOre:
            case Gear.GearSet.copperOre:
            case Gear.GearSet.silverOre:
            case Gear.GearSet.goldOre:
            case Gear.GearSet.mithrilOre:
                $tabArea.append('<p>It appears to be some sort of metal mine, but you can\'t tell what kind of metal.</p>');
                break;
            default:
                throw "Unknown mine type: " + place.placeDetail.itemTypeThatCanBeFound.itemName;
        }
    };

    Area._displayPageEncounter = function ($tabArea, place) {
        $tabArea.append('<p>You see ' + place.placeName + '. ' + place.placeDescription + '</p>');
        $tabArea.append('<p>' + place.placeDetail.placeDetailDescription + '</p>');
        // todo - write encounter code!
    };

    Area.showArea = function () {
        var $area = $('#tabs-area');
        $area.empty();

        var outerDiv = [];
        outerDiv.push('<p>' + gx.gs.descriptionOfCurrentLocation + '</p>');

        var tabAreaPlacesId = "tabs-area-places";
        var anyPlaces = gx.gs.placesAtCurrentLocation.length > 0;
        if (anyPlaces) {
            outerDiv.push('<div id="' + tabAreaPlacesId + '">');
            outerDiv.push('<ul class="zPlaceList">');
            gx.gs.placesAtCurrentLocation.forEach(function (place) {
                outerDiv.push('<li><a href="#tabs-area-' + place.placeId + '">' + place.tabName + '</a></li>');
            });
            outerDiv.push('</ul>');
            outerDiv.push('</div>');
        }

        $area.html(outerDiv.join("\n"));

        if (anyPlaces) {
            var $areaTabContainer = $('#' + tabAreaPlacesId);
            gx.gs.placesAtCurrentLocation.forEach(function (place) {

                var tabsAreaPlaceId = 'tabs-area-' + place.placeId;
                $areaTabContainer.append('<div id="' + tabsAreaPlaceId + '"></div>');
                var $tabArea = $("#" + tabsAreaPlaceId);

                switch (place.placeType) {
                    case c.PLACE_TYPE_NOTHING_OF_INTEREST:
                        throw "Should not get a 'nothing of interest' place type";
                    case c.PLACE_TYPE_DESCRIPTION_ONLY:
                        Area._displayPageDescriptionOnly($tabArea, place);
                        break;
                    case c.PLACE_TYPE_LOOT:
                        Area._displayPageLoot($tabArea, place);
                        break;
                    case c.PLACE_TYPE_STASH:
                        Area._displayPageStash($tabArea, place);
                        break;
                    case c.PLACE_TYPE_MINE:
                        Area._displayPageMine($tabArea, place);
                        break;
                    case c.PLACE_TYPE_ENCOUNTER:
                        Area._displayPageEncounter($tabArea, place);
                        break;
                    case c.PLACE_TYPE_CONVERSATION:
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
                    default:
                        alert("Unhandled place type: " + place.placeType);
                }
            });

            $areaTabContainer.tabs({ active: 0 });
        }
    };

    return Area;
});
