define([
    'app/constants',
    'app/gameContext'
], function (c, gx) {

    var Gui = {};

    Gui.clearMessageBox = function () {
        $('.zMessageEntry').remove();
    };

    Gui.showMessage = function (message) {
        var prefix = [
            '<span class="zSpanTime">',
            c.formatTimeForDisplay(gx.gs.currentDate),
            '</span>',
            " "]
            .join("");
        var $zMessages = $('#zMessages');
        $zMessages.append('<p class="zMessageEntry">' + prefix + message + '</p>');
        $zMessages.animate({ scrollTop: $zMessages.prop("scrollHeight") - $zMessages.height() }, 300);
    };

    Gui.showMessageDialog = function (message, title, width) {
        var dialogId = gx.getNewUniqueId();
        var dialogHtml = [
            '<div id="' + dialogId + '">',
            message,
            '</div>'
        ].join("\n");
        $("#zGameArea").append(dialogHtml);
        $("#" + dialogId).dialog({
            modal: true,
            title: title,
            dialogClass: "no-close",
            width: width,
            buttons: [
                {
                    text: "Ok",
                    click: function () {
                        $(this).dialog("close");
                        $("#" + dialogId).remove();
                    }
                }
            ]
        });
    };

    Gui.showMessageWithCallback = function (message, title, dialogId, callback) {
        var dialogHtml = [
            '<div id="' + dialogId + '">',
            message,
            '</div>'
        ].join("\n");
        $("#zGameArea").append(dialogHtml);
        $("#" + dialogId).dialog({
            closeOnEscape: false,
            dialogClass: "no-close",
            modal: true,
            title: title,
            width: "50%",
            buttons: [
                {
                    text: "Ok",
                    click: callback
                }
            ]
        });
    };

    return Gui;
});
