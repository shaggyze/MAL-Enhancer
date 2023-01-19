var debugParsing = true;
var running = 0;
function parseBBCode(htmlCode) {

if (htmlCode !== undefined) {
    var output = htmlCode;
	if(debugParsing){console.log(output)};
    //Export all the easy stuff
	//if (output.match("<br") !== null) {
    //output = output.replaceAll("<br>", "");
    //output = output.replaceAll("<br/>", "");
    //output = output.replaceAll("<br />", "");
	//}
	if (output.match("<b") !== null) {
    output = output.replaceAll("<b>", "[b]");
	}
	if (output.match("/b") !== null) {
    output = output.replaceAll("</b>", "[/b]");
	}
	if (output.match("<strong") !== null) {
    output = output.replaceAll("<strong>", "");
	}
	if (output.match("</strong") !== null) {
    output = output.replaceAll("</strong>", "");
	}
	if (output.match("<i") !== null) {
    output = output.replaceAll("<i>", "[i]");
	}
	if (output.match("/i") !== null) {
    output = output.replaceAll("</i>", "[/i]");
	}
	if (output.match("<u") !== null) {
    output = output.replaceAll("<u>", "[u]");
	}
	if (output.match("/u") !== null) {
    output = output.replaceAll("</u>", "[/u]");
	}
	if (output.match("<sub") !== null) {
    output = output.replaceAll("<sub>", "[sub]");
	}
	if (output.match("/sub") !== null) {
    output = output.replaceAll("</sub>", "[/sub]");
	}
	if (output.match("<sup") !== null) {
    output = output.replaceAll("<sup>", "[sup]");
	}
	if (output.match("/sup") !== null) {
    output = output.replaceAll("</sup>", "[/sup]");
	}
	if (output.match("<hr") !== null) {
    output = output.replaceAll("<hr>", "[hr]");
	}
	if (output.match("<table") !== null) {
    output = output.replaceAll('<table class="bbcode-table"><tbody>', "[table]");
	}
	if (output.match("</table") !== null) {
    output = output.replaceAll("</tbody></table>", "[/table]");
	}
	if (output.match("<tbody") !== null) {
    output = output.replaceAll("<tbody><tr><td>", "");
	}
	if (output.match("</tbody") !== null) {
    output = output.replaceAll("</td></tr></tbody>", "");
	}
	if (output.match("<tr") !== null) {
    output = output.replaceAll("<tr>", "[tr]");
	}
	if (output.match("/tr>") !== null) {
    output = output.replaceAll("</tr>", "[/tr]");
	}
	if (output.match("<td") !== null) {
    output = output.replaceAll("<td>", "[td]");
	}
	if (output.match("/td>") !== null) {
    output = output.replaceAll("</td>", "[/td]");
	}
	if (output.match("><pre>") !== null) {
    output = output.replaceAll("><pre>", ">");
	}
	if (output.match("</pre><") !== null) {
    output = output.replaceAll("</pre><", "<");
	}
	if (output.match("<pre") !== null) {
    output = output.replaceAll("<pre>", "[pre]");
	}
	if (output.match("</pre") !== null) {
    output = output.replaceAll("</pre>", "[/pre]");
	}

    //Now the hard stuff!
    
    removeTags(output);
}
}
String.fromHtmlEntities = function(string) {
    return (string+"").replace(/&#\d+;/gm,function(s) {
        return String.fromCharCode(s.match(/\d+/gm)[0]);
    })
};

