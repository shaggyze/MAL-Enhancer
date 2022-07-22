chrome.runtime.onMessage.addListener(
  function(message, sender, sendResponse) {
    if (message.enableAddon == true){
      chrome.pageAction.show(sender.tab.id);
    }
    if (message.enableAddon == false){
      chrome.pageAction.hide(sender.tab.id);
    }
    sendResponse();
  }
);