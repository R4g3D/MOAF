var logUser = function(s) {
  var username = document.getElementById("username");
  username.innerHTML += s;
}

var logFriend = function(s) {
  var friends = document.getElementById("friends");
  friends.innerHTML += "<li>" + s + "</li>";
}

window.onload = function() {
  chrome.windows.getCurrent(function (currWindow) {
    chrome.tabs.query({active: true, windowId: currWindow.id}, function(actTabs) {
      var activeURL = actTabs[0].url;
      // if (activeURL.search("facebook") != -1) {
      //   log("Facebook");
      // }
    });
  });
};
