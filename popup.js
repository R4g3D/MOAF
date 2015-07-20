var log = function(s) {
  var out = document.getElementById("logging");
  out.innerHTML += "<li>" + s + "</li>";
}

window.onload = function() {
  chrome.windows.getCurrent(function (currWindow) {
    chrome.tabs.query({active: true, windowId: currWindow.id}, function(actTabs) {
      //log(actTabs.length);
      //log(actTabs[0].url);
      var activeURL = actTabs[0].url;
      if (activeURL.search("facebook") != -1) {
        log("Facebook");
      }
    });
  });

  // chrome.windows.getCurrent(function (currentWindow) {
  //   chrome.tabs.query({active: true, windowId: currentWindow.id}, function(activeTabs) {
  //     chrome.tabs.executeScript(activeTabs[0].id, {file: 'add_dislike.js', allFrames: true});
  //   });
  // });

};
