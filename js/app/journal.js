define([
    'app/constants',
    'app/gameContext'], function (c, gx) {

    var Journal = {};

    Journal.Entry = function (entryText, entryType, entrySpecific) {
        this.entryDateTime = c.cloneDate(gx.gs.currentDate);
        this.playerLocation = [gx.gs.playerLocation[X], gx.gs.playerLocation[Y]];
        this.entryText = entryText;

        // entryType corresponds to one of c.JOURNAL_ENTRY_TYPE_something
        this.entryType = entryType;

        // this holds some entry-specific information, such as what food was found, etc.
        this.entrySpecific = entrySpecific;
    };

    Journal.Entry.prototype = {
        constructor: Journal.Entry,
        formatForDisplay: function () {
            return [
                "<tr>",
                "<td>" + c.formatDateForDisplay(this.entryDateTime) + "</td>",
                "<td>" + c.formatTimeForDisplay(this.entryDateTime) + "</td>",
                "<td>" + c.JOURNAL_ENTRY_TYPE_NAMES[this.entryType] + "</td>",
                "<td>" + this.entryText + "</td>",
                "</tr>"].join(" ");
        }
    };

    Journal.addEntry = function(journal, entry) {
        journal.push(entry);
    };

    Journal.showJournal = function(journal) {
        $(".zJournal").find("tr:gt(0)").remove();
        journal.forEach(function (entry) {
            $('.zJournal > tbody:last').append(entry.formatForDisplay());
        });
    };

    return Journal;
});
