$("select").change(function () {
	chrome.storage.sync.get("allbbcode", function (data) {
	if (data.allbbcode == "true" || data.allbbcode == undefined) {
	} else {
		$("select#profilebbcode").val("false");
		$("select#postbbcode").val("false");
		$("select#pmbbcode").val("false");
		$("select#commentbbcode").val("false");
		$("select#blogbbcode").val("false");
		$("select#clubbbcode").val("false");
		$("select#sigbbcode").val("false");
	}
	});
	saveSettings();
});

$("select#allbbcode").change(function () {
    chrome.storage.sync.get("allbbcode", function (data) {
		if (data.allbbcode == "true" || data.allbbcode == undefined) {
			chrome.storage.sync.set({ "profilebbcode": "true", "postbbcode": "true", "pmbbcode": "true", "commentbbcode": "true", "blogbbcode": "true", "clubbbcode": "true", "sigbbcode": "true" }, function () {
			$("select#profilebbcode").val("true");
			$("select#postbbcode").val("true");
			$("select#pmbbcode").val("true");
			$("select#commentbbcode").val("true");
			$("select#blogbbcode").val("true");
			$("select#clubbbcode").val("true");
			$("select#sigbbcode").val("true");
			return;
			});
		} else {

			chrome.storage.sync.set({ "profilebbcode": "false", "postbbcode": "false", "pmbbcode": "false", "commentbbcode": "false", "blogbbcode": "false", "clubbbcode": "false", "sigbbcode": "false" }, function () {
			$("select#profilebbcode").val("false");
			$("select#postbbcode").val("false");
			$("select#pmbbcode").val("false");
			$("select#commentbbcode").val("false");
			$("select#blogbbcode").val("false");
			$("select#clubbbcode").val("false");
			$("select#sigbbcode").val("false");
			return;
			});
		}
	});
});

$("#toggleUserCSS").click(function () {
    blacklistUser($("#toggleUserCSS"));
});

function saveSettings() {
	var allbbcode = $("select#allbbcode").val();
	var profilebbcode = $("select#profilebbcode").val();
	var postbbcode = $("select#postbbcode").val();
	var pmbbcode = $("select#pmbbcode").val();
	var commentbbcode = $("select#commentbbcode").val();
	var blogbbcode = $("select#blogbbcode").val();
	var clubbbcode = $("select#clubbbcode").val();
	var sigbbcode = $("select#sigbbcode").val();
    var bbcodehelper = $("select#bbcodehelper").val();
    var animefinder = $("select#animefinder").val();
    var customCSS = $("select#customCSS").val();
    var animeRoulette = $("select#animeRoulette").val();
    var messageBeautifier = $("select#messageBeautifier").val();
    var messageDrafts = $("select#messageDrafts").val();
    var improvedhistory = $("select#improvedhistory").val();
	var footer = $("select#footer").val();
	var terms = $("select#terms").val();
    chrome.storage.sync.set({ "allbbcode": allbbcode, "profilebbcode": profilebbcode, "postbbcode": postbbcode, "pmbbcode": pmbbcode, "commentbbcode": commentbbcode, "blogbbcode": blogbbcode, "clubbbcode": clubbbcode, "sigbbcode": sigbbcode, "bbcodehelper": bbcodehelper, "animefinder": animefinder, "improvedhistory": improvedhistory, "customCSS": customCSS, "animeRoulette": animeRoulette, "messageBeautifier": messageBeautifier, "messageDrafts": messageDrafts, "footer": footer, "terms": terms}, function () {
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