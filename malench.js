String.prototype.endsWith = function (suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
}
String.prototype.startsWith = function (str) {
    return !this.indexOf(str);
}
String.prototype.replaceAll = function (target, replacement) {
    return this.split(target).join(replacement);
};
String.prototype.capitalize = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
}
String.prototype.contains = function (it) {
    return this.indexOf(it) != -1;
};

function delimitNumbers(str) {
    return (str + "").replace(/\b(\d+)((\.\d+)*)\b/g, function (a, b, c) {
        return (b.charAt(0) > 0 && !(c || ".").lastIndexOf(".") ? b.replace(/(\d)(?=(\d{3})+$)/g, "$1 ") : b) + c;
    });
}

Object.getSize = function (obj) {
    var size = 0,
        key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

function setSelectionRange(input, selectionStart, selectionEnd) {
    if (input.setSelectionRange) {
        input.focus();
        input.setSelectionRange(selectionStart, selectionEnd);
    } else if (input.createTextRange) {
        var range = input.createTextRange();
        range.collapse(true);
        range.moveEnd('character', selectionEnd);
        range.moveStart('character', selectionStart);
        range.select();
    }
}

function setCaretToPos(input, pos) {
    setSelectionRange(input, pos, pos);
}


var animefinder = false;
var bbcodehelper = false;
var choosingAnime = false;
var messageTextArea = null;
var currentAnimelist = null;
var animelistLayoutIsOld = null;
var animeData = [];
//Choose if should be enabled
$(document).ready(function () {
    if (window.location.pathname == "/mymessages.php" && window.location.search.contains("go=send")) {
        console.info("Writing a message. Enabeling BB-Code helper");
        enableAnimeFinder("textarea[name='message']");
        enableBBCodeHelper("textarea[name='message']", function () {
            enableMessageBackup();
        });
        enableMessageBeautifier();
    } else if (window.location.pathname == "/mymessages.php" && !window.location.search.contains("go=read")) {
        console.log("Looking at message overview!");
        showStoredMessages();
    } else if (window.location.pathname == "/mymessages.php" && window.location.search.contains("go=read")) {
        console.info("Reading a message! Make things prettier!");
        enableMessageBeautifier();
        enableBBCodeHapser();
    } else if (window.location.pathname == "/editprofile.php") {
        console.info("Profile Editing detected. Enabeling BB-Code helper");
        enableAnimeFinder("textarea[name='profile_aboutme']");
        enableBBCodeHelper("textarea[name='profile_aboutme']");
    } else if (window.location.pathname == "/myblog.php") {
        console.info("Writing Blog Post Enabeling BB-Code helper");
        enableAnimeFinder("textarea[name='entry_text']");
        enableBBCodeHelper("textarea[name='entry_text']");
    } else if (window.location.pathname == "/forum/" && window.location.search.startsWith("?action=message")) {
        console.info("Replying to a forumpost! Enabeling BB-Code helper");
        enableAnimeFinder("textarea[name='msg_text']");
        enableBBCodeHelper("textarea[name='msg_text']");
    } else if (window.location.pathname == "/forum/" && window.location.search.startsWith("?action=post")) {
        console.info("Creating a forumpost! Enabeling BB-Code helper");
        enableAnimeFinder("textarea[name='msg_text']");
        enableBBCodeHelper("textarea[name='msg_text']");
    } else if (window.location.pathname == "/forum/" && window.location.search.startsWith("?topicid=")) {
        console.info("Viewing a forumpost! Enabeling BB-Code helper");
        enableAnimeFinder("#quickReply #messageText");
        enableBBCodeHelper("#quickReply #messageText");
    } else if (window.location.pathname == "/clubs.php" && window.location.search.startsWith("?action=create")) {
        console.info("Creating a club! Enabeling BB-Code helper");
        enableAnimeFinder("textarea[name='club_description']");
        enableBBCodeHelper("textarea[name='club_description']");
        setTimeout(function () {
            $("#bbCodeEditor").css("width", "594px");
        }, 500);
    } else if (window.location.pathname.startsWith("/profile/")) {
        console.info("Looking at a profile page! Enabeling BB-Code helper");
        enableAnimeFinder("textarea[name='commentText']");
        enableBBCodeHelper("textarea[name='commentText']");
        enableImprovedHistory();
        //First decide if profile actually has content.
        if ($(".word-break").html() !== undefined) {
            $("#contentWrapper .h1").append("<button class='MAL-ENCH-getProfileBBCode' style='display:inline; float:right; font-size:9px;'>Parse profile-text to BB-Code</button>")
        }

    } else if (window.location.pathname.startsWith("/animelist/")) {
        var user = window.location.pathname.substr(11).split("?")[0].trim();
        console.info("Viewing " + user + "'s animelist.");
        currentAnimelist = user;


        //if (animelistLayoutIsOld == false) {
        chrome.storage.sync.get("animeRoulette", function (data) {
            if (data.animeRoulette == "true" || data.animeRoulette == undefined) {

                downloadAllAnimeData(user);
                $.get(chrome.runtime.getURL("animeRandomizer.html"), function (data) {
                    $("body").append(data);
                    $(".randomizerOptions input").unbind().change(function () {
                        getAnimePosibilities();
                    });
                });
            }
        });
        //}






    } else {
        console.info("Unknown page! Extension disables!");
        return false;
    }

});

function downloadAllAnimeData(user, offset) {
    if (offset === undefined) {
        offset = 0;
    };
    $.get("https://myanimelist.net/animelist/" + user + "/load.json?offset=" + offset + "&status=7", function (data) {
        if (data !== null) {
            animeData = animeData.concat(data);
        }
        if (data.length == 300) {
            downloadAllAnimeData(user, offset + 300);
        } else {
            $("body").append("<div title='Anime Roulette' class='MAL-ENCH-randombadge'><i class='fa fa-random' aria-hidden='true'></i></div>");
        }
    });
}



//Placed outside loop to remove the css as soon a javascript loads. (Instead of waiting for the page to be "ready")
Element.prototype.remove = function () {
    this.parentElement.removeChild(this);
}
NodeList.prototype.remove = HTMLCollection.prototype.remove = function () {
    for (var i = this.length - 1; i >= 0; i--) {
        if (this[i] && this[i].parentElement) {
            this[i].parentElement.removeChild(this[i]);
        }
    }
}
if (window.location.pathname.startsWith("/animelist/") || window.location.pathname.startsWith("/mangalist/")) {
    var user = window.location.pathname.substr(11).split("?")[0].trim();
    chrome.storage.sync.get(null, function (data) {
        if (data.customCSS == "false" || $.inArray(user, data.blacklisted) != -1) {
            console.info("Removing custom css as requested by options.")
            //$("#custom-css").remove();
            if (document.getElementById("custom-css") == null) {
                //Using old layout
                document.getElementsByTagName("style")[0].remove();
                animelistLayoutIsOld = true;
            } else {
                document.getElementById("custom-css").remove();
                animelistLayoutIsOld = false;
            }
        }
    });
}

$(document).on('click', '.animeselected', function () {
    insertSelectedAnime();
}).on('click', '.outerFlex', function (e) {
    if (choosingAnime && $(e.target).hasClass("outerFlex")) {
        cancelSearch();
    }
}).on('click', '#MAL-ENCH-removeMeSoonPls', function (e) {
    e.stopPropagation();
}).on('click', function (e) {
    if ($("#MAL-ENCH-removeMeSoonPls").length > 0) {
        $("#MAL-ENCH-removeMeSoonPls").remove();
    }
    closeRandomizer();
}).on('click', '.MAL-ENCH-randombadge', function (e) {
    setTimeout(function () {
        openRandomizer();
    }, 100);

}).on('click', '#animeRandomizer', function (e) {
    e.stopPropagation();
}).on('click', '.closeMe', function (e) {
    closeRandomizer();
}).on('click', '#buildRoulette', function (e) {
    resetRoulette();
    $(".randomizerOptions").slideUp();
    $(".randomizerRoulette").slideDown(function () {
        $(".roulettecursor").fadeIn("slow");
    });
}).on('click', '#spinRoulette', function (e) {
    spinRoulette();
    $("#spinRoulette").slideUp();
}).on('click', '#resetRoulette', function (e) {
    resetRoulette(false);
}).on('click', '#restartRoulette', function (e) {
    resetRoulette(true);
}).on('click', '.randomizerRoulette', function (e) {
    $("#rouletteAnimeEpisodes, #rouletteAnimeRating, #rouletteAnimeAired, #rouletteAnimeTitle, #restartRoulette, #rouletteViewMAL").finish();
}).on('click', '#customRoulettePlease', function (e) {
    $(".randomizerRoulette").slideUp();
    $(".roulettecursor").hide();
    $(".randomizerOptions").slideDown();
    $("#rouletteResult p, #rouletteResult td").animate({
        "font-size": "0px"
    }, 2000, "swing");
    $("#resultButtons td").fadeOut();
    $("#spinRoulette").slideDown();
}).on('click', ".MAL-ENCH-BBCODEHAPSER", function (e) {
    var test = $(this).parent().html();
    var skipMuch = test.split("</div>", 2)[0].length + test.split("</div>", 2)[1].length + 12; //I sometimes call myself a programmer... What a joke...
    test = test.substr(skipMuch).split('<div class="border_top')[0];
    parseBBCode(test)
}).on('click', '.MAL-ENCH-parseHTML', function (e) {
    parseBBCode($(this).parent().parent().find(".MAL-ENCH-messagecontent").html());
}).on('click', '.MAL-ENCH-getProfileBBCode', function (e) {
    $("img").each(function () {
        $(this).attr("src2", $(this).attr("src"));
        $(this).removeAttr("src");
    });
    parseBBCode($(".word-break").html());
    $("img").each(function () {
        $(this).attr("src", $(this).attr("src2"));
        $(this).removeAttr("src2");
    });
}).on('click', '.prompterButton', function (e) {
    var value = $(this).parent().find("input").val();
    if (value.contains("youtube.com")) {
        value = value.substr(value.indexOf("v=") + 2, 11);
    } else if (value.contains("youtu.be")) {
        value = value.substr(value.indexOf(".be/" + 4));
    }


    var start = $(this).attr("start").replaceAll("%s", value);
    var close = $(this).attr("close").replaceAll("%s", value);
    var action = $(this).attr("action");
    $("#MAL-ENCH-removeMeSoonPls").remove();
    switch (action) {
        case "wrapText":
            wrapText(start, close);
            break;
        case "insertText":
            insertText(start);
            break;
    }

}).on("keypress", "#MAL-ENCH-removeMeSoonPls input", function (e) {
    if (e.keyCode == 13) {
        $("#MAL-ENCH-removeMeSoonPls .prompterButton").click();
    }
}).on('click', "#rouletteViewMAL", function () {
    window.open(randomizerOpenURL);
});



var ctrl = false;
$(window).keydown(function (e) {
    if ((e.ctrlKey || e.metaKey)) {
        ctrl = true;
    } else {
        ctrl = false;
    }
    // Ctrl + key
    if ((e.ctrlKey || e.metaKey) && animefinder && !choosingAnime) {
        if (e.keyCode == 13) { //(Enter)
            e.preventDefault();
            findAnime();
            return;
        }
    }

    if (choosingAnime) {
        e.preventDefault();
        if (e.keyCode == 27) { //Escape
            e.preventDefault();
            cancelSearch();
            return;
        }

        if (e.keyCode == 13) { //Enter
            e.preventDefault();
            insertSelectedAnime();
            return;
        }

        if (e.keyCode == 38) { //Up Arrow
            e.preventDefault();
            var animeNum = parseInt($(".animeselected").attr("animenum"));
            if (animeNum == 0) {
                return;
            }
            $(".animeselected").removeClass("animeselected");
            $("tr[animenum='" + --animeNum + "']").addClass("animeselected");
        }

        if (e.keyCode == 40) { //Down Arrow
            e.preventDefault();
            var animeNum = parseInt($(".animeselected").attr("animenum"));
            if (animeNum == $(".animeselected").parent().children().length - 1) {
                return;
            }
            $(".animeselected").removeClass("animeselected");
            $("tr[animenum='" + ++animeNum + "']").addClass("animeselected");
        }
    }


});

//Anime Randomizer

function openRandomizer() {
    if (currentAnimelist === null) {
        return false;
    }
    $("#animeRandomizer").show();
    setTimeout(function () {
        fillRoulette();
    }, 250);
}

function closeRandomizer() {
    $("#animeRandomizer").hide();
}



function getAnimePosibilities() {
    if (animeData === null || animeData.length < 1) {
        console.error("Can't randomize! No anime data!!");
        return false;
    }

    var watching = $("#anime-random-watching").prop("checked");
    var completed = $("#anime-random-completed").prop("checked");
    var onhold = $("#anime-random-onhold").prop("checked");
    var dropped = $("#anime-random-dropped").prop("checked");
    var plantowatch = $("#anime-random-plantowatch").prop("checked");
    var airing = $("#anime-random-airing").prop("checked");
    var finishedairing = $("#anime-random-finishedairing").prop("checked");
    var notyetairing = $("#anime-random-notyetairing").prop("checked");
    var tv = $("#anime-random-tv").prop("checked");
    var movie = $("#anime-random-movie").prop("checked");
    var special = $("#anime-random-special").prop("checked");
    var ova = $("#anime-random-ova").prop("checked");
    var minEpisodes = $("#anime-random-minepisodes").val();
    var maxEpisodes = $("#anime-random-maxepisodes").val();
    if ((minEpisodes > maxEpisodes) && maxEpisodes != 0) {
        alert("The minimum amount of episodes can't be bigger than the maximum amount of episodes.");
        $("#anime-random-minepisodes").val(0);
        $("#anime-random-maxepisodes").val(0);
        return false;
    } else if ((minEpisodes < 0) || (maxEpisodes < 0)) {
        alert("The amount of episodes can't be negative values.");
        $("#anime-random-minepisodes").val(0);
        $("#anime-random-maxepisodes").val(0);
        return false;
    }

    var animes = [];


    for (var i = 0; i < animeData.length; i++) { // AnyWatch
        if (watching) {
            if (animeData[i].status == 1) {
                animes.push(animeData[i]);
                continue;
            }
        }
        if (completed) {
            if (animeData[i].status == 2) {
                animes.push(animeData[i]);
                continue;
            }
        }
        if (onhold) {
            if (animeData[i].status == 3) {
                animes.push(animeData[i]);
                continue;
            }
        }
        if (dropped) {
            if (animeData[i].status == 4) {
                animes.push(animeData[i]);
                continue;
            }
        }
        if (plantowatch) {
            if (animeData[i].status == 6) {
                animes.push(animeData[i]);
                continue;
            }
        }

    }



    var _animes = [];
    for (var i = 0; i < animes.length; i++) { // AnyWatch
        if (airing) {
            if (animes[i].anime_airing_status == 1) {
                _animes.push(animeData[i]);
                continue;
            }
        }
        if (finishedairing) {
            if (animes[i].anime_airing_status == 2) {
                _animes.push(animes[i]);
                continue;
            }
        }
        if (notyetairing) {
            if (animes[i].anime_airing_status == 3) {
                _animes.push(animes[i]);
                continue;
            }
        }
    }
    animes = _animes;
    _animes = [];

    for (var i = 0; i < animes.length; i++) { // AnyWatch
        if (tv) {
            if (animes[i].anime_media_type_string == "TV") {
                _animes.push(animes[i]);
                continue;
            }
        }
        if (movie) {
            if (animes[i].anime_media_type_string == "Movie") {
                _animes.push(animes[i]);
                continue;
            }
        }
        if (special) {
            if (animes[i].anime_media_type_string == "Special") {
                _animes.push(animes[i]);
                continue;
            }
        }
        if (ova) {
            if (animes[i].anime_media_type_string == "OVA") {
                _animes.push(animes[i]);
                continue;
            }
        }
    }
    if (minEpisodes != 0 || maxEpisodes != 0) {
        console.log("SÅ ER VI HERINDE!!!" + minEpisodes + ":" + maxEpisodes);
        animes = _animes;
        _animes = [];


        if (minEpisodes != 0) {
            console.log("Tjekker for min!");
            for (var i = 0; i < animes.length; i++) {
                if (animes[i].anime_num_episodes >= minEpisodes) {
                    _animes.push(animes[i]);
                    continue;
                }
            }
            if (maxEpisodes != 0) {
                animes = _animes;
                _animes = [];
            }
        }




        if (maxEpisodes != 0) {
            console.log("Tjekker for maks")
            for (var i = 0; i < animes.length; i++) {
                if (animes[i].anime_num_episodes <= maxEpisodes) {
                    _animes.push(animes[i]);
                    continue;
                }
            }
        }
    }

    animes = _animes;
    _animes = [];
    $("#anime-random-finalcount").text(animes.length);
    if (animes.length < 1) {
        $("#buildRoulette").attr("disabled", "disabled");
    } else {
        $("#buildRoulette").removeAttr("disabled", "disabled");
    }
    return animes;
}

function fillRoulette() {
    var animes = getAnimePosibilities();
    if (animes.length < 1) {
        $(".randomizerRoulette").slideUp();
        $(".randomizerOptions").slideDown();
        return;
    }

    var appendAnimes = "";
    for (var i = 0; i < 500; i++) {
        var whatAnime = randomIntFromInterval(0, animes.length - 1);
        appendAnimes += "<li anime='" + whatAnime + "' style='display:inline;' class='imageContainer noselect' ><img src='" + animes[whatAnime].anime_image_path + "' draggable='false' class='noselect' /></li>";
    }
    document.getElementById("appendRoulette").innerHTML = "";
    document.getElementById("appendRoulette").innerHTML += appendAnimes;
}

function readableDate(date) {
    var day = date.split('-')[0];
    var month = date.split('-')[1];
    var year = date.split('-')[2];
    return day + "/" + month + "/" + year;
}

function checkIfUndefined(what) {
    if (what === undefined) {
        return "N/A";
    } else {
        return what;
    }
}
var randomizerOpenURL = "";

function spinRoulette() {
    //$("#rouletteResult p, #rouletteResult td").animate({ "font-size": "0px" }, 2000, "swing");
    //$("#resultButtons td").fadeOut();
    $("#rouletteResult p, #rouletteResult td").css("font-size", "0px");
    $("#resultButtons td").hide();
    var howMuch = randomIntFromInterval(1000, 46000);
    var animes = getAnimePosibilities();
    $("#appendRoulette").css("margin-left", "-" + howMuch + "px");
    setTimeout(function () {
        var whatLi = Math.floor((howMuch + 5) / 96) + Math.floor((Math.floor($(".theRoulette").width()) / 2) / 96);

        var anime = animes[parseInt($($(".slider").children("li")[whatLi]).attr("anime"))];
        $("#rouletteAnimeTitle").text(checkIfUndefined(anime.anime_title));
        $("#rouletteAnimeEpisodes").text("Episodes: " + checkIfUndefined(anime.anime_num_episodes));
        $("#rouletteAnimeRating").text("Rating: " + checkIfUndefined(anime.anime_mpaa_rating_string));
        $("#rouletteAnimeAired").text("Aired: " + readableDate(anime.anime_start_date_string));
        randomizerOpenURL = "http://myanimelist.net" + anime.anime_url;
        $("#rouletteAnimeTitle").animate({
            "font-size": "25px"
        }, 2000, "swing", function () {
            $("#rouletteAnimeEpisodes").animate({
                "font-size": "15px"
            }, 2000, "swing");
            setTimeout(function () {
                $("#rouletteAnimeRating").animate({
                    "font-size": "15px"
                }, 2000, "swing");
                setTimeout(function () {
                    $("#rouletteAnimeAired").animate({
                        "font-size": "15px"
                    }, 2000, "swing");
                    setTimeout(function () {
                        $("#resultButtons td").fadeIn(1000); //1000
                    }, 1500); //1500
                }, 500); //500
            }, 500); //500
        });
    }, 10000); //10000
}

function resetRoulette(restart) {
    $("#appendRoulette").removeClass("anim");
    $("#appendRoulette").css("margin-left", "0px");
    fillRoulette();
    setTimeout(function () {
        $("#appendRoulette").addClass("anim");
        if (restart) {
            spinRoulette();
        }
    }, 250);
}

function randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

//BB-Code Helper
function enableBBCodeHelper(textboxSelector, callback) {
    chrome.storage.sync.get("bbcodehelper", function (data) {
        if (data.bbcodehelper == "true" || data.bbcodehelper == undefined) {
            if (!bbcodehelper) {

                bbcodehelper = true;
                if (textboxSelector != undefined && messageTextArea == null) {
                    messageTextArea = $(textboxSelector);
                    messageTextArea.addClass("MAL-ENCH-theEditor");
                }
                if (messageTextArea == null) {
                    bbcodehelper = false;
                    console.error("Could not find text area!");
                    return;
                } else {
                    $.get(chrome.runtime.getURL("bbcodehelper.html"), function (data) {
                        messageTextArea.before(data);
                        if (animefinder) {
                            $("#animesearcher").show();
                        }
                        $("#animesearchtextbox").unbind().bind("keypress", function (e) {

                            if (e.keyCode == 13) {
                                e.preventDefault();
                                searchAnime($(e.currentTarget).val());
                                $(e.currentTarget).val("");
                                return false;
                            }
                        });
                    });

                    console.info("BBCodeHelper enabled!");
                    if (callback !== undefined) {
                        callback();
                    }
                }
            }
        } else {
            console.info("BBCodeHelper disabled in config.");
        }
    });
}


//Animefinder helper

function enableAnimeFinder(textboxSelector) {
    chrome.storage.sync.get("animefinder", function (data) {
        if (data.animefinder == "true" || data.animefinder == undefined) {
            if (!animefinder) {
                $("body").append("<div class='flexContainer' style='display:none;'><div class='outerFlex'><div class='innerFlex noselect'><a class='helptoggle' onclick='$(\"#animesearchhelper\").stop().slideToggle();'>Help</a><p>Search results for: <span id='flexSearchFor'></span></p><br><div id='animesearchhelper'><p>Use <b>up/down arrows</b> or <b>the mouse</b> to select an anime.</p><br><p>Confirm selection by pressing <b>enter</b> or <b>clicking</b></p><br><p>Tips: <br>- Hold <b>CTRL</b> when confirming your selection to insert a link to the anime<br>- Pressing <b>CTRL + ENTER</b> while writing a message, you can search directly for the word you're typing!<p></div><i class='fa fa-refresh spin animeLoadSpinner' aria-hidden='true' class='animeLoadSpinner spin noselect'></i><table><thead><tr><th>Picture</th><th>Name</th><th>Type</th><th>Released</th></tr></thead><tbody id='searchTable'></tbody></table></div></div></div>");
                animefinder = true;
                if (textboxSelector != undefined && messageTextArea == null) {
                    messageTextArea = $(textboxSelector);
                    messageTextArea.addClass("MAL-ENCH-theEditor");
                }
                console.info("Animefinder enabled!");
            }
        } else {
            console.info("Animefinder disabled in config.");
        }
    });

}

function cancelSearch() {
    choosingAnime = false;
    $("#searchTable").empty();
    $(".flexContainer").fadeOut();
    $(".flexContainerHistory").fadeOut();
    $("#flexSearchFor").text("");
    searchingFor = "";
    searchingWhere = -1;
}


function insertSelectedAnime() {
    choosingAnime = false;
    var chosen = $($(".animeselected").children()[1]).text();
    if (ctrl) {
        chosen = "[url=" + decodeURI($(".animeselected").attr("animeurl")) + "]" + chosen + "[/url]";
    }
    $("#searchTable").empty();
    $(".flexContainer").hide();
    $("#flexSearchFor").text("");

    if (searchingWhere == undefined) {
        searchingWhere = messageTextArea.prop("selectionStart");
    }
    replaceWord(searchingFor, searchingWhere, chosen);
    searchingFor = "";
    searchingWhere = -1;
}


function findAnime() {
    if (messageTextArea == null) {
        return false;
    }
    var cursorPos = messageTextArea.prop("selectionStart");

    var message = messageTextArea.val();
    var _cursorPos = cursorPos;
    var breakChars = [" ", "\n"];
    while (($.inArray(message.substr(_cursorPos, 1), breakChars) == -1) && _cursorPos > 0) {
        _cursorPos--;
    }
    var properlyWord = message.substr(_cursorPos).trim().split(" ")[0];
    if (properlyWord.trim() == "") {
        return false;
    }

    var replaceWord = "ostehapser";
    searchAnime(properlyWord, _cursorPos);
}

function searchAnime(search, where) {
    $(".flexContainer").fadeIn();
    $(".animeLoadSpinner").show();
    $("#flexSearchFor").text(search);
    $("#searchTable").empty();
    $("#searchTable").parent().hide();
    $.get("https://myanimelist.net/search/prefix.json?type=all&keyword=" + encodeURI(search) + "&v=1", function (data) {
        try {
            if (typeof data == "string") {
                data = JSON.parse(data);
            }
            var firstGotTo = 0;
            if (data.categories[0].type == "anime" || data.categories[0].type == "manga") {
                for (var i = 0; i < data.categories[0].items.length; i++) {
                    $("#searchTable").append("<tr animeurl='" + encodeURI(data.categories[0].items[i].url) + "' animeNum='" + i + "'>" +
                        "<td><img class='noselect' alt='" + encodeURI(data.categories[0].items[i].name) + " poster' src='" + data.categories[0].items[i].image_url + "'></td>" +
                        "<td>" + data.categories[0].items[i].name + "</td>" +
                        "<td>" + data.categories[0].items[i].type.capitalize() + "</td>" +
                        "<td>" + data.categories[0].items[i].payload.start_year + "</td>" +
                        "</tr >");
                    firstGotTo = i;
                    if (i > 4) {
                        break;
                    }
                }
            }
            if (data.categories[1].type == "anime" || data.categories[1].type == "manga") {
                for (var i = 0; i < data.categories[1].items.length; i++) {
                    $("#searchTable").append("<tr animeurl='" + encodeURI(data.categories[1].items[i].url) + "' animeNum='" + (parseInt(i) + parseInt(firstGotTo) + 1) + "'>" +
                        "<td><img class='noselect' alt='" + encodeURI(data.categories[1].items[i].name) + " poster' src='" + data.categories[1].items[i].image_url + "'></td>" +
                        "<td>" + data.categories[1].items[i].name + "</td>" +
                        "<td>" + data.categories[1].items[i].type.capitalize() + "</td>" +
                        "<td>" + data.categories[1].items[i].payload.start_year + "</td>" +
                        "</tr >");
                    if (i > 4) {
                        break;
                    }
                }
            }
            $(".animeLoadSpinner").hide();
            $("#searchTable tr").attr("onmouseover", '$(\".animeselected\").removeClass(\"animeselected\");$(this).addClass(\"animeselected\");')
            $("#searchTable").parent().show();
            $("tr[animeNum='0']").addClass("animeselected");
            choosingAnime = true;
            searchingFor = search;
            searchingWhere = where;
        } catch (e) {
            console.error(e);
            cancelSearch();
        }

        //Add click event


    });
    /*
    for (var i = 0; i < 3; i++) {
        $("#searchTable").append("<tr animeNum='"+i+"'>" +
            "<td><img src='https://myanimelist.cdn-dena.com/images/manga/2/162128.jpg'></td>" +
            "<td>Horimiya</td>" +
            "<td>Manga</td>" +
            "<td>2011</td>" +
            "</tr >");
    }*/

}

var searchingFor = "";
var searchingWhere = -1;

function replaceWord(word, _cursorPos, replaceWith) {
    if (word.trim() == "") {
        return;
    }
    if (_cursorPos == -1) {
        return;
    }
    var message = messageTextArea.val();
    var startMessage = message.substr(0, _cursorPos) + " ";
    var endMessage = message.substr(_cursorPos + word.length + 1);
    message = startMessage + replaceWith + endMessage;

    messageTextArea.val(message)
    setTimeout(function () {
        setCaretToPos(document.getElementsByClassName("MAL-ENCH-theEditor")[0], _cursorPos + replaceWith.length + 1);
    }, 20);
}


//MAL Profile Improved History
var createdGraph = true;
var graph = null;
function enableImprovedHistory() {
    chrome.storage.sync.get("improvedhistory", function (data) {
        if (data.improvedhistory == "true" || data.improvedhistory == undefined) {

            $(".stats.anime").find("h5").wrapInner('<p style="display: inline;"></p>');
            $("a.floatRightHeader.ff-Verdana").parent().append('<li class="icon-history link"><a style="cursor:pointer;" class="MAL-ENCH-openImprovedHistory"><span class="user-status-title di-ib fw-b w100">Improved History</span></a></li>');
            $(".MAL-ENCH-openImprovedHistory").click(function () {

                if ($(".flexContainerHistory").length == 0) {
                    $("body").append("<div class='flexContainerHistory' style='display:none;'><div class='outerFlex'><div class='innerFlex'><h1 style='margin:0;'>Improved Anime History:</h1><p>This is all the anime you have watched ever, in the order you watched it!<br>(note* This feature was never finished and currently I have no plans to)<br><hr><canvas id='gitGraph' width='600'></canvas><div id='graphDetails'></div><br><p class='noselect'>Graph drawn by: <a href='http://gitgraphjs.com/' target='blank'>Gitgraph.js</a></div></div></div>");
                }

                $(".flexContainerHistory").fadeIn();
                choosingAnime = true;

                if (!createdGraph) {
                    var myTemplateConfig = {
                        colors: ["#34495e", "#9b59b6", "#3498db", "#2ecc71", "#1abc9c", "#e67e22", "#e74c3c", "#d35400"], // branches colors, 1 per column
                        branch: {
                            lineWidth: 8
                        },
                        commit: {
                            spacingY: -60,
                            dot: {
                                size: 12
                            },
                            message: {
                                display: true,
                                displayAuthor: false,
                                displayBranch: false,
                                displayHash: false,
                                font: "normal 12pt Arial"
                            },

                            tooltipHTMLFormatter: function (commit) {
                                return commit.message;
                            }
                        }
                    };
                    var myTemplate = new GitGraph.Template(myTemplateConfig);
                    graph = new GitGraph({
                        template: myTemplate,
                        orientation: "vertical-reverse"
                    });
                    var main = graph.branch("main");
                    main.commit({
                        message: "START: Shuffle! (27/4/2018)"
                    });
                    main.commit({
                        message: "END: Shuffle! (1/5/2018)"
                    });
                    main.commit({
                        message: "START: CLANNAD (2/5/2018)"
                    });
                    main.commit({
                        message: "END: CLANNAD (4/5/2018)"
                    });

                    $("#graphDetails").append("<div class='gitgraph-detail' id='milestone01'><h1>MILESTONE!</h1><h3>Your 50th anime is CLANNAD!!</h3><img height='100' src='https://cdn.myanimelist.net/images/anime/1804/95033.jpg'></div>")

                    main.commit({
                        message: " ",
                        detailId: "milestone01",
                        dotSize: 30
                    });


                    
                    main.commit({
                        message: "START: White Album 2 (6/5/2018)"
                    });
                    var m = main.branch("hej");
                    m.commit({
                        message: "START: Kokoro Connect (10/5/2018)"
                    });
                    m.commit({
                        message: "END: Kokoro Connect (15/5/2018)"
                    });
                    m.merge(main, {
                        message: " ",
                        dotSize: 1
                    });
                    main.commit({
                        message: "END: White Album 2 (20/5/2018)"
                    });

                }

            });
        }
    });
}





var messagesTable = null;
var messages = [];
var knownNames = [];
var changes = false;

function enableBBCodeHapser() {
    $(".dialog-text > .lightLink").after("<button class='MAL-ENCH-BBCODEHAPSER'>Parse message to BB-Code</button>");
}

function setMessageBackup(key, value) {
    var currentData = getMessageBackup();
    if (typeof value == "object") {
        value = JSON.stringify(value);
    }
    currentData[key] = value;
    localStorage.setItem("MAL-ENCH-messagebackup", JSON.stringify(currentData));
    return true;
}

function clearMessageBackup() {
    localStorage.removeItem("MAL-ENCH-messagebackup");
    return true;
}

function getMessageBackup() {
    var currentData = JSON.parse(localStorage.getItem("MAL-ENCH-messagebackup")); //Returns null if no data
    if (currentData == null) {
        currentData = {};
    }
    return currentData;
}
var backupSaving = false;

function setMessageBackupSaving() {
    if (!backupSaving) {
        backupSaving = true;
        $(".MAL-ENCH-messagebackup").html("<i class='fa fa-spinner spin' aria-hidden='true'></i> Saving Draft...");
    }
}

function setMessageBackupSaved() {
    backupSaving = false;
    $(".MAL-ENCH-messagebackup").html("<i class='fa fa-check' aria-hidden='true'></i> Draft saved locally!");
}

function setMessageBackupLoaded() {
    backupSaving = false;
    $(".MAL-ENCH-messagebackup").html("<i class='fa fa-check' aria-hidden='true'></i> Draft loaded!");
}

function setMessageBackupReady() {
    backupSaving = false;
    $(".MAL-ENCH-messagebackup").html("<i class='fa fa-check' aria-hidden='true'></i> Ready to save draft!");
}

function saveMessageBackup() {
    var content = $(".MAL-ENCH-theEditor").val();
    if (content.trim() == "") {
        content = undefined;
    }
    setMessageBackup(window.location.search, content);
    setMessageBackupSaved();
}

function showStoredMessages() {
    chrome.storage.sync.get("messageDrafts", function (data) {
        if (data.messageDrafts == "true" || data.messageDrafts == undefined) {
            var currentData = getMessageBackup();
            var size = Object.getSize(currentData);
            if (size > 0) {
                $(".MAL-ENCH-showStoredMessages").remove()
                $("#contentWrapper .h1").append("<button class='MAL-ENCH-showStoredMessages' style='display:inline; float:right; font-size:9px;'>You have " + size + " draft(s).</button>");

                if ($(".flexContainer").length == 0) {
                    $("body").append("<div class='flexContainer' style='display:none;'><div class='outerFlex'><div class='innerFlex'><h1 style='margin:0;'>Message Drafts:</h1><p>These are messages automatically stored by MAL ENHANCER.<br>These messages are ONLY avaiable on this PC, and are NOT stored online</p><br><button style='font-size:9px;' class='MAL-ENCH-deleteeverybackup'>Delete every message</button><br><table style='margin:0 auto;'><thead><tr><th>ID</th><th>Content</th><th>Action</th></tr></thead><tbody id='backupMessagesTable'></tbody></table></div></div></div>");
                }
                $("#backupMessagesTable").empty();
                for (var key in currentData) {

                    var prettyKey = "To: " + key.split("toname=")[1].split("&")[0];
                    if (key.contains("replyid")) {
                        prettyKey += "; ReplyID: " + key.split("replyid=")[1].split("&")[0];
                    }
                    if (key.contains("threadid")) {
                        prettyKey += "; ThreadID: " + key.split("threadid=")[1].split("&")[0];
                    }
                    $("#backupMessagesTable").append("<tr><td>" + prettyKey + "</td><td class='MAL-ENCH-backupmessagetruncate'>" + currentData[key] + "</td><td><button key='" + encodeURI(key) + "' class='MAL-ENCH-continuebackup'>Continue Edit</button><button key='" + encodeURI(key) + "' class='MAL-ENCH-deletebackup'>Delete</button></td></tr>");
                }

                $(".MAL-ENCH-showStoredMessages").unbind().click(function () {
                    $(".flexContainer").fadeIn();
                    choosingAnime = true;
                });

                $(".MAL-ENCH-continuebackup").unbind().click(function () {
                    window.location = "https://myanimelist.net/mymessages.php" + decodeURI($(this).attr("key"));
                });

                $(".MAL-ENCH-deletebackup").unbind().click(function () {
                    if (confirm("Are you sure you want to delete this stored message?")) {
                        setMessageBackup(decodeURI($(this).attr("key"), undefined));
                        showStoredMessages();
                    }
                });

                $(".MAL-ENCH-deleteeverybackup").unbind().click(function () {
                    if (confirm("Are you sure you want to delete every single message?")) {
                        clearMessageBackup();
                        showStoredMessages();
                    }
                });

            } else {
                $(".MAL-ENCH-showStoredMessages, .flexContainer").remove();

            }
        }
    });
}

function enableMessageBackup() {
    chrome.storage.sync.get("messageDrafts", function (data) {
        if (data.messageDrafts == "true" || data.messageDrafts == undefined) {
            $(".dialog-text h2").append("<p class='MAL-ENCH-messagebackup'><i class='fa fa-spinner spin' aria-hidden='true'></i> Loading Data</p>");
            var currentData = getMessageBackup();
            setMessageBackupReady();
            if (currentData[window.location.search] !== undefined) {
                if ($(".MAL-ENCH-theEditor").val().trim() == "") { //If some browser for some reason populated the field ahead of time. 
                    $(".MAL-ENCH-theEditor").val(currentData[window.location.search]);
                    setMessageBackupLoaded();
                }
            }


            var tempBackupWait;
            $(".MAL-ENCH-theEditor").keyup(function () { //To be honest, this is just for show. I like show.
                setMessageBackupSaving();
                clearTimeout(tempBackupWait);
                tempBackupWait = setTimeout(function () {
                    saveMessageBackup();
                }, 800);
            });

            $("form[name=subMessage] input[type=submit]").first().click(function () {
                setMessageBackup(window.location.search, undefined);
            });
        }
    });
}



function enableMessageBeautifier() {
    chrome.storage.sync.get("messageBeautifier", function (data) {
        if (data.messageBeautifier == "true" || data.messageBeautifier == undefined) {
            messagesTable = $("#dialog").next().find("table");

            for (var key in messagesTable.find("tr")) {
                if (isNaN(key)) {
                    continue;
                }
                var thisMessage = messagesTable.find("tr")[key];
                var appendto = {};
                appendto.message = $(thisMessage).find(".subject").html();
                appendto.from = $(thisMessage).find(".name").text();
                appendto.date = $(thisMessage).find(".date").text();
                messages.push(appendto);
            }
            if (messages.length < 1) {
                return false;
            }
            var parent = messagesTable.parent();
            messagesTable.remove();
            parent.append("<div id='MAL-ENCH-messagepanel'></div>");
            var messagePanel = $("#MAL-ENCH-messagepanel");
            var namesToFind = [];
            for (var key in messages) {
                var message = messages[key];
                var toAppend = "<div><div class='MAL-ENCH-message'>";
                toAppend += "<div class='MAL-ENCH-infopanel' style='float:left;'><a target='_blank' href='https://myanimelist.net/profile/" + message.from + "'><strong>" + message.from + "</strong></a><br><img alt='Loading " + message.from + "s profile picture..' class='findmypic' name='" + message.from + "' src=''><br><p>" + message.date + "</p><button class='MAL-ENCH-parseHTML' style='font-size:9px;'>Parse message to BB-Code</button></div>";
                toAppend += "<div class='MAL-ENCH-messagecontent'>" + message.message + "</div>";
                toAppend += "</div><hr>";
                messagePanel.append(toAppend);
                if ($.inArray(message.from, namesToFind) == -1) {
                    namesToFind.push(message.from);
                }
            }

            //Messages have been prettyprinted here


            //Popout Functionality
            parent.find(".normal_header").wrapInner('<p style="display: inline;"></p>');
            parent.find(".normal_header").append('<a id="MAL-ENCH-messagehistorypop" style="display: inline;float: right;cursor:pointer;">Popout  <i class="fa fa-external-link" aria-hidden="true"></i></a>');

            $("#MAL-ENCH-messagehistorypop").click(function () {
                var w = window.open('', "", "scrollbars=yes");
                $(w.document.head).append("<title>Message History ~ MAL ENHANCER ~</title><style>body{padding:5px;}</style>");


                //Includes all style from MAL
                $("head link").each(function () {
                    if ($(this).attr("rel") == "stylesheet") {
                        $(w.document.head).append('<link rel="stylesheet" type="text/css" href="' + $(this).attr("href") + '">');
                    }
                });



                //Include Custom Stylesheet
                $(w.document.head).append('<link rel="stylesheet" type="text/css" href="' + chrome.runtime.getURL("style.css") + '">');
                //$(w.document.body).html($("#MAL-ENCH-messagepanel").html());
                $(w.document.body).html(parent.html());
                $(w.document.body).addClass("page-common");
                $(w.document.body).find("#MAL-ENCH-messagehistorypop").remove();
                $(w.document.body).find(".MAL-ENCH-parseHTML").remove();
                $(w.document.body).find(".MAL-ENCH-message").css("min-height", "193px");
            });

            //Message stats
            parent.find(".normal_header").prepend('<a id="MAL-ENCH-showstats" class="noselect" style="display: block;text-align:center;cursor:pointer;">Show Stats  <i class="fa fa-line-chart" aria-hidden="true"></i></a>');
            $("#MAL-ENCH-showstats").after("<div class='MAL-ENCH-messagestats'></div>");
            var toAppend = "";
            toAppend += "<p>Messages sent: <b id='MAL-ENCH-messagestats-sent'></b></p>";
            toAppend += "<p>Total Words: <b id='MAL-ENCH-messagestats-words'></b></p>";
            toAppend += "<p>Total Characters: <b id='MAL-ENCH-messagestats-chars'></b></p>";
            toAppend += "<p>Convsersation started: <b id='MAL-ENCH-messagestats-started'></b></p>";
            $(".MAL-ENCH-messagestats").append(toAppend);

            $("#MAL-ENCH-messagestats-sent").text(delimitNumbers(messages.length));
            var words = 0;
            var chars = 0;
            for (var i in messages) {
                words += messages[i].message.split(" ").length;
                chars += messages[i].message.length;
            }


            $("#MAL-ENCH-messagestats-words").text(delimitNumbers(words));
            $("#MAL-ENCH-messagestats-chars").text(delimitNumbers(chars));
            $("#MAL-ENCH-messagestats-started").text(messages[messages.length - 1].date);


            $("#MAL-ENCH-showstats").click(function () {
                $(".MAL-ENCH-messagestats").first().stop().slideToggle();
            });


            chrome.storage.sync.get("knownPBUrls", function (data) {
                knownNames = data.knownPBUrls;
                if (knownNames === undefined) {
                    knownNames = {};
                }
                for (var name in namesToFind) {
                    insertName(namesToFind[name], knownNames);
                }
                setTimeout(function () {
                    if (changes) {
                        console.log("SAVING KNOWNNAMES!!");
                        console.log(knownNames);
                        chrome.storage.sync.set({
                            "knownPBUrls": knownNames
                        }, function () {
                            console.log("Successfully updated profile url to img translation database.");
                        });
                    }
                }, 5000);

            });

        }
    });
}

function insertName(name, knownNames) {
    console.log("RUNNING AT: " + name);
    if (knownNames === undefined || knownNames[name] === undefined) {
        console.log(name + " was not a known name!!");
        $.get("https://myanimelist.net/profile/" + name, function (data) {
            var imgLink = $(data).find(".user-profile .user-image img").attr("data-src");
            console.log("Resolved " + name + " to " + imgLink);
            $(".findmypic[name='" + name + "']").attr("src", imgLink);
            $(".findmypic[name='" + name + "']").removeClass("findmypic");
            knownNames[name] = imgLink;
            changes = true;

        });
    } else {
        console.log(name + " was a known name!! HURRAY");
        $(".findmypic[name='" + name + "']").attr("src", knownNames[name]);
    }
}

function getAllStorage() {
    chrome.storage.sync.get(function (data) {
        console.log(data);
    });
}

function resetKnownNames() {
    chrome.storage.sync.set({
        "knownPBUrls": {}
    }, function () {
        console.log("Reset all known names.");
    });

}