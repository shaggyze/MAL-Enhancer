

$(document).on('click','.editorButton',function () {
	if (bbcodehelper) {
		var action = $(this).attr("action");
		console.info("Button action: " + action);
		switch (action) {
            case "bold": wrapText("[b]", "[/b]"); break;
            case "italics": wrapText("[i]", "[/i]"); break;
            case "underline": wrapText("[u]", "[/u]"); break;
            case "strike": wrapText("[s]", "[/s]"); break;
            case "center": wrapText("[center]", "[/center]"); break;
            case "right": wrapText("[right]", "[/right]"); break;
            case "textcolor": askFor("Text Color:", "color", this, "[color=%s]","[/color]", "wrapText"); break;
            case "textsize": askFor("Text Size: (In %) <b>Default:</b> 100", "number", this, "[size=%s]", "[/size]", "wrapText"); break;
            case "insertlink": askFor("URL:", "url", this, "[url=%s]", "[/url]", "wrapText"); break;
            case "insertyoutube": askFor("Youtube Link OR ID:", "url", this, "[yt]%s[/yt]", "nada", "insertText"); break;
            case "insertImage": askFor("Image Url:", "url", this, "[img]%s[/img]", "nada", "insertText"); break;
			case "insertImageLeft": askFor("Image Url:", "url", this, "[img align=left]%s[/img]", "nada", "insertText"); break;
			case "insertImageRight": askFor("Image Url:", "url", this, "[img align=right]%s[/img]", "nada", "insertText"); break;
            case "code": wrapText("[code]", "[/code]"); break;
            case "quote": wrapText("[quote]", "[/quote]"); break;
            case "spoiler": askFor("Spoiler Name:", "text", this, "[spoiler=\"%s\"]", "[/spoiler]", "wrapText"); break;
			case "list": wrapText("[list][*]", "[/list]"); break;
			case "list=1": wrapText("[list=1][*]", "[/list]"); break;
			case "*": wrapText("[*]", ""); break;

		}



	}
});


function askFor(something, withType, onWhat, then, after, doWhat) {
    var whereX = $(onWhat).position().left.toFixed(0);
    var whereY = ($(onWhat).position().top + $(onWhat).height()+10).toFixed(0);
    $("#MAL-ENCH-removeMeSoonPls").remove();
    setTimeout(function () {
        var value = "";
        if(withType == "color"){
            value = "#ff0000";
        }
        $("#content").append("<div id='MAL-ENCH-removeMeSoonPls' class='prompter' style='left:" + whereX + "px; top:" + whereY + "px;'><p>" + something + "</p><input class='inputtext' value='"+value+"' type='" + withType+"'><button start='" + then + "' close='" + after +"' action='"+doWhat+"' class='prompterButton'>OK</button></div>");
        $("#MAL-ENCH-removeMeSoonPls input").focus();
    }, 100);
}

function insertText(text) {
    if (bbcodehelper && messageTextArea !== null) {
        var startCaret = messageTextArea.prop("selectionStart");
        var message = messageTextArea.val();
        message = message.substr(0, startCaret) + text + message.substr(startCaret);
        startCaret = startCaret + text.length;
        messageTextArea.val(message);
        setSelectionRange(document.getElementsByClassName("MAL-ENCH-theEditor")[0], startCaret, startCaret);
    }
}

function wrapText(start, close) {
    if (bbcodehelper && messageTextArea !== null) {
		var startCaret = messageTextArea.prop("selectionStart");
		var endCaret = messageTextArea.prop("selectionEnd");
        var message = messageTextArea.val();
        var selected = message.substr(startCaret, endCaret - startCaret);
        if (selected.startsWith(start) && selected.endsWith(close)) { //Checks if should be removed
			message = message.substr(0, startCaret) + selected.slice(start.length).substr(0, selected.length - close.length - start.length) + message.substr(endCaret);
			startCaret = startCaret;
            endCaret = endCaret - close.length+ start.length;
        } else if (message.substr(startCaret - start.length, start.length) == start && message.substr(endCaret, close.length) == close ) { 
            message = message.substr(0, startCaret - start.length) + selected + message.substr(endCaret + close.length);
            startCaret = startCaret - start.length;
            endCaret = endCaret - start.length;
        } else {
            message = message.substr(0, startCaret) + start + selected + close + message.substr(endCaret);
            startCaret = startCaret + start.length;
            endCaret = endCaret + start.length;
		}
		messageTextArea.val(message);
		setSelectionRange(document.getElementsByClassName("MAL-ENCH-theEditor")[0], startCaret, endCaret);
	}
}

