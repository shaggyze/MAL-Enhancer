function parseBBCode(htmlCode) {

    var output = htmlCode;
    //Export all the easy stuff
    output = output.replaceAll("<br>", "");
    output = output.replaceAll("<br/>", "");
    output = output.replaceAll("<br />", "");
    output = output.replaceAll("<b>", "[b]");
    output = output.replaceAll("</b>", "[/b]");
    output = output.replaceAll("<i>", "[i]");
    output = output.replaceAll("</i>", "[/i]");
    output = output.replaceAll("<u>", "[u]");
    output = output.replaceAll("</u>", "[/u]");

    output = output.replaceAll("<div class=\"codetext\"><pre>", "[code]");
    output = output.replaceAll("</pre></div>", "[/code]");


    //Now the hard stuff!
    
    removeTags(output);
}

String.fromHtmlEntities = function(string) {
    return (string+"").replace(/&#\d+;/gm,function(s) {
        return String.fromCharCode(s.match(/\d+/gm)[0]);
    })
};
var debugParsing = true;
var running = 0;
function removeTags(htmlData){
    var obj = $("<malench>" + htmlData + "</malench>").children();
    //console.log(obj);
    running++;
    if(running > 1000){
        var w = window.open('', "", "scrollbars=yes,width=800,height=450");
        $(w.document.head).append("<title>EXTRACTING RESULT ~ MAL ENHANCER ~</title><style>body{padding:5px;}</style>");
        $(w.document.body).append("<h1>Extracting failed:</h1>");
        $(w.document.body).append("<textarea rows='15' cols='90'>The message was either too long (more than 1000 tags), or contained unsolveable HTML. Please report this, along with the message you tried to export, to the developer!</textarea>");
        return;
    }
    
    if(obj.length > 0){
        var workWith = $(obj[0].outerHTML);
        if(debugParsing){
            console.log("Now I will attempt to remove: ");
            console.log(workWith.prop("tagName"));
            console.log(workWith.attr("style"));
        }
        if(workWith.prop("tagName") == "BR"){
            console.log("I SHOULD KILL MYSELF!");
            htmlData = htmlData.replaceAll(obj[0].outerHTML, "");
            console.log(htmlData);
            //removeTags(htmlData);
            return;
        }
        
        //First we find out what it is we're working with.
        if(workWith.prop("tagName") == "IFRAME"){ //a YT video
            var replaceWith = "[yt]" + workWith.attr("src").split("/embed/")[1].substr(0,11) + "[/yt]";
            htmlData = htmlData.replaceAll(obj[0].outerHTML, replaceWith);
            removeTags(htmlData);

            return;
        }
        
        if(workWith.prop("tagName") == "UL"){ //a fucking lortelist
            var replaceWith = "[list]";
            workWith.children("li").each(function(){
               replaceWith+="[*]" + $(this).html(); 
            });
            replaceWith += "[/list]";
            
            htmlData = htmlData.replaceAll(obj[0].outerHTML, replaceWith);
            removeTags(htmlData);

            return;
        }
        
        if(workWith.prop("tagName") == "SPAN"){ //Either Color Change or Font Size, 
            if(workWith.attr("style").startsWith("color:")){//Color change
                var replaceWith = "[color="+workWith.attr("style").substr(7)+"]" + workWith.html() + "[/color]";
                htmlData = htmlData.replaceAll(obj[0].outerHTML, replaceWith);
                removeTags(htmlData);
            }else if(workWith.attr("style").startsWith("font-size:")){ //Font size
                var replaceWith = "[size="+workWith.css("font-size").substr(0,workWith.css("font-size").length-1)+"]" + workWith.html() + "[/size]";
                htmlData = htmlData.replaceAll(obj[0].outerHTML, replaceWith);
                removeTags(htmlData);
            }else if(workWith.attr("style").startsWith("text-decoration:line-through")){ //Font size
                var replaceWith = "[s]" + workWith.html() + "[/s]";
                htmlData = htmlData.replaceAll(obj[0].outerHTML, replaceWith);
                removeTags(htmlData);
            }

            return;
        }
        
        
        if(workWith.prop("tagName") == "DIV"){ //More or less everything else
			console.log(workWith.html())
            if(workWith.hasClass("quotetext")){ //quotes
				var replaceWith = "[quote]" + workWith.first().html() + "[/quote]";
				htmlData = htmlData.replaceAll(obj[0].outerHTML, replaceWith);
				removeTags(htmlData);
            }else if(workWith.hasClass("spoiler")){ //Spoiler
                var content = workWith.find(".spoiler_content").first().html();
                var name = workWith.find("input").first().attr("data-showname").substr(5);
                var replaceWith = "[spoiler=\""+name+"\"]" + content + "[/spoiler]";
                htmlData = htmlData.replaceAll(obj[0].outerHTML, replaceWith);
                removeTags(htmlData);
            }else if(workWith.attr("style").endsWith("center;")){//Align center
                var replaceWith = "[center]" + workWith.html() + "[/center]";
                htmlData = htmlData.replaceAll(obj[0].outerHTML, replaceWith);
                removeTags(htmlData);
            }else if(workWith.attr("style").endsWith("right;")){//Align right
                var replaceWith = "[right]" + workWith.html() + "[/right]";
                htmlData = htmlData.replaceAll(obj[0].outerHTML, replaceWith);
                removeTags(htmlData);
            }

            return;
        }
        
        if(workWith.prop("tagName") == "A"){ //Links
            var replaceWith = "[url="+workWith.attr("href")+"]" + workWith.html() + "[/url]";
            htmlData = htmlData.replaceAll(obj[0].outerHTML, replaceWith);
            removeTags(htmlData);
            return;
        }
        
        if(workWith.prop("tagName") == "IMG"){ //Images
		var src = workWith.attr("src");
		if (src === undefined){
            src = workWith.attr("src2");
        }
		var imgclass = workWith.attr("class")
		if (imgclass === "userimg") {
            var replaceWith = "[img]"+src+"[/img]";
            htmlData = htmlData.replaceAll(obj[0].outerHTML, replaceWith);
            removeTags(htmlData);
            return;
		} else if (imgclass === "userimg img-a-l") {
            var replaceWith = "[img align=left]"+src+"[/img]";
            htmlData = htmlData.replaceAll(obj[0].outerHTML, replaceWith);
            removeTags(htmlData);
            return;
		} else if (imgclass === "userimg img-a-r") {
            var replaceWith = "[img align=right]"+src+"[/img]";
            htmlData = htmlData.replaceAll(obj[0].outerHTML, replaceWith);
            removeTags(htmlData);
            return;
		} else {
		    var replaceWith = "[img]"+src+"[/img]";
            htmlData = htmlData.replaceAll(obj[0].outerHTML, replaceWith);
            removeTags(htmlData);
            return;
		}
        }
        
        //I don't know what the fuck to do. 
        htmlData = htmlData.replaceAll(obj[0].outerHTML, "");
        removeTags(htmlData);
        return;
    } else {
        console.log("I'M DONE PARSING!!!!");
        htmlData = $('<textarea />').html(htmlData).text().trim(); //Convert entitys back
        //console.log(htmlData);
        
        var w = window.open('', "", "scrollbars=yes,width=680,height=320");
        $(w.document.head).append("<title>EXTRACTING RESULT ~ MAL ENHANCER ~</title><style>body{padding:5px;}</style>");
        $(w.document.body).append("<h1>Extracting result:</h1>");
        $(w.document.body).append("<textarea rows='15' cols='90'>"+htmlData+"</textarea>");
    }
    
}