function removeTags(htmlData){
    var obj = $("<malench>" + htmlData + "</malench>").children();
    if(debugParsing){console.log(obj)};
    running++;
    if(running > 1000){
        var w = window.open('', "", "scrollbars=yes,width=800,height=450");
        $(w.document.head).append("<title>EXTRACTING RESULT ~ MAL ENHANCER ~</title><style>body{padding:5px;}</style>");
        $(w.document.body).append("<h1>Extracting failed:</h1>");
        $(w.document.body).append("<textarea rows='15' cols='90'>The message was either too long (more than 1000 loops), or contained unsolveable HTML. Please report this, along with the message you tried to export, to the developer!"+htmlData+"</textarea>");
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
            removeTags(htmlData);
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
			if(debugParsing){console.log(workWith.html())};
            var replaceWith = "[list]";
            workWith.children("li").each(function(){
               replaceWith+="[*]" + $(this).html(); 
            });
            replaceWith += workWith.first().html() + "[/list]";
            
            htmlData = htmlData.replaceAll(obj[0].outerHTML, replaceWith);
            removeTags(htmlData);

            return;
        }
		
        if(workWith.prop("tagName") == "OL"){ //a fucking lortelist
            var replaceWith = "[list=1]";
            workWith.children("li").each(function(){
               replaceWith+="[*]" + $(this).html(); 
            });
            replaceWith += workWith.first().html() + "[/list]";
            
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
			}else if(workWith.attr("style").startsWith("font-family:")){ //Font family
                var replaceWith = "[font="+workWith.css("font-family").substr(0,workWith.css("font-family").length)+"]" + workWith.html() + "[/font]";
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
			if(debugParsing){console.log(workWith.html())};
			if(workWith.hasClass("quotetext")){ //quotes
				var user = workWith.attr("data-user");
				var id = workWith.attr("data-id");
				if (!user === undefined){
				  var replaceWith = "[quote=" + user + " message=" + id + "]" + workWith.first().html() + "[/quote]";
				} else {
				  var replaceWith = "[quote]" + workWith.first().html() + "[/quote]";
				}
				htmlData = htmlData.replaceAll(obj[0].outerHTML, replaceWith);
				removeTags(htmlData);
            }else if(workWith.hasClass("spoiler")){ //Spoiler
                var content = workWith.find(".spoiler_content").first().html();
                var name = workWith.find("input").first().attr("data-showname").substr(5);
                var replaceWith = "[spoiler=\""+name+"\"]" + content + "[/spoiler]";
                htmlData = htmlData.replaceAll(obj[0].outerHTML, replaceWith);
                removeTags(htmlData);
			}else if(workWith.hasClass("hide_button")){ //Spoiler
                var content = workWith.find(".spoiler_content").first().html();
                var replaceWith = "[spoiler=\"Expand quote\"]" + content + "[/spoiler]";
                htmlData = htmlData.replaceAll(obj[0].outerHTML, replaceWith);
                removeTags(htmlData);
			}else if(workWith.hasClass("codetext")){ //codes
				var replaceWith = "[code]" + workWith.first().html() + "[/code]";
				htmlData = htmlData.replaceAll(obj[0].outerHTML, replaceWith);
				removeTags(htmlData);
			}else{
			if(!workWith.attr("style") === "undefined"){
				htmlData = htmlData.replaceAll(obj[0].outerHTML, "");
				removeTags(htmlData);
			}else if(workWith.attr("style").startsWith("margin:")){//margin
			    htmlData = htmlData.replaceAll(obj[0].outerHTML, "");
				removeTags(htmlData);
			}else if(workWith.attr("style").startsWith("padding:")){//padding
			    htmlData = htmlData.replaceAll(obj[0].outerHTML, "");
				removeTags(htmlData);
            }else if(workWith.attr("style").endsWith("center;")){//Align center
                var replaceWith = "[center]" + workWith.html() + "[/center]";
                htmlData = htmlData.replaceAll(obj[0].outerHTML, replaceWith);
                removeTags(htmlData);
			}else if(workWith.attr("style").endsWith("justify;")){//Align justify
                var replaceWith = "[justify]" + workWith.html() + "[/justify]";
                htmlData = htmlData.replaceAll(obj[0].outerHTML, replaceWith);
                removeTags(htmlData);
            }else if(workWith.attr("style").endsWith("right;")){//Align right
                var replaceWith = "[right]" + workWith.html() + "[/right]";
                htmlData = htmlData.replaceAll(obj[0].outerHTML, replaceWith);
                removeTags(htmlData);
            }else{
				htmlData = htmlData.replaceAll(obj[0].outerHTML, "");
				removeTags(htmlData);
			}
			}
            return;
        }
        
        if(workWith.prop("tagName") == "IMG"){ //Images
		if(debugParsing){console.log(workWith.html())};
		var src = workWith.attr("src");
		if (src === undefined){
            src = workWith.attr("src2");
        }
		var style = workWith.attr("style");
		if (!style === undefined){
			style = style.replaceAll("width:", "");
			style = style.replaceAll("height:", "");
			style = style.replaceAll("px", "");
			style = style.replaceAll(";", "x");
			style = style.slice(0,-1);;
        }
		var alt = workWith.attr("alt");
		if (alt === undefined){
            alt = "Broken Image";
        }
		var title = workWith.attr("title");
		if (title === undefined){
            title = "Image";
        }
		var imgclass = workWith.attr("class");
		if (imgclass === "userimg") {
			if (!style === undefined){
              var replaceWith = '[img='+style+' alt="'+alt+'" title="'+title+'"]'+src+'[/img]';
			} else {
			  var replaceWith = '[img alt="'+alt+'" title="'+title+'"]'+src+'[/img]';
			}
            htmlData = htmlData.replaceAll(obj[0].outerHTML, replaceWith);
            removeTags(htmlData);
            return;
		} else if (imgclass === "userimg img-a-l") {
			if (!style === undefined){
              var replaceWith = '[img='+style+' alt="'+alt+'" title="'+title+'" align=left]'+src+'[/img]';
			} else {
			  var replaceWith = '[img alt="'+alt+'" title="'+title+'" align=left]'+src+'[/img]';
			}
            htmlData = htmlData.replaceAll(obj[0].outerHTML, replaceWith);
            removeTags(htmlData);
            return;
		} else if (imgclass === "userimg img-a-r") {
			if (!style === undefined){
              var replaceWith = '[img='+style+' alt="'+alt+'" title="'+title+'" align=right]'+src+'[/img]';
			} else {
			  var replaceWith = '[img alt="'+alt+'" title="'+title+'" align=right]'+src+'[/img]';
			}
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
        
		if(workWith.prop("tagName") == "A"){ //Links
            var replaceWith = "[url="+workWith.attr("href")+"]" + workWith.html() + "[/url]";
            htmlData = htmlData.replaceAll(obj[0].outerHTML, replaceWith);
            removeTags(htmlData);
            return;
        }
		
        //I don't know what the fuck to do. 
        htmlData = htmlData.replaceAll(obj[0].outerHTML, "");
        removeTags(htmlData);
        return;
    } else {
        console.log("I'M DONE PARSING!!!!");
        htmlData = $('<textarea />').text(htmlData).text().trim(); //Convert entitys back
        if(debugParsing){console.log(htmlData)};
        
        var w = window.open('', "", "scrollbars=yes,width=680,height=320");
        $(document.head).append("<title>EXTRACTING RESULT ~ MAL ENHANCER ~</title><style>body{padding:5px;}</style>");
        $(document.body).append("<h1>Extracting result:</h1>");
        $(document.body).append("<textarea rows='15' cols='90'>"+htmlData+"</textarea>");
    }
    
}
