// this allows the player to cheat, assuming that they put the right password on the URL as a parameter.
// to cheat, you must use this URL: http://zerbat.com?cheat=please
// then open a javascript console, and run a cheat command, such as: cheat.giveApples()

define([
    'app/constants',
    'app/gameContext',
    'app/crew',
    'app/gear',
    'app/player',
    'app/map'], function (c, gx, Crew, Gear, Player, Map) {

    var Cheat = {};

    Cheat.isEnabled = function () {

        var urlParams = [];
        (window.onpopstate = function () {
            var match;

            // Regex for replacing addition symbol with a space
            var pl = /\+/g;
            var search = /([^&=]+)=?([^&]*)/g;
            var decode = function (s) {
                return decodeURIComponent(s.replace(pl, " "));
            };
            var query = window.location.search.substring(1);

            urlParams = {};
            while (match = search.exec(query)) {
                urlParams[decode(match[1])] = decode(match[2]);
            }
        })();

        return (urlParams["cheat"] === "please");
    };

    Cheat.giveBoots = function () {
        if (!Cheat.isEnabled()) return;
        gx.gs.cheatCount++;
        gx.gs.playerGear = Gear.addItem(gx.gs.playerGear, new Gear.Item(
            Gear.GearSet.bootsOfWaterWalking,
            c.ITEM_CONDITION_USED,
            c.ITEM_QUALITY_OK,
            1,
            c.cloneDate(gx.gs.currentDate)));
    };

    Cheat.giveApples = function () {
        if (!Cheat.isEnabled()) return;
        gx.gs.cheatCount++;
        gx.gs.playerGear = Gear.addItem(gx.gs.playerGear, new Gear.Item(
            Gear.GearSet.apples,
            c.ITEM_CONDITION_USED,
            c.ITEM_QUALITY_POOR,
            1,
            c.cloneDate(gx.gs.currentDate)));
    };

    Cheat.giveBuffalo = function () {
        if (!Cheat.isEnabled()) return;
        gx.gs.cheatCount++;
        gx.gs.playerGear = Gear.addItem(gx.gs.playerGear, new Gear.Item(
            Gear.GearSet.buffalo,
            c.ITEM_CONDITION_USED,
            c.ITEM_QUALITY_POOR,
            1,
            c.cloneDate(gx.gs.currentDate)));
    };

    Cheat.teleport = function (dest) {
        if (!Cheat.isEnabled()) return;
        gx.gs.cheatCount++;
        Player.spendHourAsEntireCrew(c.ACTIVITY_LEVEL_STANDING_AROUND);
        gx.gs.playerLocation = [dest[X], dest[Y]];
        Map.refreshMap();
    };

    return Cheat;
});
