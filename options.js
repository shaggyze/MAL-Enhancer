$("select").change(function () {
    saveSettings();
});

$("#toggleUserCSS").click(function () {
    blacklistUser($("#toggleUserCSS"));
});

function saveSettings() {
    var bbcodehelper = $("select#bbcodehelper").val();
    var animefinder = $("select#animefinder").val();
    var customCSS = $("select#customCSS").val();
    var animeRoulette = $("select#animeRoulette").val();
    var messageBeautifier = $("select#messageBeautifier").val();
    var messageDrafts = $("select#messageDrafts").val();
    var improvedhistory = $("select#improvedhistory").val();
    chrome.storage.sync.set({ "bbcodehelper": bbcodehelper, "animefinder": animefinder, "improvedhistory": improvedhistory, "customCSS": customCSS, "animeRoulette": animeRoulette, "messageBeautifier": messageBeautifier, "messageDrafts": messageDrafts}, function () {
        var d = new Date();
        $("#notifier").text("Saved Settings!").css("color", "green");
        $("#notifier").stop().show().delay(500).fadeOut(3000);
    });
}

function blacklistUser(e) {
    if (e.attr("blacklisted") == "true") {
        chrome.storage.sync.get("blacklisted", function (data) {
            if (data.blacklisted == undefined) { return; }
            var newArr = [];
            var user = decodeURI(e.attr("user"));
            for (var i = 0; i < data.blacklisted.length; i++) {
                if (data.blacklisted[i] != user) {
                    newArr.push(data.blacklisted[i]);
                }
            }
            chrome.storage.sync.set({ "blacklisted": newArr }, function () {
                $("#notifier").text(user + "'s CSS is now enabled!").css("color", "green");
                $("#notifier").stop().show().delay(500).fadeOut(3000);
                $("#toggleUserCSS").text("Blacklist");
                $("#toggleUserCSS").attr("blacklisted", false);
                return;
            });


        });
    } else {
        chrome.storage.sync.get("blacklisted", function (data) {
            var newArr;
            if (data.blacklisted == undefined) { newArr = []; } else { newArr = data.blacklisted; }
            
            var user = decodeURI(e.attr("user"));
            newArr.push(user);

            chrome.storage.sync.set({ "blacklisted": newArr }, function () {
                $("#notifier").text(user + "'s CSS is now disabled!").css("color", "red");
                $("#notifier").stop().show().delay(500).fadeOut(3000);
                $("#toggleUserCSS").text("UnBlacklist");
                $("#toggleUserCSS").attr("blacklisted", true);
                return;
            });


        });
    }
}

function debug() {
    chrome.storage.sync.get(null, function (data) {
        console.log(data);
    });
}

$(document).ready(function () {



    chrome.storage.sync.get(null, function (data) {
        for (var key in data) {
            $("select#" + key).val(data[key]);
        }
    });


    chrome.tabs.query({
        active: true,               // Select active tabs
        lastFocusedWindow: true     // In the current window
    }, function (array_of_Tabs) {
        // Since there can only be one active tab in one active window, 
        //  the array has only one element
        var tab = array_of_Tabs[0];
        // Example:
        var url = tab.url;


        if (tab.url.indexOf("list/") == -1) {
            return;
        }
        try {
            var animelist = tab.url.substr(tab.url.indexOf("list/") + 5).split("?")[0].trim();
            //console.log(animelist);
            $("#currentShowingAnimelistOwner").text(animelist);
            $("#currentShowingAnimelist").show();
            $("#toggleUserCSS").attr("user", encodeURI(animelist));
            chrome.storage.sync.get("blacklisted", function (data) {
                if ($.inArray(animelist, data.blacklisted) != -1){
                    //Is in the list
                    $("#toggleUserCSS").text("UnBlacklist");
                    $("#toggleUserCSS").attr("blacklisted", true);
                } else {
                    $("#toggleUserCSS").text("Blacklist");
                    $("#toggleUserCSS").attr("blacklisted", false);
                }

            });
        } catch (e) {
            //Don't care
        }
    });

});